"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCarsByIds } from "@/actions/public/search/cars";
import { getExtras } from "@/actions/public/extras";
import { getBookingDraft } from "@/actions/public/booking/draft";
import { simulatePayment } from "@/actions/public/simulate-payment";
import { Car } from "@/types/cars";
import { decodeState } from "@/lib/url-state";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  MapPin,
  Calendar,
  Car as CarIcon,
  Info,
  Users,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { verifyEmail } from "@/actions/public/auth";
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

type Extra = {
  id: string;
  name: string;
  price: number;
  perDay: boolean;
};

export default function CheckoutPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cars, setCars] = useState<Car[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>(
    {},
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    paymentMethod: "gpo",
    isProcessing: false,
    isSuccess: false,
  });

  const [reservationDates, setReservationDates] = useState<{
    from?: string;
    to?: string;
  }>({});
  const [searchContext, setSearchContext] = useState<any>(null);

  useEffect(() => {
    async function fetchDraft() {
      const draftId = searchParams.get("did");
      if (draftId) {
        try {
          const res = await fetch(`/api/drafts?id=${draftId}`);
          if (res.ok) {
            const draftData = await res.json();
            setFormData((prev) => ({
              ...prev,
              firstName: draftData.firstName,
              lastName: draftData.lastName,
              email: draftData.email,
              phone: draftData.phone,
            }));
            if (draftData.selectedExtras) {
              setSelectedExtras(draftData.selectedExtras);
            }
            if (draftData.searchContext) {
              setSearchContext(draftData.searchContext);
              setReservationDates({
                from:
                  draftData.searchContext.date ||
                  draftData.searchContext.from ||
                  undefined,
                to:
                  draftData.searchContext.date ||
                  draftData.searchContext.to ||
                  undefined,
              });
            }
          }
        } catch (error) {
          console.error("Erro ao carregar rascunho:", error);
        }
      }
    }
    fetchDraft();
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        const sParam = searchParams.get("s");
        if (sParam) {
          const decoded = decodeState(sParam);
          if (decoded) {
            if (decoded.offers) {
              setCars(decoded.offers);
            }

            if (decoded.search) {
              setSearchContext(decoded.search);
              setReservationDates({
                from: decoded.search.date || undefined,
                to: decoded.search.date || undefined,
              });
            }
            setLoading(false);
            return;
          }
        }

        if (id && id !== "checkout") {
          const rawId = Array.isArray(id) ? id[0] : id;
          const draft = await getBookingDraft(rawId);

          let ids: string[] = [];

          if (draft) {
            ids = draft.carIds;

            if (draft.customer) {
              setFormData((prev) => ({
                ...prev,
                firstName: draft.customer.firstName || "",
                lastName: draft.customer.lastName || "",
                email: draft.customer.email || "",
                phone: draft.customer.phone || "",
              }));
            }

            if (draft.selectedExtras) {
              setSelectedExtras(draft.selectedExtras);
            }

            if (draft.from || draft.date) {
              setReservationDates({
                from: draft.from || draft.date,
                to: draft.to || draft.date,
              });
            }
          } else {
            const decodedId = decodeURIComponent(rawId);
            ids = decodedId
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean);

            setReservationDates({
              from: searchParams.get("from") || undefined,
              to: searchParams.get("to") || undefined,
            });
          }

          const data = await getCarsByIds(ids);
          if (data && data.length > 0) {
            setCars(data);
          }
        }

        const extrasParam = searchParams.get("e");
        if (extrasParam) {
          const extrasMap: Record<string, number> = {};
          extrasParam.split(",").forEach((part) => {
            const segments = part.split("-");
            if (segments.length === 2) {
              extrasMap[segments[0]] = parseInt(segments[1], 10);
            } else if (segments.length === 3) {
              extrasMap[`${segments[0]}-${segments[1]}`] = parseInt(
                segments[2],
                10,
              );
            }
          });
          setSelectedExtras(extrasMap);
        }
      } catch (error) {
        console.error("Checkout: Error loading data", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchExtras() {
      const data = await getExtras();
      setExtras(data);
    }

    loadData();
    fetchExtras();
  }, [id, searchParams]);

  const isExtraIncludedInCar = (car: Car, extraId: string): boolean => {
    return car.extras?.includes(extraId) || false;
  };

  const calculateTotal = () => {
    const fromDate = reservationDates.from;
    const toDate = reservationDates.to;
    let rentalDays = 3;

    if (fromDate && toDate) {
      const d1 = new Date(fromDate);
      const d2 = new Date(toDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }

    let total = 0;

    cars.forEach((car) => {
      const isTransfer =
        searchContext?.type === "transfer" ||
        searchParams.get("type") === "transfer" ||
        car.availableFor === "transfer";
      if (isTransfer) {
        total += car.price;
      } else {
        total += car.price * rentalDays;
        total += (car.insurance?.dailyPrice || 0) * rentalDays;
      }
    });

    Object.entries(selectedExtras).forEach(([key, qty]) => {
      const segments = key.split("-");
      const carId = segments.length > 1 ? segments[0] : null;
      const extraId = segments.length > 1 ? segments[1] : key;

      cars.forEach((car) => {
        if (
          (!carId || car.id === carId) &&
          !isExtraIncludedInCar(car, extraId)
        ) {
          const extra = extras.find((e) => e.id === extraId);
          if (extra) {
            const price = extra.perDay ? extra.price * rentalDays : extra.price;
            total += price * qty;
          }
        }
      });
    });

    return total;
  };

  const handleBook = async () => {
    setFormData((prev) => ({ ...prev, isProcessing: true }));

    try {
      const carIds = cars.map((c) => c.id);
      const totalAmount = calculateTotal();
      const paymentId = `P${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;

      // Primeiro, simula o pagamento via webhook
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
          selectedExtras,
          searchContext,
        },
      });

      if (!paymentResult.success) {
        throw new Error(
          paymentResult.message || "Falha ao processar pagamento",
        );
      }

      // Se o pagamento foi simulado com sucesso, salva a reserva
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carIds: carIds,
          selectedExtras,
          totalAmount,
          searchContext: searchContext,
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          payment: {
            method: formData.paymentMethod,
            paymentId,
            status: "success",
          },
        }),
      });

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          isProcessing: false,
          isSuccess: true,
        }));
      } else {
        throw new Error("Falha ao salvar reserva");
      }
    } catch (error) {
      console.error("Erro ao processar reserva:", error);
      setFormData((prev) => ({ ...prev, isProcessing: false }));
      alert(
        `Erro ao processar a reserva: ${error instanceof Error ? error.message : "Tente novamente."}`,
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-start justify-center bg-white pt-24">
        <div className="w-full max-w-3xl mx-4 relative">
          <Loading
            isVisible={true}
            message="A preparar pagamento seguro..."
            inline
          />
        </div>
      </div>
    );

  if (cars.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4">
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
            className="w-full bg-[#006ce4] hover:bg-[#005bb3] text-white font-bold h-12 rounded-lg"
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
            <span className="text-[10px] font-bold uppercase tracking-tight">
              Pagamento 100% Seguro
            </span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-5">
            {/* Card de dados do passageiro removido */}

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#003580] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                  {!formData.email || !searchParams.get("did") ? "2" : "1"}
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
                    "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all",
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
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                        Recomendado
                      </span>
                    </Label>
                    <p className="text-sm text-gray-500 mt-1 italic">
                      Pagamento instantâneo via portal GPO.
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all",
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
                    <p className="text-sm text-gray-500 mt-1 italic">
                      Pague no ATM ou Internet Banking.
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all",
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
                    <p className="text-sm text-gray-500 mt-1 italic">
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
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Resumo da Reserva
              </h3>
              <div className="flex gap-4 mb-4 border-b border-gray-100 pb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-gray-400">
                    Levantamento
                  </span>
                  <span className="font-bold text-gray-900 text-xs">
                    28 Dez 2025
                  </span>
                  <span className="text-[11px] text-gray-500">10:00</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[9px] uppercase font-bold text-gray-400">
                    Devolução
                  </span>
                  <span className="font-bold text-gray-900 text-xs">
                    31 Dez 2025
                  </span>
                  <span className="text-[11px] text-gray-500">10:00</span>
                </div>
              </div>

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

                  const rentalPrice = isTransfer
                    ? car.price
                    : car.price * rentalDays;
                  const insurancePrice = isTransfer
                    ? 0
                    : (car.insurance?.dailyPrice || 0) * rentalDays;
                  const cardExtras = extras
                    .map((extra) => {
                      const key = `${car.id}-${extra.id}`;
                      const isIncluded = isExtraIncludedInCar(car, extra.id);
                      const qty = selectedExtras[key] ?? (isIncluded ? 1 : 0);

                      if (qty === 0) return null;
                      return { ...extra, qty, isIncluded };
                    })
                    .filter((e): e is any => e !== null);

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
                        <div className="text-[12px] text-[#006ce4] font-medium -mt-1 italic">
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
                        const displayPrice = extra.isIncluded
                          ? 0
                          : (extra.perDay
                              ? extra.price * rentalDays
                              : extra.price) * extra.qty;
                        return (
                          <div
                            key={extra.id}
                            className={cn(
                              "flex justify-between font-medium",
                              extra.isIncluded
                                ? "text-blue-500 italic"
                                : "text-[#008009]",
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>
                                {extra.name} (x{extra.qty})
                              </span>
                              {extra.isIncluded && (
                                <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] h-4 uppercase">
                                  Incluído
                                </Badge>
                              )}
                            </div>
                            <span>
                              {extra.isIncluded
                                ? "GRÁTIS"
                                : `AOA ${displayPrice.toLocaleString("pt-AO")}`}
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
                className="w-full mt-6 bg-[#008009] hover:bg-[#006607] text-white font-bold h-12 text-base rounded-lg shadow-md disabled:opacity-70 transition-all active:scale-95"
              >
                {formData.isSuccess
                  ? "Reserva Finalizada!"
                  : formData.paymentMethod === "pay_later"
                    ? "Confirmar Reserva"
                    : "Pagar e Confirmar"}
              </Button>

              {formData.isSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
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
