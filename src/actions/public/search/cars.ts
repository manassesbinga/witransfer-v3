"use server";

import { Car, SearchFilters, SearchResponse, Supplier } from "@/types/cars";
import { unstable_cache } from "next/cache";
import { createPublicAction } from "@/middlewares/actions/action-factory";
import db from "@/data/db.json";

// Data references
const carsData = (db.cars || []) as unknown as Car[];
const categoriesData = db.categories || [];
const extrasData = db.extras || [];

// --- Internal Helper Functions ---

async function getCoords(
  location: string,
): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&countrycodes=ao`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "WiTransfer-App" },
    });
    const data = await resp.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error("Geocoding error:", e);
  }
  return null;
}

async function calculateDistance(
  origin?: string,
  destination?: string,
): Promise<number> {
  if (!origin || !destination) return 30;

  const coords1 = await getCoords(origin);
  const coords2 = await getCoords(destination);

  if (coords1 && coords2) {
    try {
      const url = `http://router.project-osrm.org/route/v1/driving/${coords1.lon},${coords1.lat};${coords2.lon},${coords2.lat}?overview=false`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.routes && data.routes[0]) {
        return Math.round(data.routes[0].distance / 1000);
      }
    } catch (e) {
      console.error("OSRM error:", e);
    }

    const R = 6371;
    const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
    const dLon = ((coords2.lon - coords1.lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coords1.lat * Math.PI) / 180) *
        Math.cos((coords2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  const base = 15;
  const variant = (origin.length + destination.length) % 20;
  return base + variant;
}

// --- Core Logic Functions (Internal for Actions and API Routes) ---

export async function searchCarsInternal(
  filters: SearchFilters,
): Promise<SearchResponse> {
  console.log("\n--- [SEARCH REQUEST] ---");
  console.log(
    `Type: ${filters.type || "rental"} | Pickup: ${filters.pickup || "None"}`,
  );
  console.log(
    `Filters: ${JSON.stringify({ cat: filters.categories, loc: filters.loc, sup: filters.sup, passengers: filters.passengers, luggage: filters.luggage })}`,
  );

  const { limit = 10, offset = 0 } = filters;
  let results = [...carsData] as Car[];
  let filterReason = "";

  const searchType = filters.type || "rental";
  const beforeType = results.length;

  results = results.filter((car) => {
    // Suporte para ambos os formatos de disponibilidade
    if (car.availableFor) {
      if (searchType === "rental")
        return car.availableFor === "rental" || car.availableFor === "both";
      return car.availableFor === "transfer" || car.availableFor === "both";
    }

    // Fallback para serviceTypes (usado no painel admin)
    if ((car as any).serviceTypes) {
      return (car as any).serviceTypes.includes(searchType);
    }

    return false; // Se não tiver nenhum, esconde
  });

  if (results.length === 0 && beforeType > 0)
    filterReason = `Filtered by type (${searchType})`;

  if (filters.pickup && filters.type !== "transfer" && results.length > 0) {
    const q = filters.pickup.toLowerCase();
    const keywords = q.split(/[\s,]+/).filter((k) => k.length > 2);
    const beforeLoc = results.length;

    results = results.filter((car) => {
      const locName = (car.locationName || "").toLowerCase();
      const carName = car.name.toLowerCase();

      if (locName.includes(q) || q.includes(locName) || carName.includes(q))
        return true;

      return keywords.some((word) => locName.includes(word));
    });

    if (results.length === 0 && beforeLoc > 0)
      filterReason = `No match for location zone: "${filters.pickup}"`;
  }

  if (
    filters.categories &&
    filters.categories.length > 0 &&
    results.length > 0
  ) {
    const before = results.length;
    results = results.filter((car) => filters.categories?.includes(car.type));
    if (results.length === 0 && before > 0)
      filterReason = "Selected categories not available";
  }

  if (filters.loc && filters.loc.length > 0)
    results = results.filter((car) => filters.loc?.includes(car.locationType));
  if (filters.sup && filters.sup.length > 0)
    results = results.filter((car) => filters.sup?.includes(car.supplier));
  if (filters.trans && filters.trans.length > 0)
    results = results.filter((car) =>
      filters.trans?.includes(car.transmission),
    );

  if (filters.seats && filters.seats.length > 0) {
    results = results.filter((car) => {
      if (filters.seats?.includes("6+")) return car.seats >= 6;
      return filters.seats?.includes(car.seats.toString());
    });
  }

  // Sistema de recomendação inteligente para passageiros e malas
  let needsMultipleVehicles = false;
  let recommendationInfo: any = null;

  if (filters.type === "transfer") {
    const passengerCount =
      typeof filters.passengers === "string"
        ? parseInt(filters.passengers)
        : filters.passengers || 0;

    const luggageCount =
      typeof filters.luggage === "string"
        ? parseInt(filters.luggage)
        : filters.luggage || 0;

    // Verificar se algum carro individual pode atender
    const maxSeats = Math.max(...results.map((car) => car.seats));
    const maxLuggage = Math.max(
      ...results.map((car) => {
        const match = car.luggage.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      }),
    );

    // Se exceder capacidade de um único veículo
    if (passengerCount > maxSeats || luggageCount > maxLuggage) {
      needsMultipleVehicles = true;

      // Calcular quantos veículos são necessários
      const vehiclesNeededForPassengers = Math.ceil(passengerCount / maxSeats);
      const vehiclesNeededForLuggage = Math.ceil(luggageCount / maxLuggage);
      const vehiclesNeeded = Math.max(
        vehiclesNeededForPassengers,
        vehiclesNeededForLuggage,
      );

      recommendationInfo = {
        needsMultiple: true,
        totalPassengers: passengerCount,
        totalLuggage: luggageCount,
        vehiclesNeeded,
        maxSeatsPerVehicle: maxSeats,
        maxLuggagePerVehicle: maxLuggage,
        message: `ATENÇÃO: Para ${passengerCount} passageiros e ${luggageCount} malas, recomendamos ${vehiclesNeeded} veículos.`,
      };

      // Marcar carros como recomendados e adicionar informação
      results = results.map((car) => {
        const carLuggageMatch = car.luggage.match(/\d+/);
        const carLuggageCapacity = carLuggageMatch
          ? parseInt(carLuggageMatch[0])
          : 0;

        return {
          ...car,
          isRecommendedForMultiple: true,
          capacityInfo: {
            seats: car.seats,
            luggage: carLuggageCapacity,
          },
        };
      });

      // Ordenar por capacidade (maiores primeiro)
      results.sort((a, b) => {
        const aCapacity = a.seats + (a.capacityInfo?.luggage || 0);
        const bCapacity = b.seats + (b.capacityInfo?.luggage || 0);
        return bCapacity - aCapacity;
      });
    } else {
      // Filtragem normal quando um único veículo pode atender
      if (!isNaN(passengerCount) && passengerCount > 0) {
        results = results.filter((car) => car.seats >= passengerCount);
      }

      if (!isNaN(luggageCount) && luggageCount > 0) {
        results = results.filter((car) => {
          const carLuggageMatch = car.luggage.match(/\d+/);
          if (carLuggageMatch) {
            const carLuggageCapacity = parseInt(carLuggageMatch[0]);
            return carLuggageCapacity >= luggageCount;
          }
          return true;
        });
      }
    }
  }

  if (filters.type === "transfer") {
    const distance = await calculateDistance(filters.pickup, filters.dropoff);
    results = results.map((car) => {
      const catInfo = categoriesData.find((c) => c.id === car.type);
      const usedRate =
        car.pricePerKm || (catInfo ? (catInfo as any).pricePerKm : 1000);
      const totalPrice = Math.round(distance * usedRate);

      const currentExtras = car.extras || [];
      const updatedExtras = currentExtras.includes("driver")
        ? currentExtras
        : [...currentExtras, "driver"];

      return {
        ...car,
        price: totalPrice,
        distanceString: `${distance} km`,
        pricePerKm: usedRate,
        hasAC: true,
        extras: updatedExtras,
      };
    });
  }

  if (filters.spec && filters.spec.length > 0) {
    results = results.filter((car) => {
      const needsAC = filters.spec?.includes("ac");
      return needsAC ? car.hasAC : true;
    });
  }

  if (filters.extras && filters.extras.length > 0) {
    results = results.filter((car) =>
      filters.extras?.every((extra) => car.extras?.includes(extra)),
    );
  }

  if (filters.mileage && filters.mileage.length > 0)
    results = results.filter((car) => filters.mileage?.includes(car.mileage));

  if (filters.price_range && filters.price_range.length > 0) {
    results = results.filter((car) => {
      return filters.price_range?.some((range) => {
        const p = car.price;
        if (range === "0-50000") return p <= 50000;
        if (range === "50000-100000") return p > 50000 && p <= 100000;
        if (range === "100000-150000") return p > 100000 && p <= 150000;
        if (range === "150000-200000") return p > 150000 && p <= 200000;
        if (range === "200000+") return p > 200000;
        return false;
      });
    });
  }
  const facets: Record<string, Record<string, number>> = {
    loc: {},
    sup: {},
    trans: { automatico: 0, manual: 0 },
    cat: {},
    spec: { ac: 0 },
    mileage: { limited: 0, unlimited: 0 },
    seats: { "4": 0, "5": 0, "6+": 0 },
    electric: { full: 0, hybrid: 0, "plug-in": 0 },
    extras: {
      driver: 0,
      insurance: 0,
      limpeza: 0,
      wifi: 0,
      gps: 0,
      baby_seat: 0,
    },
    price_range: {
      "0-50000": 0,
      "50000-100000": 0,
      "100000-150000": 0,
      "150000-200000": 0,
      "200000+": 0,
    },
    score: { "9": 0, "8": 0, "7": 0 },
    pay: { now: 0, pickup: 0 },
    deposit: { "0-6250": 0, "6250-12500": 0, "12500+": 0 },
    fuel: { like: 0 },
  };

  const baseForFacets = filters.pickup
    ? carsData
        .filter((car) => {
          // Suporte para ambos os formatos de disponibilidade
          if (car.availableFor) {
            if (searchType === "rental") {
              if (car.availableFor !== "rental" && car.availableFor !== "both")
                return false;
            } else {
              if (
                car.availableFor !== "transfer" &&
                car.availableFor !== "both"
              )
                return false;
            }
          } else if ((car as any).serviceTypes) {
            if (!(car as any).serviceTypes.includes(searchType)) return false;
          } else {
            return false;
          }

          const q = filters.pickup!.toLowerCase();
          const keywords = q.split(/[\s,]+/).filter((k) => k.length >= 3);
          const locName = (car.locationName || "").toLowerCase();
          const carName = car.name.toLowerCase();

          return (
            locName.includes(q) ||
            q.includes(locName) ||
            carName.includes(q) ||
            keywords.some((k) => locName.includes(k))
          );
        })
        .filter((car) => {
          if (car.availableFor) {
            if (searchType === "rental")
              return (
                car.availableFor === "rental" || car.availableFor === "both"
              );
            return (
              car.availableFor === "transfer" || car.availableFor === "both"
            );
          }
          if ((car as any).serviceTypes) {
            return (car as any).serviceTypes.includes(searchType);
          }
          return false;
        })
    : carsData.filter((car) => {
        if (car.availableFor) {
          if (searchType === "rental")
            return car.availableFor === "rental" || car.availableFor === "both";
          return car.availableFor === "transfer" || car.availableFor === "both";
        }
        if ((car as any).serviceTypes) {
          return (car as any).serviceTypes.includes(searchType);
        }
        return false;
      });

  baseForFacets.forEach((car) => {
    if (car.transmission) {
      const tKey = car.transmission.toLowerCase();
      facets.trans[tKey] = (facets.trans[tKey] || 0) + 1;
    }

    if (car.supplier) {
      facets.sup[car.supplier] = (facets.sup[car.supplier] || 0) + 1;
    }

    if (car.locationType) {
      facets.loc[car.locationType] = (facets.loc[car.locationType] || 0) + 1;
    }

    facets.cat[car.type] = (facets.cat[car.type] || 0) + 1;

    const seatKey = car.seats >= 6 ? "6+" : car.seats.toString();
    facets.seats[seatKey] = (facets.seats[seatKey] || 0) + 1;
    if (car.hasAC) facets.spec.ac++;

    if (car.mileage)
      facets.mileage[car.mileage] = (facets.mileage[car.mileage] || 0) + 1;

    if (car.score >= 9) facets.score["9"] = (facets.score["9"] || 0) + 1;
    if (car.score >= 8) facets.score["8"] = (facets.score["8"] || 0) + 1;
    if (car.score >= 7) facets.score["7"] = (facets.score["7"] || 0) + 1;

    facets.pay["now"] = (facets.pay["now"] || 0) + 1;

    if (car.fuelPolicy)
      facets.fuel[car.fuelPolicy] = (facets.fuel[car.fuelPolicy] || 0) + 1;

    if (car.deposit <= 100000)
      facets.deposit["0-6250"] = (facets.deposit["0-6250"] || 0) + 1;
    else if (car.deposit <= 250000)
      facets.deposit["6250-12500"] = (facets.deposit["6250-12500"] || 0) + 1;
    else facets.deposit["12500+"] = (facets.deposit["12500+"] || 0) + 1;

    const p = car.price;
    if (p <= 50000)
      facets.price_range["0-50000"] = (facets.price_range["0-50000"] || 0) + 1;
    else if (p <= 100000)
      facets.price_range["50000-100000"] =
        (facets.price_range["50000-100000"] || 0) + 1;
    else if (p <= 150000)
      facets.price_range["100000-150000"] =
        (facets.price_range["100000-150000"] || 0) + 1;
    else if (p <= 200000)
      facets.price_range["150000-200000"] =
        (facets.price_range["150000-200000"] || 0) + 1;
    else
      facets.price_range["200000+"] = (facets.price_range["200000+"] || 0) + 1;

    if (car.extras)
      car.extras.forEach(
        (extra) => (facets.extras[extra] = (facets.extras[extra] || 0) + 1),
      );
  });

  if (filters.sortBy?.includes("Preço"))
    results.sort((a, b) => a.price - b.price);

  const totalCount = results.length;
  const paginatedResults = results.slice(offset, offset + limit).map((car) => {
    const included: string[] = ["CANCELAMENTO GRATUITO"];

    if (searchType === "transfer") {
      included.push("MOTORISTA PROFISSIONAL");
      included.push("AR-CONDICIONADO");
      included.push("TAXAS INCLUSAS");
    } else {
      included.push("SEGURO INCLUSO NO PREÇO");
    }

    return {
      ...car,
      includedServices: included,
    };
  });

  console.log("--- [SEARCH RESPONSE] ---");
  console.log(`Found: ${totalCount} cars`);
  if (totalCount === 0)
    console.log(`Reason: ${filterReason || "No cars match the core criteria"}`);
  console.log(
    `Paged: ${paginatedResults.length} (Off: ${offset}, Lim: ${limit})`,
  );
  console.log("-------------------------\n");

  const seenSuppliers = new Set();
  const suppliers = (carsData as any[]).reduce((acc: any[], car) => {
    if (!seenSuppliers.has(car.supplier)) {
      seenSuppliers.add(car.supplier);
      acc.push({
        id: car.supplier,
        name: car.supplier,
        logo: car.supplierLogo,
      });
    }
    return acc;
  }, []);

  const response: SearchResponse = {
    results: paginatedResults,
    totalCount,
    facets,
    suppliers,
  };

  if (recommendationInfo) {
    response.recommendationInfo = recommendationInfo;
  }

  return response;
}

export async function getSystemDataInternal() {
  return {
    categories: categoriesData,
    extras: extrasData,
  };
}

// --- Public Server Actions ---

export async function searchCars(
  filters: SearchFilters,
): Promise<SearchResponse> {
  return createPublicAction(
    "SearchCars",
    async (f: SearchFilters) => {
      // Envolver em unstable_cache para performance
      const getCachedCars = unstable_cache(
        async (innerFilters: SearchFilters) => {
          return await searchCarsInternal(innerFilters);
        },
        ["search-cars-api"],
        { revalidate: 60, tags: ["cars"] },
      );
      return getCachedCars(f);
    },
    filters,
  );
}

export async function getSystemData() {
  return createPublicAction(
    "GetSystemData",
    async () => {
      const getCachedData = unstable_cache(
        async () => {
          return await getSystemDataInternal();
        },
        ["system-data-api"],
        { revalidate: 3600, tags: ["system"] },
      );
      return getCachedData();
    },
    {},
  );
}

export async function getCarById(id: string): Promise<Car | undefined> {
  return createPublicAction(
    "GetCarById",
    async (carId: string) => {
      return (carsData as Car[]).find((car) => car.id === carId);
    },
    id,
  );
}

export async function getCarsByIds(ids: string[]): Promise<Car[]> {
  return createPublicAction(
    "GetCarsByIds",
    async (carIds: string[]) => {
      return (carsData as Car[]).filter((car) => carIds.includes(car.id));
    },
    ids,
  );
}
