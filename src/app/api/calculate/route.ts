import { NextResponse } from "next/server";
import { getCarsByIds } from "@/actions/public/search/cars";
import { supabaseAdmin } from "@/lib/supabase";
import { toCamelCase } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { carIds, selectedExtras, rentalDays = 3, type = "rental", pickup, dropoff, from, to, stops } = await request.json();

    const searchContext = { type, pickup, dropoff, from, to, stops, extras: Object.keys(selectedExtras || {}) };

    // Determine which extras we actually need: from selectedExtras keys and from vehicle.extras
    const cars = await getCarsByIds(carIds, searchContext as any);
    if (!cars || cars.length === 0) {
      return NextResponse.json(
        { error: "Carros não encontrados" },
        { status: 404 },
      );
    }

    const selectedKeys = Object.keys(selectedExtras || {});
    const neededExtraIds = new Set<string>();
    selectedKeys.forEach((k) => {
      const parts = k.split("-");
      if (parts.length === 2 && parts[0] && parts[1]) {
        // could be carId-extraId or extraId-qty; prefer extraId detection
        if (parts[0].length === 36) {
          neededExtraIds.add(parts[1]);
        } else {
          neededExtraIds.add(parts[0]);
        }
      } else {
        neededExtraIds.add(k);
      }
    });
    // include extras explicitly associated to cars
    (cars || []).forEach((c: any) => {
      if (Array.isArray(c.extras)) c.extras.forEach((eid: string) => eid && neededExtraIds.add(eid));
    });

    let extrasList: any[] = [];
    if (neededExtraIds.size > 0) {
      const ids = Array.from(neededExtraIds);
      const { data: extrasData } = await supabaseAdmin.from("extras").select("*").in("id", ids);
      extrasList = (extrasData || []).map(toCamelCase);
    } else {
      const { data: extrasData } = await supabaseAdmin.from("extras").select("*");
      extrasList = (extrasData || []).map(toCamelCase);
    }

    let total = 0;
    const breakdown = {
      cars: [] as any[],
      extras: [] as any[],
      total: 0,
    };

    // Usar os cálculos já realizados pela action getCarsByIds
    cars.forEach((car: any) => {
      total += car.totalPrice || 0;

      breakdown.cars.push({
        id: car.id,
        name: car.name,
        rentalPrice: car.baseTotal || 0,
        insurancePrice: 0, // Seguros agora estão integrados ou tratados à parte
        total: car.totalPrice
      });
    });

    // Cálculo de Extras
    Object.entries(selectedExtras as Record<string, number>).forEach(
      ([key, qtyValue]) => {
        // Support multiple key formats coming from different pages:
        // - "carId-extraId" with value = qty
        // - "extraId-qty" (car not specified) encoded in URL, value may be ignored
        // - "extraId" with value = qty
        const segments = key.split("-");
        let carId: string | null = null;
        let extraId: string = key;
        let qty = Number(qtyValue) || 0;

        if (segments.length === 2 && /^[0-9]+$/.test(segments[1])) {
          // Format: extraId-qty (no carId)
          extraId = segments[0];
          qty = Number(segments[1]);
          carId = null;
        } else if (segments.length === 2) {
          // Format: carId-extraId
          carId = segments[0];
          extraId = segments[1];
          // qty remains from value
        } else {
          // single key, extraId only
          extraId = key;
        }

        cars.forEach((car) => {
          const isForThisCar = carId ? car.id === carId : true;
          const isIncluded = car.extras?.includes(extraId) || false;

          if (isForThisCar && !isIncluded && qty > 0) {
            const extra = extrasList.find((e: any) => e.id === extraId);
            if (extra) {
              const price = extra.perDay
                ? extra.price * rentalDays
                : extra.price;
              const itemTotal = price * qty;
              total += itemTotal;

              breakdown.extras.push({
                id: extraId,
                name: extra.name,
                qty,
                carId: carId || car.id,
                total: itemTotal,
              });
            }
          }
        });
      },
    );

    breakdown.total = total;
    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Calculation API Error:", error);
    return NextResponse.json(
      { error: "Erro ao calcular total" },
      { status: 500 },
    );
  }
}
