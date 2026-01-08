import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { searchCars, getSystemData } from "@/actions/public/search/cars";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Car as CarIcon,
  Users,
  Luggage,
  Briefcase,
  Info,
  Mail,
  Navigation,
  X,
  Smartphone,
  Truck,
  Zap,
  Check,
  Loader2,
  AlertCircle,
  Menu,
  Filter,
  MapPin,
  ArrowRight,
  Wind,
  UserCheck,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterContent } from "@/components/search/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Car, SearchResponse } from "@/types/cars";
import { encodeState } from "@/lib/url-state";

const ICON_MAP: Record<string, any> = {
  Smartphone: Smartphone,
  Car: CarIcon,
  Luggage: Luggage,
  Truck: Truck,
  Users: Users,
  Zap: Zap,
  Briefcase: Briefcase,
};

export function CarResults({
  onDataChange,
  searchData,
  initialResults,
  facets: externalFacets,
  suppliers: externalSuppliers,
}: {
  onDataChange?: (data: SearchResponse) => void;
  searchData?: any;
  initialResults?: SearchResponse;
  facets?: Record<string, Record<string, number>>;
  suppliers?: any[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams?.get("cat")?.split(",") || [],
  );

  const [cars, setCars] = useState<Car[]>(initialResults?.results || []);
  const [loading, setLoading] = useState(!initialResults);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);

  const [totalCount, setTotalCount] = useState(initialResults?.totalCount || 0);

  const isInitialMount = useRef(true);

  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [extrasMap, setExtrasMap] = useState<Record<string, string>>({});
  const [recommendationInfo, setRecommendationInfo] = useState<any>(
    initialResults?.recommendationInfo || null,
  );

  const LIMIT = 5;

  const currentType =
    (searchParams?.get("type") as "rental" | "transfer") ||
    searchData?.type ||
    "rental";

  useEffect(() => {
    setSelectedOfferIds([]);
  }, [currentType]);

  const coreSearchKey = `${searchParams?.get("type") || ""}|${searchParams?.get("pickup") || ""}|${searchParams?.get("dropoff") || ""}|${searchParams?.get("from") || ""}|${searchParams?.get("to") || ""}`;

  useEffect(() => {
    setSelectedOfferIds([]);
    setSelectedCategories(
      searchParams?.get("cat")?.split(",").filter(Boolean) || [],
    );
  }, [coreSearchKey]);

  useEffect(() => {
    const catParam = searchParams?.get("cat");
    const currentCats = catParam ? catParam.split(",").filter(Boolean) : [];
    if (JSON.stringify(currentCats) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(currentCats);
    }
  }, [searchParams?.get("cat")]);

  useEffect(() => {
    async function fetchData() {
      const data = await getSystemData();
      setCategoriesData(data.categories);

      const eMap: Record<string, string> = {};
      data.extras.forEach((e: any) => {
        eMap[e.id] = e.label;
      });
      setExtrasMap(eMap);
    }
    fetchData();
  }, []);

  const days = useMemo(() => {
    const fromDate = searchData?.from || searchParams?.get("from");
    const toDate = searchData?.to || searchParams?.get("to");
    let d = 3;
    if (fromDate && toDate) {
      const d1 = new Date(fromDate);
      const d2 = new Date(toDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      d = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }
    return d;
  }, [searchData?.from, searchData?.to, searchParams.toString()]);

  useEffect(() => {
    async function fetchInitialCars() {
      if (isInitialMount.current) {
        if (initialResults) {
          isInitialMount.current = false;
          if (onDataChange) onDataChange(initialResults);
          return;
        }
        isInitialMount.current = false;
      }
      if ((!searchData || !searchData.pickup) && !searchParams?.get("pickup")) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setOffset(0);

      const safetyTimeout = setTimeout(() => {
        setLoading(false);
      }, 5000);

      try {
        const filters: any = {};

        filters.type =
          searchParams?.get("type") || searchData?.type || "rental";
        filters.pickup = searchData?.pickup || searchParams?.get("pickup");
        filters.dropoff = searchData?.dropoff || searchParams?.get("dropoff");
        filters.from = searchData?.from || searchParams?.get("from");
        filters.to = searchData?.to || searchParams?.get("to");

        if (filters.type === "transfer") {
          filters.passengers =
            searchData?.passengers ||
            searchParams?.get("passengers") ||
            undefined;
          filters.luggage =
            searchData?.luggage || searchParams?.get("luggage") || undefined;
        }

        filters.categories = selectedCategories;
        const urlFilters = [
          "loc",
          "sup",
          "spec",
          "pol",
          "trans",
          "mileage",
          "extras",
          "price_range",
          "seats",
          "score",
          "pay",
          "electric",
          "fuel",
          "deposit",
        ];
        urlFilters.forEach((k) => {
          const v = searchParams?.get(k);
          if (v) filters[k] = v.split(",");
        });

        filters.limit = LIMIT;
        filters.offset = 0;

        const data = await searchCars(filters);

        if (data.results) {
          setCars(data.results);
          setTotalCount(data.totalCount);
          setRecommendationInfo(data.recommendationInfo || null);
        } else {
          const anyData = data as any;
          if (anyData.cars) {
            setCars(anyData.cars);
            setTotalCount(anyData.total);
          }
        }

        if (onDataChange) onDataChange(data);
      } catch (err) {
        console.error(err);
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    }
    fetchInitialCars();
  }, [searchParams.toString(), searchData, selectedCategories.join(",")]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newCat = selectedCategories.join(",");
    const oldCat = params.get("cat") || "";

    if (newCat !== oldCat) {
      if (newCat) {
        params.set("cat", newCat);
      } else {
        params.delete("cat");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [selectedCategories]);

  const loadMore = useCallback(async () => {
    const nextOffset = offset + LIMIT;
    setLoadingMore(true);
    const data = await searchCars({
      type: (searchParams?.get("type") as "rental" | "transfer") || "rental",
      pickup: searchParams?.get("pickup") || undefined,
      dropoff: searchParams?.get("dropoff") || undefined,
      passengers:
        searchData?.passengers || searchParams?.get("passengers") || undefined,
      luggage: searchData?.luggage || searchParams?.get("luggage") || undefined,
      categories: selectedCategories,
      loc: searchParams?.get("loc")?.split(",") || [],
      sup: searchParams?.get("sup")?.split(",") || [],
      spec: searchParams?.get("spec")?.split(",") || [],
      pol: searchParams?.get("pol")?.split(",") || [],
      trans: searchParams?.get("trans")?.split(",") || [],
      mileage: searchParams?.get("mileage")?.split(",") || [],
      extras: searchParams?.get("extras")?.split(",") || [],
      price_range: searchParams?.get("price_range")?.split(",") || [],
      seats: searchParams?.get("seats")?.split(",") || [],
      score: searchParams?.get("score")?.split(",") || [],
      pay: searchParams?.get("pay")?.split(",") || [],
      electric: searchParams?.get("electric")?.split(",") || [],
      fuel: searchParams?.get("fuel")?.split(",") || [],
      deposit: searchParams?.get("deposit")?.split(",") || [],
      limit: LIMIT,
      offset: nextOffset,
    });
    setCars((prev) => [...prev, ...data.results]);
    setOffset(nextOffset);
    setLoadingMore(false);
  }, [offset, selectedCategories, searchParams.toString(), searchData]);

  const toggleOfferSelection = useCallback((id: string) => {
    setSelectedOfferIds((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id],
    );
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }, []);

  const removeCategory = useCallback((id: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== id));
  }, []);

  return (
    <div className="flex-1 max-w-[850px] w-full">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col gap-3 py-3 pl-[20px]">
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
              {selectedCategories.map((catId) => {
                const cat = categoriesData.find((c) => c.id === catId);
                if (!cat) return null;
                return (
                  <div
                    key={catId}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#f0f6ff] border border-[#006ce4] rounded-full text-[10px] md:text-[11px] font-bold text-[#006ce4] animate-in fade-in zoom-in duration-200"
                  >
                    <span>{cat.label}</span>
                    <button
                      onClick={() => removeCategory(catId)}
                      className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => setSelectedCategories([])}
                className="text-[10px] md:text-[11px] text-gray-500 hover:text-red-600 font-bold ml-1 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          )}

          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 w-full pr-[10px] md:pr-[20px]">
            <div className="flex flex-wrap md:flex-nowrap items-center gap-1 md:gap-0 overflow-x-visible md:overflow-x-auto scrollbar-hide w-full xl:flex-1 pb-2 xl:pb-0">
              {categoriesData.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                const Icon = ICON_MAP[cat.icon] || CarIcon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 py-1.5 md:py-2 px-3 md:px-2.5 transition-all relative rounded-full md:rounded-t-sm md:rounded-b-none border md:border-t-0 md:border-x-0 md:border-b-2",
                      isSelected
                        ? "border-[#006ce4] text-[#006ce4] bg-blue-50 md:bg-blue-50/50"
                        : "border-gray-200 md:border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isSelected ? "text-[#006ce4]" : "text-gray-400",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] md:text-xs font-bold whitespace-nowrap",
                        isSelected ? "text-[#006ce4]" : "text-gray-600",
                      )}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="lg:hidden flex items-center gap-2 pr-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 border-gray-200 text-gray-700 font-bold text-xs gap-2 rounded-full"
                  >
                    <Menu className="h-3.5 w-3.5" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="p-0 w-[300px] flex flex-col z-[100]"
                >
                  <SheetHeader className="p-4 border-b border-gray-100 flex-shrink-0">
                    <SheetTitle className="text-base font-black uppercase tracking-tight">
                      Filtros
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-hidden">
                    <FilterContent
                      facets={externalFacets || initialResults?.facets || {}}
                      suppliers={
                        externalSuppliers || initialResults?.suppliers || []
                      }
                      handleFilterChange={(key, value, checked) => {
                        const params = new URLSearchParams(
                          searchParams?.toString() || "",
                        );
                        const existingValues =
                          params.get(key)?.split(",") || [];
                        let nextValues: string[];
                        if (checked) {
                          nextValues = [...existingValues, value];
                        } else {
                          nextValues = existingValues.filter(
                            (v) => v !== value,
                          );
                        }
                        if (nextValues.length > 0) {
                          params.set(key, nextValues.join(","));
                        } else {
                          params.delete(key);
                        }
                        router.replace(`${pathname}?${params.toString()}`, {
                          scroll: false,
                        });
                      }}
                      isChecked={(key, value) =>
                        (searchParams?.get(key)?.split(",") || []).includes(
                          value,
                        )
                      }
                      handleClearAll={() => {
                        const params = new URLSearchParams(
                          searchParams?.toString() || "",
                        );
                        const filters = [
                          "loc",
                          "sup",
                          "spec",
                          "pol",
                          "mileage",
                          "extras",
                          "cat",
                          "price",
                          "seats",
                          "score",
                          "pay",
                          "fuel",
                          "deposit",
                          "trans",
                          "service_type",
                          "inc",
                        ];
                        filters.forEach((k) => params.delete(k));
                        router.replace(`${pathname}?${params.toString()}`, {
                          scroll: false,
                        });
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <AnimatePresence>
              {selectedOfferIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="w-full md:w-auto flex-shrink-0 ml-0 md:ml-2 mt-2 md:mt-0">
                    <Button
                      onClick={() => {
                        const selectedCarsData = cars.filter((c) =>
                          selectedOfferIds.includes(c.id),
                        );

                        const checkoutData = {
                          offers: selectedCarsData,
                          search: {
                            pickup:
                              searchData?.pickup || searchParams?.get("pickup"),
                            dropoff:
                              searchData?.dropoff ||
                              searchParams?.get("dropoff"),
                            date: searchData?.from || searchParams?.get("from"),
                            passengers:
                              searchData?.passengers ||
                              searchParams?.get("passengers"),
                            luggage:
                              searchData?.luggage ||
                              searchParams?.get("luggage"),
                            type: currentType,
                          },
                          totalItems: selectedOfferIds.length,
                          timestamp: Date.now(),
                        };

                        const encoded = encodeState(checkoutData);
                        if (encoded) {
                          if (currentType === "transfer") {
                            router.push(
                              `/booking/checkout/confirmar?s=${encoded}`,
                            );
                          } else {
                            // Para aluguel, vai primeiro escolher extras
                            router.push(
                              `/booking/${selectedOfferIds.join(",")}?s=${encoded}`,
                            );
                          }
                        } else {
                          toast.error("Erro ao preparar o checkout.");
                        }
                      }}
                      className="w-[150px] h-10 rounded-[3px] font-black text-[12px] flex items-center justify-center gap-2 shadow-lg border-none transition-all bg-[#003580] hover:bg-[#002b66] animate-pulse hover:animate-none"
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 bg-white text-[#003580]">
                        {selectedOfferIds.length}
                      </span>
                      <span className="whitespace-nowrap">
                        {currentType === "transfer"
                          ? "Checkout Seguro"
                          : "Finalizar"}
                      </span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Banner de Recomendação de Múltiplos Veículos */}
      {recommendationInfo && recommendationInfo.needsMultiple && (
        <motion.div
          {...({
            initial: { opacity: 0, y: -10 },
            animate: { opacity: 1, y: 0 },
            className:
              "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-lg p-6 mb-6 shadow-lg",
          } as any)}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-amber-900 mb-2 uppercase tracking-tight flex items-center gap-2">
                <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm">
                  ATENÇÃO
                </span>
                Recomendação de Múltiplos Veículos
              </h3>
              <p className="text-amber-800 font-bold mb-3">
                {recommendationInfo.message}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 uppercase">
                      Passageiros
                    </span>
                  </div>
                  <p className="text-2xl font-black text-amber-900">
                    {recommendationInfo.totalPassengers}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Máx. {recommendationInfo.maxSeatsPerVehicle} por veículo
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Luggage className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 uppercase">
                      Malas
                    </span>
                  </div>
                  <p className="text-2xl font-black text-amber-900">
                    {recommendationInfo.totalLuggage}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Máx. {recommendationInfo.maxLuggagePerVehicle} por veículo
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CarIcon className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 uppercase">
                      Veículos Necessários
                    </span>
                  </div>
                  <p className="text-2xl font-black text-amber-900">
                    {recommendationInfo.vehiclesNeeded}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Selecione abaixo
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Você pode selecionar múltiplos veículos abaixo para atender
                  todas as suas necessidades.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-100 shadow-sm p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      {[1, 2, 3].map((badge) => (
                        <Skeleton
                          key={badge}
                          className="h-6 w-20 rounded-full"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-32 ml-auto" />
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          cars.map((car) => (
            <div
              key={car.id}
              className={cn(
                "bg-white rounded-none border shadow-sm overflow-hidden mb-6 p-5 md:p-6 transition-all relative",
                car.isRecommendedForMultiple
                  ? "border-2 border-amber-400 hover:border-amber-500 bg-amber-50/30"
                  : "border-gray-100 hover:border-blue-200",
              )}
            >
              {/* Badge de Recomendação */}
              {car.isRecommendedForMultiple && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 text-xs font-black uppercase tracking-wide rounded-bl-lg shadow-md flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Recomendado
                </div>
              )}
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch w-full">
                <div className="w-full lg:w-[200px] flex-shrink-0 flex flex-col items-center">
                  <div className="w-full flex items-center justify-center mb-6">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="max-w-full h-auto max-h-40 object-contain grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-auto pb-2">
                    <span className="text-[10px] font-extrabold text-[#006ce4] uppercase tracking-widest opacity-80">
                      Fornecedor
                    </span>
                    <span className="text-xs font-bold text-black">
                      {car.supplier}
                    </span>
                    {car.supplierLogo && (
                      <img
                        src={car.supplierLogo}
                        alt={car.supplier}
                        className="h-4 w-auto grayscale opacity-80"
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="mb-6">
                    <span className="text-[10px] font-extrabold text-[#006ce4] uppercase tracking-widest mb-2 block">
                      {car.type || "Standard"}
                    </span>
                    <h3 className="text-[23px] font-bold text-black leading-none mb-2">
                      {car.name}
                    </h3>

                    {currentType === "transfer" && (
                      <div className="flex items-center gap-2 text-[12px] font-medium text-[#006ce4] mb-2 italic">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">
                          {searchData?.pickup ||
                            searchParams?.get("pickup") ||
                            "Aeroporto"}
                        </span>
                        <ArrowRight className="h-2 w-2" />
                        <span className="truncate max-w-[150px]">
                          {searchData?.dropoff ||
                            searchParams?.get("dropoff") ||
                            "Centro"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    <div className="flex items-center gap-2.5 text-black">
                      <Users className="h-4 w-4 text-[#006ce4]" />
                      <span className="text-sm font-bold">
                        {car.seats} assentos
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-black">
                      <Zap className="h-4 w-4 text-[#006ce4]" />
                      <span className="text-sm font-bold capitalize">
                        {car.transmission}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-black">
                      <Navigation className="h-4 w-4 text-[#006ce4]" />
                      <span className="text-sm font-bold">
                        {currentType === "transfer"
                          ? `Distância: ${car.distanceString || "Pendente"}`
                          : car.mileage === "unlimited"
                            ? "KM Ilimitados"
                            : "KM Limitados"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-black">
                      <Luggage className="h-4 w-4 text-[#006ce4]" />
                      <span className="text-sm font-bold">{car.luggage}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[260px] flex flex-col justify-between pt-6 lg:pt-0 lg:items-end lg:text-right">
                  <div className="space-y-6 w-full lg:flex lg:flex-col lg:items-end">
                    <div className="space-y-2 lg:flex lg:flex-col lg:items-end">
                      {car.includedServices?.map((service, index) => {
                        const isAC = service.includes("AR-CONDICIONADO");
                        const isDriver = service.includes("MOTORISTA");
                        const isGray =
                          !service.includes("INCLUSO") &&
                          !service.includes("GRATUITO") &&
                          !service.includes("PROFISSIONAL");

                        const Icon = isAC ? Wind : isDriver ? UserCheck : Check;

                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center gap-2.5 font-bold text-[11px] tracking-tight justify-end",
                              isGray ? "text-black" : "text-[#006ce4]",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="uppercase">{service}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full">
                      {currentType === "transfer" ? (
                        <div className="flex flex-col lg:items-end">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                            Total da Viagem
                          </p>
                          <h4 className="text-[29px] font-black text-black leading-none">
                            AOA {car.price.toLocaleString("pt-AO")}
                          </h4>
                          <p className="text-xs font-bold text-gray-400 mt-2">
                            AOA {car.pricePerKm || 0} / km
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 flex flex-col lg:items-end">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Total para {days} dias
                          </p>
                          <h4 className="text-[29px] font-black text-[#006ce4] leading-none">
                            AOA{" "}
                            {(
                              (car.price + (car.insurance?.dailyPrice || 0)) *
                              days
                            ).toLocaleString("pt-AO")}
                          </h4>
                          <div className="flex flex-col lg:items-end opacity-80">
                            <p className="text-[12px] font-bold text-black">
                              AOA{" "}
                              {(
                                car.price + (car.insurance?.dailyPrice || 0)
                              ).toLocaleString("pt-AO")}{" "}
                              / dia
                            </p>
                            {car.insurance?.dailyPrice && (
                              <p className="text-[11px] font-medium text-gray-500 italic">
                                (Seguro Incluído: AOA{" "}
                                {car.insurance.dailyPrice.toLocaleString(
                                  "pt-AO",
                                )}
                                /dia)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 w-full">
                    <Button
                      onClick={() => toggleOfferSelection(car.id)}
                      className={cn(
                        "w-full h-12 text-sm font-bold transition-all rounded-none border-none shadow-none uppercase tracking-widest flex items-center justify-center gap-2",
                        selectedOfferIds.includes(car.id)
                          ? "bg-black text-white hover:bg-[#003580]"
                          : "bg-[#006ce4] hover:bg-black text-white",
                      )}
                    >
                      {selectedOfferIds.includes(car.id) ? (
                        <div className="flex flex-col items-center leading-none">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Check className="h-4 w-4" />
                            <span>SELECIONADO</span>
                          </div>
                          <span className="text-[10px] opacity-70 font-black tracking-normal lowercase">
                            (clique p/ remover)
                          </span>
                        </div>
                      ) : currentType === "transfer" ? (
                        "RESERVAR"
                      ) : (
                        "SELECIONAR"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && cars.length > 0 && (
        <div className="mt-10 flex flex-col items-center gap-4">
          {cars.length < totalCount ? (
            <>
              <p className="text-sm text-gray-500 font-medium">
                Exibindo{" "}
                <span className="font-bold text-gray-900">{cars.length}</span>{" "}
                de <span className="font-bold text-gray-900">{totalCount}</span>{" "}
                carros
              </p>
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-12 h-12 bg-white hover:bg-gray-50 text-[#006ce4] border-2 border-[#006ce4] rounded-[4px] font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                {loadingMore ? "Carregando..." : "Ver mais resultados"}
              </Button>
            </>
          ) : (
            <div className="py-6 px-10 bg-gray-50/50 rounded-[4px] border border-dashed border-gray-200 w-full max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] text-center">
                  Todos os resultados foram carregados
                </p>
                <p className="text-[10px] text-gray-400 font-medium italic">
                  Nenhum dado novo encontrado para esta pesquisa.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && cars.length === 0 && (
        <div className="text-center py-20">
          <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">
            {!searchData?.pickup && !searchParams?.get("pickup")
              ? "Inicie sua pesquisa"
              : "Nenhum carro encontrado"}
          </h3>
          <p className="text-gray-500">
            {!searchData?.pickup && !searchParams?.get("pickup")
              ? "Preencha o formulário acima para ver as ofertas disponíveis."
              : "Tente ajustar seus filtros para encontrar o que procura."}
          </p>
        </div>
      )}
    </div>
  );
}
