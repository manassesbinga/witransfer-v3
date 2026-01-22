"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { getCarsByIds } from "@/actions/public/search/cars";
import { getExtras } from "@/actions/public/extras";
import { simulatePayment } from "@/actions/public/simulate-payment";
import { Car, Extra, SearchFilters } from "@/types";
// No URL-encoded state; use server-side drafts (`did`)
import { getDraftAction } from "@/actions/public/drafts";
import { createBookingAction } from "@/actions/public/bookings";
import { Header } from "@/components/header/public";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import BookingLoading from "../../loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";


export default function CheckoutPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cars, setCars] = useState<Car[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ddi: "+244",
    nif: "",
    billingName: "",
    billingType: "individual",
    drivingLicense: "",
    paymentMethod: "gpo",
    isProcessing: false,
    isSuccess: false,
  });

  const [reservationDates, setReservationDates] = useState<{
    from?: string;
    to?: string;
  }>({});
  const [searchContext, setSearchContext] = useState<SearchFilters | null>(null);

  // Consolidated Draft Loading
  useEffect(() => {
    async function fetchMainData() {
      const draftId = searchParams.get("did");
      let draft: any = null;

      // 1. Try Local Cache (fastest & bypasses 431)
      if (typeof window !== "undefined") {
        const localData = draftId ? sessionStorage.getItem(draftId) : sessionStorage.getItem("witransfer_last_search");
        if (localData) {
          try {
            draft = JSON.parse(localData);
            console.log("Loaded Checkout draft from sessionStorage");
          } catch (e) { }
        }
      }

      // 2. Try Server Draft
      if (draftId && draftId.length > 20) {
        try {
          const serverDraft = await getDraftAction(draftId) as any;
          if (serverDraft) {
            draft = { ...serverDraft, ...(serverDraft.data || {}) };
            console.log("Loaded Checkout draft from server");
          }
        } catch (error) {
          console.warn("Could not load server draft in checkout:", error);
        }
      }

      if (draft) {
        // Priority 1: User data from draft
        setFormData((prev) => ({
          ...prev,
          firstName: draft.firstName || draft.customer?.firstName || "",
          lastName: draft.lastName || draft.customer?.lastName || "",
          email: draft.email || draft.customer?.email || "",
          phone: (draft.phone || draft.customer?.phone || "").replace(/^\+\d+\s/, ""),
          ddi: (draft.phone || draft.customer?.phone || "").split(" ")[0] || "+244",
          billingType: draft.billingType || "individual",
          nif: draft.nif || "",
          drivingLicense: draft.drivingLicense || draft.customer?.drivingLicense || "",
          billingName: draft.billingName || "",
        }));

        // Extras já vêm com o veículo - não há seleção

        // Priority 3: Search Context
        const ctx = draft.search || draft.searchContext || {
          pickup: draft.pickup,
          dropoff: draft.dropoff,
          from: draft.from,
          to: draft.to,
          date: draft.date,
          time: draft.time,
          time1: draft.time1,
          time2: draft.time2,
          type: draft.type,
          passengers: draft.passengers,
          luggage: draft.luggage,
        };
        // Filter out null values
        const cleanCtx = Object.fromEntries(
          Object.entries(ctx).filter(([_, v]) => v !== null && v !== undefined)
        );
        if (Object.keys(cleanCtx).length > 0 && (cleanCtx.pickup || cleanCtx.from)) {
          setSearchContext(cleanCtx as any);
          setReservationDates({
            from: cleanCtx.from || cleanCtx.date || undefined,
            to: cleanCtx.to || cleanCtx.date || undefined,
          });
        }

        // Priority 4: Cars
        if (Array.isArray(draft.carIds) && draft.carIds.length > 0) {
          const carsData = await getCarsByIds(draft.carIds);
          // Apply summaries (pricing cache) if available
          const enhancedCars = (carsData || []).map(car => {
            const summary = (draft.summaries || []).find((s: any) => s.id === car.id);
            if (summary) return { ...car, totalPrice: summary.totalPrice, baseTotal: summary.baseTotal, extrasTotal: summary.extrasTotal };
            return car;
          });
            setCars(enhancedCars);
            try { await fetchExtrasForCars(enhancedCars); } catch (e) { }
        } else if (Array.isArray(draft.offers) && draft.offers.length > 0) {
            setCars(draft.offers as any[]);
            try { await fetchExtrasForCars(draft.offers as any[]); } catch (e) { }
        }
      } else {
        // Handle no-draft fallback (direct IDs in URL)
        if (id && id !== "checkout") {
          const rawId = Array.isArray(id) ? id[0] : id;
          const decodedId = decodeURIComponent(rawId);
          const ids = decodedId.split(",").map(i => i.trim()).filter(Boolean);
          if (ids.length > 0) {
            const data = await getCarsByIds(ids);
            if (data) { setCars(data); try { await fetchExtrasForCars(data); } catch (e) { } }
          }
        }
        setReservationDates({
          from: searchParams.get("from") || searchParams.get("date") || undefined,
          to: searchParams.get("to") || searchParams.get("date") || undefined,
        });
      }
      setLoading(false);
    }

    async function fetchExtrasForCars(loadedCars: any[]) {
      try {
        const vehicleIds = Array.from(new Set(loadedCars.map((c) => c.id).filter(Boolean)));
        const partnerIds = Array.from(new Set(loadedCars.map((c) => c.partnerId || c.partner_id).filter(Boolean)));
        const extrasMap: Record<string, any> = {};

        await Promise.all(vehicleIds.map(async (vid) => {
          try {
            const ev = await getExtras({ vehicleId: vid });
            (ev || []).forEach((e: any) => { extrasMap[e.id] = e; });
          } catch (e) { }
        }));

        await Promise.all(partnerIds.map(async (pid) => {
          try {
            const ep = await getExtras({ partnerId: pid });
            (ep || []).forEach((e: any) => { extrasMap[e.id] = e; });
          } catch (e) { }
        }));

        setExtras(Object.values(extrasMap));
      } catch (e) { }
    }

    fetchMainData();
  }, [id, searchParams]);

  const calculateTotal = () => {
    // Preços já vêm calculados do servidor - apenas somar
    return cars.reduce((total, car) => total + ((car as any).totalPrice || 0), 0);
  };

  const handleBook = async () => {
    setFormData((prev) => ({ ...prev, isProcessing: true }));

    try {
      const carIds = cars.map((c) => c.id);
      const totalAmount = calculateTotal();
      const paymentId = `P${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;

      const paymentResult = await simulatePayment({
        paymentId,
        amount: totalAmount,
        method: formData.paymentMethod as "gpo" | "reference" | "proposal",
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        metadata: {
          carIds,
          searchContext,
        },
      });

      if (!paymentResult.success) {
        throw new Error(
          paymentResult.message || "Falha ao processar pagamento",
        );
      }

      // Normalize search context to ensure pickup/dropoff/from/to are passed to server
      let payloadSearch = searchContext;
      if (!payloadSearch) {
        // try to read draft from sessionStorage (client-side cache)
        const did = searchParams.get("did");
        if (did && typeof window !== "undefined") {
          try {
            const raw = sessionStorage.getItem(did) || sessionStorage.getItem("witransfer_last_search") || sessionStorage.getItem("witransfer_last_did") && sessionStorage.getItem(sessionStorage.getItem("witransfer_last_did") || "");
            if (raw) {
              const parsed = JSON.parse(raw);
              payloadSearch = parsed.search || parsed.searchContext || parsed;
            }
          } catch (e) {
            // ignore
          }
        } else if (typeof window !== "undefined") {
          // No did in URL: try last saved draft/search
          try {
            const raw = sessionStorage.getItem("witransfer_last_search") || (sessionStorage.getItem("witransfer_last_did") ? sessionStorage.getItem(sessionStorage.getItem("witransfer_last_did")!) : null);
            if (raw) {
              const parsed = JSON.parse(raw);
              payloadSearch = parsed.search || parsed.searchContext || parsed;
            }
          } catch (e) {
            // ignore
          }
        }
      }
      // Fallback to URL params
      payloadSearch = payloadSearch || {
        pickup: searchParams.get("pickup") || undefined,
        dropoff: searchParams.get("dropoff") || undefined,
        from: reservationDates.from || searchParams.get("from") || searchParams.get("date") || undefined,
        to: reservationDates.to || searchParams.get("to") || searchParams.get("date") || undefined,
        type: (searchParams.get("type") as any) || undefined,
      };

      const result = await createBookingAction({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        drivingLicense: formData.drivingLicense,
        nif: formData.nif,

        carIds: carIds,
        totalAmount,
        searchContext: payloadSearch,
        // also include pickup/dropoff explicitly for redundancy
        pickup: payloadSearch?.pickup,
        dropoff: payloadSearch?.dropoff,
        from: payloadSearch?.from,
        to: payloadSearch?.to,
        payment: {
          method: formData.paymentMethod,
          paymentId,
          status: "success",
        },
      });

      if (result.success && result.booking?.id && result.user?.id) {
        localStorage.setItem("is_auth", "true");
        localStorage.setItem("user_email", formData.email);

        toast.success("Reserva realizada com sucesso!", {
          description: "Enviamos um email com os detalhes da sua confirmação.",
          duration: 5000,
        });

        setFormData((prev) => ({
          ...prev,
          // We keep isProcessing: true to maintain the loading state on the button
          isSuccess: true,
        }));

        // Redirecionamento automático após sucesso
        setTimeout(() => {
          const isAuth = localStorage.getItem("is_auth") === "true";
          if (isAuth) {
            router.push("/history"); // Redireciona para Minhas Viagens se logado
          } else {
            router.push("/search/rental"); // Se não logado, redireciona para pesquisa
          }
        }, 3000); // Aguarda 3 segundos para que o utilizador possa ver a mensagem de sucesso
      } else {
        console.error("Falha de integridade na reserva:", result);
        throw new Error(result.error || "Falha crítica: A reserva não pode ser confirmada completamente.");
      }
    } catch (error) {
      console.error("Erro ao processar reserva:", error);
      setFormData((prev) => ({ ...prev, isProcessing: false }));

      toast.error("Não foi possível concluir a reserva", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        duration: 5000,
      });
    }
  };

  if (loading) return <BookingLoading />;

  if (cars.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="bg-white rounded-none p-8 text-center max-w-sm mx-4">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Sessão expirada
          </h2>
          <p className="text-gray-600 mb-6">
            A sua sessão de pesquisa expirou. Por favor, inicie uma nova
            pesquisa.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-[#006ce4] hover:bg-[#005bb3] text-white font-bold h-12 rounded-none"
          >
            Voltar à Página Inicial
          </Button>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-32">
      <div className="bg-white border-b border-gray-200 py-3 shadow-sm relative z-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-[#003580] -ml-2 font-bold transition-all px-2"
              onClick={() => router.back()}
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              Voltar
            </Button>

            <div className="h-4 w-[1px] bg-gray-200 hidden md:block"></div>

            <nav className="hidden md:flex items-center gap-2 text-xs font-medium">
              <span className="text-gray-400">Resultados</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-gray-400">Sua oferta</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-[#006ce4] font-bold">Dados da reserva</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-gray-400">Pagamento</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded border border-green-100/50">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-bold tracking-tight">
              Pagamento 100% Seguro
            </span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-5">


            {/* 1. Dados da Faturação (NIF) */}
            <div className="bg-white rounded-none p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#003580] text-white w-7 h-7 rounded-none flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Método de Pagamento
              </h2>

              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(val) =>
                  setFormData({ ...formData, paymentMethod: val })
                }
                className="space-y-3"
              >
                <div
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-none cursor-pointer transition-all",
                    formData.paymentMethod === "gpo"
                      ? "border-[#006ce4] bg-blue-50/30 ring-1 ring-[#006ce4]"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <RadioGroupItem value="gpo" id="gpo" className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor="gpo"
                      className="font-semibold text-gray-900 cursor-pointer text-base flex items-center gap-2"
                    >
                      GPO (Cartão ou Multicaixa)
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        Recomendado
                      </span>
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Pagamento instantâneo via portal GPO.
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-none cursor-pointer transition-all",
                    formData.paymentMethod === "reference"
                      ? "border-[#006ce4] bg-blue-50/30 ring-1 ring-[#006ce4]"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <RadioGroupItem
                    value="reference"
                    id="reference"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="reference"
                      className="font-semibold text-gray-900 cursor-pointer text-base"
                    >
                      Referência Multicaixa
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Pague no ATM ou Internet Banking.
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-none cursor-pointer transition-all",
                    formData.paymentMethod === "proposal"
                      ? "border-[#006ce4] bg-blue-50/30 ring-1 ring-[#006ce4]"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <RadioGroupItem
                    value="proposal"
                    id="proposal"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="proposal"
                      className="font-semibold text-gray-900 cursor-pointer text-base"
                    >
                      Receber Proposta por Email
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receba um email com instruções para pagamento posterior.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <Lock className="h-3 w-3" />
              Seus dados de pagamento são processados de forma segura e
              encriptada.
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-4">
            <div className="bg-white rounded-none p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Resumo da Reserva
              </h3>
              <div className="flex gap-4 mb-4 border-b border-gray-100 pb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-400">
                    Levantamento
                  </span>
                  <span className="font-bold text-gray-900 text-[10px] md:text-xs">
                    {reservationDates.from && reservationDates.from !== "---"
                      ? format(parseISO(reservationDates.from), "dd MMM yyyy", { locale: pt })
                      : "---"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {reservationDates.from && reservationDates.from !== "---"
                      ? format(parseISO(reservationDates.from), "HH:mm")
                      : "10:00"}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[9px] font-bold text-gray-400">
                    Devolução
                  </span>
                  <span className="font-bold text-gray-900 text-[10px] md:text-xs">
                    {reservationDates.to && reservationDates.to !== "---"
                      ? format(parseISO(reservationDates.to), "dd MMM yyyy", { locale: pt })
                      : "---"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {reservationDates.to && reservationDates.to !== "---"
                      ? format(parseISO(reservationDates.to), "HH:mm")
                      : "10:00"}
                  </span>
                </div>
              </div>

              {(searchContext?.type === "transfer" || searchParams.get("type") === "transfer") && (
                <div className="mb-4 p-3 bg-blue-50/30 border border-blue-100 rounded-none space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1"></div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-green-600 uppercase">Partida</span>
                      <span className="text-[10px] font-bold text-gray-700 line-clamp-1">{searchContext?.pickup || searchParams.get("pickup")}</span>
                    </div>
                  </div>
                  {(searchContext?.stops || []).map((stop: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 border-l border-dashed border-gray-300 ml-[2.5px] pl-3 py-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1"></div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-amber-600 uppercase">Paragem {i + 1}</span>
                        <span className="text-[10px] font-bold text-gray-600 line-clamp-1">{stop}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1"></div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-red-600 uppercase">Destino</span>
                      <span className="text-[10px] font-bold text-gray-700 line-clamp-1">{searchContext?.dropoff || searchParams.get("dropoff")}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {cars.map((car) => {
                  const isTransfer =
                    searchContext?.type === "transfer" ||
                    searchParams.get("type") === "transfer" ||
                    car.availableFor === "transfer";
                  const fromDate = reservationDates.from;
                  const toDate = reservationDates.to;
                  const pickup =
                    searchContext?.pickup ||
                    searchParams.get("pickup") ||
                    "Aeroporto";
                  const dropoff =
                    searchContext?.dropoff ||
                    searchParams.get("dropoff") ||
                    "Centro";

                  let rentalDays = 3;
                  if (fromDate && toDate) {
                    const d1 = new Date(fromDate);
                    const d2 = new Date(toDate);
                    const diffTime = Math.abs(d2.getTime() - d1.getTime());
                    rentalDays =
                      Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                  }

                  const rentalPrice = (car as any).baseTotal || (isTransfer
                    ? car.price * ((car as any).distance || 30)
                    : car.price * rentalDays);
                  const insurancePrice = isTransfer
                    ? 0
                    : (car.insurance?.dailyPrice || 0) * rentalDays;

                  // Mostrar apenas extras incluídos com o veículo
                  const cardExtras = (car.extrasObjects || []) as any[];

                  return (
                    <div key={car.id} className="text-sm space-y-2">
                      <div className="font-bold text-gray-900 flex justify-between">
                        <span>{car.name}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>
                          {isTransfer
                            ? "Serviço de Transfer"
                            : `Aluguer (${rentalDays} ${rentalDays === 1 ? "dia" : "dias"})`}
                        </span>
                        <span>AOA {rentalPrice.toLocaleString("pt-AO")}</span>
                      </div>
                      {isTransfer && car.distanceString && (
                        <div className="text-[12px] text-[#006ce4] font-medium -mt-1">
                          {pickup} → {dropoff} ({car.distanceString})
                        </div>
                      )}
                      {insurancePrice > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Seguro Total</span>
                          <span>
                            AOA {insurancePrice.toLocaleString("pt-AO")}
                          </span>
                        </div>
                      )}
                      {cardExtras.map((extra: any) => {
                        const isPerDay = extra.per_day || extra.perDay;
                        const displayPrice = isPerDay ? extra.price * rentalDays : extra.price;
                        return (
                          <div
                            key={extra.id}
                            className="flex justify-between font-medium text-[#008009]"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{extra.name}</span>
                              <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] h-4">
                                Incluído
                              </Badge>
                            </div>
                            <span>
                              AOA {displayPrice.toLocaleString("pt-AO")}
                            </span>
                          </div>
                        );
                      })}
                      <div className="border-b border-gray-100 my-2"></div>
                    </div>
                  );
                })}

                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-xl text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="font-bold text-2xl text-[#003580]">
                      AOA {totalAmount.toLocaleString("pt-AO")}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Impostos incluídos
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBook}
                loading={formData.isProcessing}
                disabled={formData.isSuccess}
                className="w-full mt-6 bg-[#008009] hover:bg-[#006607] text-white font-bold h-12 text-base rounded-none shadow-md disabled:opacity-70 transition-all active:scale-95"
              >
                {formData.isSuccess
                  ? "Reserva Finalizada!"
                  : formData.paymentMethod === "pay_later"
                    ? "Confirmar Reserva"
                    : "Pagar e Confirmar"}
              </Button>

              {formData.isSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-none text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-900">Sucesso!</h4>
                  <p className="text-xs text-green-700/80 mt-1 font-medium">
                    {formData.paymentMethod === "pay_later"
                      ? "Sua reserva foi enviada. Verifique o seu e-mail para efetuar o pagamento."
                      : "Pagamento confirmado. O seu comprovativo foi enviado por e-mail."}
                  </p>
                  <Button
                    variant="link"
                    className="mt-2 text-green-800 font-semibold"
                    onClick={() => router.push("/")}
                  >
                    Voltar à página inicial
                  </Button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center font-medium">
                <ShieldCheck className="h-3 w-3" />
                <span>Cancelamento gratuito até 48h antes</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
