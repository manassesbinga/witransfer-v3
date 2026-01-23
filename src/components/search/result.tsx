"use client"

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
import { getDraftAction } from "@/actions/public/drafts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AsyncButton from "@/components/ui/async-button";
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
  Star,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterContent } from "@/components/sidebar/public";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Car, SearchResponse, SearchFilters, Supplier, Category, RecommendationInfo } from "@/types";
// no URL encoding: use server-side drafts (did) instead
import { createDraftAction } from "@/actions/public/drafts";

import { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
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
  categoriesData = [],
  extrasData = [],
}: {
  onDataChange?: (data: SearchResponse) => void;
  searchData?: SearchFilters;
  initialResults?: SearchResponse | null;
  facets?: Record<string, Record<string, number>>;
  suppliers?: Supplier[];
  categoriesData?: Category[];
  extrasData?: any[];
}) {
  // Verificar se código novo está carregado
  console.log("🚀 [CarResults] Componente carregado - VERSÃO NOVA v2.0");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams?.get("cat")?.split(",") || [],
  );

  const [cars, setCars] = useState<Car[]>(initialResults?.results || []);
  const [loading, setLoading] = useState(!initialResults);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);

  const [totalCount, setTotalCount] = useState(initialResults?.totalCount || 0);

  // Simplified trigger logic: show results if we have initial data or search params
  const [shouldShowResults, setShouldShowResults] = useState(
    !!initialResults || !!searchParams?.get("did") || !!searchData?.pickup
  );

  const [extrasMap, setExtrasMap] = useState<Record<string, string>>({});
  const [recommendationInfo, setRecommendationInfo] = useState<RecommendationInfo | null>(
    (initialResults?.recommendationInfo as RecommendationInfo) || null,
  );

  const LIMIT = 5;

  const currentType =
    (searchParams?.get("type") as "rental" | "transfer") ||
    searchData?.type ||
    "rental";

  const isInitialMount = useRef(true);
  const lastSearchRef = useRef<string>("");

  useEffect(() => {
    const catParam = searchParams?.get("cat");
    const didParam = searchParams?.get("did");
    console.log("📍 [CarResults] Route changed:", { did: didParam, cat: catParam });

    const currentCats = catParam ? catParam.split(",").filter(Boolean) : [];
    if (JSON.stringify(currentCats) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(currentCats);
    }

    // Update shouldShowResults if we have a draft or pickup location
    if (didParam || searchData?.pickup) {
      setShouldShowResults(true);
    }
  }, [searchParams?.get("cat"), searchParams?.get("did"), searchData?.pickup]);

  useEffect(() => {
    async function fetchData() {
      const data = await getSystemData();

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
      const draftId = searchParams?.get("did");

      // If no shouldShowResults AND no initial results AND no draft ID, don't auto-fetch
      if (!shouldShowResults && !initialResults && !draftId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setOffset(0);

      const safetyTimeout = setTimeout(() => {
        setLoading(false);
      }, 5000);

      try {


        let filters: any = {};
        const did = searchParams?.get("did");
        let draftSearchData: any = null;

        // 1. Tentar recuperar dados do Draft (sessionStorage ou Server)
        if (did) {
          try {
            const localData = sessionStorage.getItem(did);
            const draft = localData ? JSON.parse(localData) : await getDraftAction(did);

            if (draft) {
              // Se tiver ofertas salvas e válidas, usa elas
              if (draft.offers && draft.offers.length > 0 && !shouldShowResults) {
                setCars(draft.offers as any[]);
                setTotalCount(draft.totalItems || draft.offers.length);
                if (onDataChange) onDataChange({ results: draft.offers, totalCount: draft.totalItems || draft.offers.length } as any);
                setLoading(false);
                clearTimeout(safetyTimeout);
                return;
              }
              // Se não tiver ofertas ou se for um NOVO trigger, extraímos os filtros
              draftSearchData = draft.search || draft;
              console.log("📂 [RESULTS] Usando filtros extraídos do Draft:", draftSearchData?.pickup);
            }
          } catch (e) {
            console.warn("Failed to extract filters from draft:", e);
          }
        }

        // 2. Montar filtros (Prioridade: Draft > URL Params)
        filters.type = searchParams?.get("type") || draftSearchData?.type || searchData?.type || "rental";
        filters.pickup = searchParams?.get("pickup") || draftSearchData?.pickup || searchData?.pickup;
        filters.dropoff = searchParams?.get("dropoff") || draftSearchData?.dropoff || searchData?.dropoff;
        filters.from = searchParams?.get("from") || draftSearchData?.from || searchData?.from;
        filters.to = searchParams?.get("to") || draftSearchData?.to || searchData?.to;

        if (!filters.pickup) {
          console.log("ℹ️ [RESULTS] No pickup location provided. Skipping fetch.", { filters, did });
          setCars([]);
          setTotalCount(0);
          setLoading(false);
          clearTimeout(safetyTimeout);
          return;
        }

        if (filters.type === "transfer") {
          filters.passengers = searchParams?.get("passengers") || draftSearchData?.passengers || searchData?.passengers;
          filters.luggage = searchParams?.get("luggage") || draftSearchData?.luggage || searchData?.luggage;
        }

        filters.categories = selectedCategories;
        const urlFilters = [
          "loc", "sup", "spec", "pol", "trans", "mileage", "extras", "price_range", "seats", "score", "pay", "electric", "fuel", "deposit",
        ];
        urlFilters.forEach((k) => {
          const v = searchParams?.get(k);
          if (v) filters[k] = v.split(",");
        });

        const currentSearchKey = JSON.stringify(filters);
        if (lastSearchRef.current === currentSearchKey) {
          console.log("⏭️ [RESULTS] Skipping duplicate search (params identical)");
          setLoading(false);
          return;
        }
        lastSearchRef.current = currentSearchKey;

        filters.limit = LIMIT;
        filters.offset = 0;

        const data = await searchCars(filters);

        console.log("📦 [FRONTEND] Resposta da Server Action searchCars:", {
          totalCount: data.totalCount,
          resultsLength: data.results?.length,
          firstResult: data.results?.[0]?.name,
          offset: filters.offset,
          limit: filters.limit
        });

        if (data.results && data.results.length > 0) {
          setCars(data.results);
          setTotalCount(data.totalCount);
          setRecommendationInfo(data.recommendationInfo || null);
          if (!shouldShowResults) setShouldShowResults(true);
        } else {
          setCars([]);
          setTotalCount(0);
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
  }, [
    searchParams?.toString(),
    searchData,
    selectedCategories.join(','),
    initialResults,
    onDataChange
  ]);

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
      prev.includes(id) ? [] : [id],
    );
  }, []);

  const selectOffer = useCallback((id: string) => {
    setSelectedOfferIds([id]);
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }, []);

  const removeCategory = useCallback((id: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== id));
  }, []);

  // Compact action column used in both grid and list views to avoid repeated JSX
  const ActionColumn = ({ car }: { car: Car }) => {
    // Recompute totals locally to ensure UI reflects server logic
    const perUnit = (car as any).pricePerUnit ?? car.price;
    const extrasObjects = (car as any).extrasObjects || [];
    const selectedExtrasParam = (searchParams?.get("extras") || "").split(",").filter(Boolean);
    const extrasTotal = extrasObjects.reduce((acc: number, ex: any) => {
      const exPrice = Number(ex.price || 0);
      const isPerDay = ex.perDay === true || ex.per_day === true;
      // Revert: Per user request, total includes ALL available extras by default
      return acc + exPrice * (isPerDay ? days : 1);
    }, 0);
    const baseTotal = (car as any).baseTotal ?? (currentType === "rental" ? perUnit * days : perUnit);
    const displayTotal = (car as any).totalPrice ?? (baseTotal + extrasTotal);

    // Debug output for browser console
    try {
      const extrasDebug = extrasObjects.map((e: any) => ({ id: e.id, name: e.name, price: e.price, perDay: e.per_day || e.perDay }));
      console.debug("[CarResults Pricing]", {
        id: car.id,
        perUnit,
        days,
        baseTotal,
        extrasTotal,
        displayTotal,
        billingType: (car as any).billingType || currentType,
        extrasObjects: extrasDebug,
        selectedExtrasParam
      });
    } catch (e) { }

    return (
      <div className="flex flex-col items-end gap-3">
        <div className="text-right">
          <div className="text-sm font-bold text-slate-900">{car.name}</div>
          <div className="text-xs text-slate-500">
            <span className="text-[10px] text-slate-400 font-bold mr-1">Parceiro:</span>
            <span className="truncate">{car.supplier}</span>
          </div>
          {car.locationName && (
            <div className="text-[10px] text-slate-400 font-medium flex items-center justify-end gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{car.locationName}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 text-right">
          {currentType === "rental"
            ? `AOA ${perUnit.toLocaleString("pt-AO")} p/dia • ${days} dias`
            : `Serviço Base • AOA ${perUnit.toLocaleString("pt-AO")}${(car as any).billingType === 'per_km' ? '/km' : ''} ${(car as any).distanceString ? `• ${(car as any).distanceString}` : ''}`}
          {extrasTotal > 0 && (
            <div className="text-[10px] text-slate-400 font-medium">+ Serviços Inclusos</div>
          )}
        </div>

        <AsyncButton
          onClick={(e) => {
            e.stopPropagation(); // Evita que o clique no botão acione o clique no card
            if (car.isBusy) {
              toast.info(`Viatura ocupada. Iremos colocá-lo na lista de espera para este período.`);
            }
            toggleOfferSelection(car.id);
          }}
          className={cn(
            "px-4 py-3 font-bold text-sm flex-shrink-0 transition-all h-fit flex flex-col items-center min-w-[140px]",
            car.isBusy
              ? (selectedOfferIds.includes(car.id)
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100")
              : selectedOfferIds.includes(car.id)
                ? "bg-primary text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300",
          )}
        >
          <span className="text-xs font-bold leading-none mb-1 uppercase tracking-tighter">
            {car.isBusy
              ? (selectedOfferIds.includes(car.id) ? "✓ Na Lista" : "Lista de Espera")
              : (selectedOfferIds.includes(car.id) ? "✓ Selecionado" : "Selecionar")}
          </span>
          <span className="font-black text-base">AOA {displayTotal.toLocaleString("pt-AO")}</span>
        </AsyncButton>
      </div>
    );
  };

  return (
    <div className="flex-1 max-w-[850px] w-full mx-5">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm mb-4">
        <div className="flex flex-col gap-2 py-2 pl-[20px]">
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
            <div className="flex md:flex-nowrap items-center gap-1 md:gap-0 overflow-x-visible md:overflow-x-auto scrollbar-hide w-full xl:flex-1">
              {categoriesData.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                const Icon = cat.icon ? (ICON_MAP[cat.icon as string] || CarIcon) : CarIcon;

                // Real Filter Count
                const currentFacets = externalFacets || initialResults?.facets || {};
                const count = currentFacets.cat?.[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "inline-flex items-center gap-1 py-1 md:py-1.5 px-2.5 md:px-2 transition-all relative rounded-full md:rounded-t-sm md:rounded-b-none border md:border-t-0 md:border-x-0 md:border-b-2",
                      isSelected
                        ? "border-[#006ce4] text-[#006ce4] bg-blue-50 md:bg-blue-50/50"
                        : "border-gray-200 md:border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                      count === 0 && !isSelected && "opacity-50 grayscale"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        isSelected ? "text-[#006ce4]" : "text-gray-400",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] md:text-[11px] font-bold whitespace-nowrap",
                        isSelected ? "text-[#006ce4]" : "text-gray-600",
                      )}
                    >
                      {cat.label} <span className="text-[9px] opacity-70 ml-0.5">({count})</span>
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
                    <SheetTitle className="text-base font-bold tracking-tight">
                      Filtros
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-hidden">
                    <FilterContent
                      facets={externalFacets || initialResults?.facets || {}}
                      suppliers={
                        externalSuppliers || initialResults?.suppliers || []
                      }
                      categoriesData={categoriesData}
                      extrasData={extrasData}
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
                      onClick={async () => {
                        const selectedCarsData = cars.filter((c) =>
                          selectedOfferIds.includes(c.id),
                        );

                        if (selectedCarsData.length === 0) {
                          toast.error("Selecione pelo menos um veículo");
                          return;
                        }

                        // Tipo para o draft
                        interface DraftData {
                          carIds: string[];
                          type: string;
                          summaries: Array<{
                            id: string;
                            totalPrice: number;
                            baseTotal: number;
                            extrasTotal: number;
                          }>;
                          search: Record<string, any>;
                          totalItems: number;
                          timestamp: number;
                        }

                        // SEMPRE usar witransfer_last_search como fonte de dados de pesquisa
                        let searchData: Record<string, any> = {};

                        try {
                          const lastSearchRaw = sessionStorage.getItem("witransfer_last_search");
                          if (lastSearchRaw) {
                            searchData = JSON.parse(lastSearchRaw);
                            console.log("✅ [CarResults] Dados de pesquisa carregados:", searchData);
                          } else {
                            console.error("❌ [CarResults] witransfer_last_search NÃO encontrado!");
                            toast.error("Erro: dados de pesquisa não encontrados. Por favor, faça uma nova pesquisa.");
                            return;
                          }
                        } catch (e) {
                          console.error("❌ [CarResults] Erro ao ler witransfer_last_search:", e);
                          toast.error("Erro ao carregar dados de pesquisa");
                          return;
                        }

                        // Criar draft com tipagem correta
                        const checkoutData: DraftData = {
                          carIds: selectedOfferIds,
                          type: currentType,
                          summaries: selectedCarsData.map((c) => {
                            const perUnit = (c as any).pricePerUnit ?? c.price;
                            const extrasObjects = (c as any).extrasObjects || [];
                            const selectedExtrasParam = (searchParams?.get("extras") || "").split(",").filter(Boolean);
                            const extrasTotal = extrasObjects.reduce((acc: number, ex: any) => {
                              const isPerDay = ex.perDay === true || ex.per_day === true;
                              const isIncludedOnVehicle = (c as any).extras?.includes?.(ex.id);
                              const isSelectedByUser = selectedExtrasParam.includes(ex.id);
                              if (!isIncludedOnVehicle && !isSelectedByUser) return acc;
                              return acc + Number(ex.price || 0) * (isPerDay ? days : 1);
                            }, 0);
                            const baseTotal = (c as any).baseTotal ?? (currentType === "rental" ? perUnit * days : perUnit);
                            const totalPrice = (c as any).totalPrice ?? (baseTotal + extrasTotal);
                            return {
                              id: c.id,
                              totalPrice,
                              baseTotal,
                              extrasTotal,
                            };
                          }),
                          search: searchData,
                          totalItems: selectedOfferIds.length,
                          timestamp: Date.now(),
                        };

                        console.log("📦 [CarResults] ===== DRAFT SENDO SALVO =====");
                        console.log("📦 carIds:", checkoutData.carIds);
                        console.log("📦 search:", JSON.stringify(checkoutData.search, null, 2));
                        console.log("📦 summaries:", checkoutData.summaries);
                        console.log("📦 ==========================================");

                        // Salvar no sessionStorage
                        const localDraftId = `draft_${Date.now()}`;
                        try {
                          const draftString = JSON.stringify(checkoutData);
                          sessionStorage.setItem("witransfer_last_draft", draftString);
                          sessionStorage.setItem(localDraftId, draftString);
                          sessionStorage.setItem("witransfer_last_did", localDraftId);
                          console.log("✅ [CarResults] Draft salvo no sessionStorage:", localDraftId);
                        } catch (e) {
                          console.error("❌ [CarResults] Erro ao salvar no sessionStorage:", e);
                        }

                        // Navegar para booking
                        setIsCreatingDraft(true);
                        try {
                          // Tentar criar no servidor (opcional)
                          const result = await createDraftAction(checkoutData);
                          const draftId = result?.id || localDraftId;

                          console.log("🚀 [CarResults] Navegando para booking com draft:", draftId);
                          router.push(`/booking/${selectedOfferIds.join(",")}?did=${draftId}`);
                        } catch (e) {
                          console.error("❌ [CarResults] Erro ao criar draft no servidor:", e);
                          // Usar draft local mesmo se servidor falhar
                          router.push(`/booking/${selectedOfferIds.join(",")}?did=${localDraftId}`);
                        }
                      }}
                      className="w-[150px] h-10 rounded-[3px] font-black text-[12px] flex items-center justify-center gap-2 shadow-lg border-none transition-all bg-[#003580] hover:bg-[#002b66] animate-pulse hover:animate-none"
                    >
                      {isCreatingDraft ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <>
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-white text-[#003580]">
                            {selectedOfferIds.length}
                          </span>
                          <span className="whitespace-nowrap">
                            Finalizar
                          </span>
                        </>
                      )}
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
              "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 p-6 mb-6 shadow-lg",
          } as any)}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2 tracking-tight flex items-center gap-2">
                <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm">
                  Atenção
                </span>
                Recomendação de Múltiplos Veículos
              </h3>
              <p className="text-amber-800 font-bold mb-3">
                {recommendationInfo.message}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/60 p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700">
                      Passageiros
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {recommendationInfo.totalPassengers}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Máx. {recommendationInfo.maxSeatsPerVehicle} por veículo
                  </p>
                </div>
                <div className="bg-white/60 p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Luggage className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700">
                      Malas
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {recommendationInfo.totalLuggage}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Máx. {recommendationInfo.maxLuggagePerVehicle} por veículo
                  </p>
                </div>
                <div className="bg-white/60 p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CarIcon className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700">
                      Veículos Necessários
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {recommendationInfo.vehiclesNeeded}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Selecione abaixo
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
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

      {/* Banner de Correspondência Parcial / Sugestões */}
      {cars.length > 0 && cars[0].isPartialMatch && (
        <motion.div
          {...({
            initial: { opacity: 0, y: -10 },
            animate: { opacity: 1, y: 0 },
            className: "bg-blue-50 border-2 border-blue-200 p-6 mb-6 shadow-sm",
          } as any)}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Info className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-2 tracking-tight">Sem resultados exatos</h3>
              <p className="text-blue-800 font-bold mb-1">
                Não encontramos veículos que correspondam exatamente a todos os filtros selecionados.
              </p>
              <p className="text-sm text-blue-700">
                Abaixo estão listadas as melhores alternativas disponíveis baseadas na sua pesquisa.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {false ? (
        // GRID VIEW - DISABLED
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 shadow-sm overflow-hidden"
                >
                  <Skeleton className="w-full h-48" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {cars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => toggleOfferSelection(car.id)}
                  className={cn(
                    "bg-white shadow-md border overflow-hidden transition-all duration-300 cursor-pointer group",
                    selectedOfferIds.includes(car.id)
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-slate-200 hover:shadow-lg hover:border-slate-300",
                    car.isRecommendedForMultiple && "border-amber-400 bg-amber-50/10"
                  )}
                >
                  {/* Imagem Banner */}
                  <div className="relative h-32 bg-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
                    <img
                      src={car.image || "/car-placeholder.png"}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge de Disponibilidade */}
                    <div className="absolute top-3 left-3 z-20">
                      <Badge className="bg-slate-900 text-white font-bold px-3 py-1 uppercase text-xs">
                        Disponível
                      </Badge>
                    </div>

                    {/* Categoria Badge */}
                    <div className="absolute bottom-3 right-3 z-20">
                      <Badge className="bg-blue-600 text-white font-bold px-3 py-1 uppercase text-xs">
                        {car.category || car.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-3">
                    {/* Título e Rating (removido aqui — exibido acima do botão à direita) */}
                    {/* Informações do veículo: compact line removed per UX request */}
                    <div className="text-xs font-bold text-slate-700">Informação do veículo</div>
                    {/* Badges de Tipo */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-bold uppercase h-5">
                        {car.transmission === 'automatic' ? 'Automático' : 'Manual'}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-bold uppercase h-5">
                        {car.seats} Lugares
                      </Badge>
                    </div>

                    {/* Especificações Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users size={12} className="text-slate-500" />
                        <span className="text-slate-700 font-medium">{car.seats} Lugares</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Zap size={12} className="text-slate-500" />
                        <span className="text-slate-700 font-medium">{car.transmission === 'automatic' ? 'Automático' : 'Manual'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Luggage size={12} className="text-slate-500" />
                        <span className="text-slate-700 font-medium">{car.luggage_big || car.luggage || 0} Malas</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin size={12} className="text-slate-500" />
                        <span className="text-slate-700 font-medium">
                          {currentType === "transfer"
                            ? (car.distanceString || "S/D")
                            : "Ilimitada"}
                        </span>
                      </div>
                    </div>

                    {/* Serviços Inclusos */}
                    {car.includedServices && car.includedServices.length > 0 && (
                      <div className="mb-2 pb-2 border-b border-slate-200">
                        <p className="text-xs font-bold text-slate-600 uppercase mb-1">Serviços</p>
                        <div className="flex flex-wrap gap-1">
                          {car.includedServices.slice(0, 3).map((service, idx) => (
                            <Badge key={idx} className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-1.5 py-0.5">
                              <Check size={8} className="mr-1" /> {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ação: botão agora inclui o preço (base + seguro + extras se existirem) */}
                    <div className="flex items-end justify-between gap-2">
                      <div />
                      <ActionColumn car={car} />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        // LIST VIEW - Linhas finas
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-44 w-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => toggleOfferSelection(car.id)}
                  className={cn(
                    "flex flex-col md:flex-row items-start md:items-center gap-4 p-4 md:px-4 md:h-52 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all cursor-pointer border-l-4 w-full",
                    selectedOfferIds.includes(car.id)
                      ? "border-l-primary ring-1 ring-primary/20 bg-primary/5"
                      : "border-l-transparent hover:border-l-primary/30",
                    car.isRecommendedForMultiple && "bg-amber-50/40"
                  )}
                >
                  {/* Imagem */}
                  <div className="w-full md:w-32 h-40 md:h-32 bg-slate-50 flex-shrink-0 overflow-hidden flex items-center justify-center rounded-sm">
                    <img
                      src={car.image || "/car-placeholder.png"}
                      alt={car.name}
                      className="w-4/5 h-4/5 object-contain"
                    />
                  </div>

                  {/* Conteúdo Principal - Centro */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between w-full md:h-full py-0 md:py-2">
                    {/* Informação do veículo */}
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Informação do veículo</div>

                    {/* Especificações - Grid Progressivo */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-2 md:gap-x-1 text-xs mb-4 md:mb-0">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700 font-bold">{car.seats} <span className="hidden sm:inline">Passageiros</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700 font-bold">{car.transmission === 'automatic' ? 'Auto' : 'Manual'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Luggage size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700 font-bold">{car.luggage_big || 0} <span className="hidden sm:inline">Malas</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700 font-bold truncate">
                          {currentType === "transfer" ? (car.distanceString || "S/D") : "Ilimitado"}
                        </span>
                      </div>
                    </div>

                    {/* Extras disponíveis (mostrar até 4) */}
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-1.5 pt-3 md:pt-0 border-t border-slate-100 md:border-0">
                        {((car as any).extrasObjects || [])
                          .slice(0, 3)
                          .map((ex: any) => (
                            <span key={ex.id} className="text-[9px] md:text-[10px] bg-slate-50 rounded-none px-2 py-1 font-bold text-slate-500 border border-slate-100 flex items-center gap-1.5 transition-all">
                              <Check size={10} className="text-green-500" />
                              {ex.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Botão Seleção - Alinhamento Responsivo */}
                  <div className="w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 flex justify-end">
                    <ActionColumn car={car} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
          ) : null}
        </div>
      )}


      {!loading && (cars.length === 0 || !shouldShowResults) && (
        <div className="text-center py-24 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl mx-4">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            {!shouldShowResults
              ? "Prepare sua viagem"
              : "Nenhum resultado encontrado"}
          </h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            {!shouldShowResults
              ? "Clique no botão 'Pesquisar' no formulário acima para ver as melhores ofertas disponíveis."
              : "Não encontramos veículos para os critérios selecionados. Tente ajustar os filtros ou mudar as datas da sua pesquisa."}
          </p>
        </div>
      )}
    </div>
  );
}
