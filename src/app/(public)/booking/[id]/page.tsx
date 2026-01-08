"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { getCarsByIds } from "@/actions/public/search/cars";
import { getExtras } from "@/actions/public/extras";
import { Car } from "@/types/cars";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Plus,
  Minus,
  ChevronRight,
  Baby,
  Navigation as GpsIcon,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Info,
  Wifi,
  Sparkles,
  X,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateNif } from "@/actions/public/nif";
import { useSearchParams } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { decodeState } from "@/lib/url-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BookingDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cars, setCars] = useState<Car[]>([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>(
    {},
  );

  const [isValidatingNif, setIsValidatingNif] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchContext, setSearchContext] = useState<any>(null);

  const currentType =
    searchContext?.type ||
    searchParams.get("type") ||
    (cars[0]?.availableFor === "transfer" ? "transfer" : "rental");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ddi: "+244",
    billingType: "individual", // 'individual' | 'company'
    documentId: "", // BI ou Passaporte
    drivingLicense: "",
    billingName: "",
    nif: "",
    address: "",
  });

  // Helper: Verifica se um extra já está incluído no carro
  const isExtraIncludedInCar = (car: Car, extraId: string): boolean => {
    return car.extras?.includes(extraId) || false;
  };

  // Identificação de motorista profissional na reserva (considerando remoção de incluídos)
  const hasProfessionalDriver = cars.some((car) => {
    const isIncluded = isExtraIncludedInCar(car, "driver");
    const currentQty =
      selectedExtras[`${car.id}-driver`] ?? (isIncluded ? 1 : 0);
    return currentQty > 0;
  });

  const handleNifChange = async (val: string) => {
    setFormData((prev) => ({ ...prev, nif: val }));
    setValidationError(false);
    if (val.length >= 9) {
      setIsValidatingNif(true);
      const result = await validateNif(val);
      if (result.success && result.data) {
        setFormData((prev) => ({
          ...prev,
          billingName: result.data.name,
          firstName: !hasProfessionalDriver
            ? result.data.name.split(" ")[0]
            : prev.firstName,
          lastName: !hasProfessionalDriver
            ? result.data.name.split(" ").slice(1).join(" ")
            : prev.lastName,
        }));
        setValidationError(false);
      } else {
        setValidationError(true);
        setFormData((prev) => ({ ...prev, billingName: "" }));
      }
      setIsValidatingNif(false);
    } else {
      setFormData((prev) => ({ ...prev, billingName: "" }));
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const sParam = searchParams.get("s");
        if (sParam) {
          const decoded = decodeState(sParam);
          if (decoded && decoded.offers) {
            setCars(decoded.offers);
            if (decoded.search) setSearchContext(decoded.search);
            setLoading(false);
            return;
          }
        }

        if (id && id !== "checkout") {
          const rawId = Array.isArray(id) ? id[0] : id;
          const decodedId = decodeURIComponent(rawId);
          const ids = decodedId
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);
          const data = await getCarsByIds(ids);
          if (data && data.length > 0) setCars(data);
        }
      } catch (error) {
        console.error("BookingPage: Error", error);
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

  const calculateTotal = () => {
    const isTransfer = currentType === "transfer";
    const rentalDays = isTransfer ? 1 : 3;
    let total = 0;

    cars.forEach((car) => {
      if (isTransfer) {
        total += car.price;
      } else {
        total += car.price * rentalDays;
        total += (car.insurance?.dailyPrice || 0) * rentalDays;
      }
    });

    Object.entries(selectedExtras).forEach(([key, qty]) => {
      const segments = key.split("-");
      const extraId = segments.length > 1 ? segments[1] : key;
      const carId = segments.length > 1 ? segments[0] : null;

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

  const finalTotal = calculateTotal();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 font-bold italic tracking-tighter">
        A carregar detalhes...
      </div>
    );
  if (cars.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 font-bold italic">
        Nenhum veículo selecionado.
      </div>
    );

  const ALL_EXTRAS_NAMES: Record<string, string> = {
    driver: "Motorista Profissional",
    gps: "Navegação GPS",
    wifi: "WiFi Portátil",
    baby_seat: "Cadeira de Bebé",
    insurance: "Proteção Total Premium",
    limpeza: "Limpeza Profunda",
  };

  return (
    <div className="min-h-screen bg-[#f8faff] pb-32">
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-500 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto no-scrollbar whitespace-nowrap">
              <span>Resultados</span>{" "}
              <ChevronRight className="h-4 w-4 shrink-0" />
              <span className="text-[#006ce4] font-bold">
                Serviços Extra & Dados
              </span>{" "}
              <ChevronRight className="h-4 w-4 shrink-0" />
              <span>Pagamento</span>
            </div>
            <div className="flex items-center gap-3 bg-green-50 px-3 py-1.5 rounded-sm border border-green-100 shrink-0">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="text-[10px] md:text-xs font-bold text-green-800 tracking-tight">
                Checkout Seguro
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
                Personalize sua Reserva
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Adicione extras e preencha os dados do condutor para concluir.
              </p>
            </div>

            {/* Profile/Billing Info */}
            <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#003580] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs italic">
                  2
                </span>
                Dados da Faturação
              </h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[13px] font-bold text-gray-700">
                    Tipo de Fatura
                  </Label>
                  <RadioGroup
                    defaultValue="individual"
                    className="flex gap-4"
                    value={formData.billingType}
                    onValueChange={(val) =>
                      setFormData({ ...formData, billingType: val })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="r1" />
                      <Label
                        htmlFor="r1"
                        className="font-medium cursor-pointer"
                      >
                        Individual
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="company" id="r2" />
                      <Label
                        htmlFor="r2"
                        className="font-medium cursor-pointer"
                      >
                        Empresa
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-gray-700">
                      Primeiro Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="h-11 border-gray-300"
                      placeholder="Primeiro nome"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-gray-700">
                      Último Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="h-11 border-gray-300"
                      placeholder="Último nome"
                    />
                  </div>
                  <div className="flex gap-[30px] items-end">
                    <div className="flex flex-col max-w-[80px] w-full">
                      <Label className="text-[13px] font-bold text-gray-700 mb-1 whitespace-nowrap">
                        Código do País <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.ddi}
                        onChange={(e) =>
                          setFormData({ ...formData, ddi: e.target.value })
                        }
                        className="h-11 border-gray-300 text-center"
                        placeholder="+244"
                      />
                    </div>
                    <div className="flex flex-col flex-[2] min-w-[160px] w-full">
                      <Label className="text-[13px] font-bold text-gray-700 mb-1">
                        Telefone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="h-11 border-gray-300"
                        placeholder="9..."
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[13px] font-bold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-11 border-gray-300"
                      placeholder="examplo@email.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {!hasProfessionalDriver && (
              <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-[#003580] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs italic">
                    3
                  </span>
                  Informação do Condutor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-gray-700">
                      Primeiro Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="h-11 border-gray-300"
                      placeholder="João"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-gray-700">
                      Apelido <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="h-11 border-gray-300"
                      placeholder="Silva"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-[13px] font-bold text-gray-700">
                      Carta de Condução <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.drivingLicense}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          drivingLicense: e.target.value,
                        })
                      }
                      className="h-11 border-gray-300"
                      placeholder="Nº da Carta"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <aside className="space-y-6">
            {/* Extra Services Section - Moved to sidebar */}
            <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-[#003580] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] italic">
                  1
                </span>
                Serviços Extras
              </h2>

              <div className="space-y-6">
                {cars.map((car) => (
                  <div key={car.id} className="space-y-4">
                    <>
                      <Select
                        onValueChange={(extraId) => {
                          const key = `${car.id}-${extraId}`;
                          setSelectedExtras((prev) => ({
                            ...prev,
                            [key]: (prev[key] || 0) + 1,
                          }));
                        }}
                      >
                        <SelectTrigger className="w-full h-11 text-xs font-bold uppercase border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <Plus className="h-3.5 w-3.5 text-[#006ce4]" />
                            <SelectValue placeholder="Adicionar novos extras" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {extras
                            .filter((e) => {
                              const key = `${car.id}-${e.id}`;
                              const isIncluded = isExtraIncludedInCar(
                                car,
                                e.id,
                              );
                              // Não mostrar extras já incluídos
                              if (isIncluded) return false;
                              const currentQty = selectedExtras[key] ?? 0;
                              return currentQty === 0 || e.allowQuantity;
                            })
                            .map((e) => {
                              const priceLabel =
                                e.price === 0
                                  ? "GRÁTIS"
                                  : `AOA ${e.price.toLocaleString()}`;
                              const perLabel = e.perDay ? "/dia" : "";
                              return (
                                <SelectItem
                                  key={e.id}
                                  value={e.id}
                                  className="text-xs py-3 cursor-pointer"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-gray-900">
                                      {e.name}
                                    </span>
                                    <span className="text-[10px] text-[#006ce4] font-black">
                                      {priceLabel}
                                      {perLabel}
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>

                      <div className="grid grid-cols-1 gap-3">
                        {extras.map((extra) => {
                          const key = `${car.id}-${extra.id}`;
                          const isIncluded = isExtraIncludedInCar(
                            car,
                            extra.id,
                          );
                          const currentQty =
                            selectedExtras[key] ?? (isIncluded ? 1 : 0);

                          if (currentQty === 0) return null;

                          return (
                            <div
                              key={key}
                              className={cn(
                                "p-3 border transition-all flex flex-col justify-between bg-white rounded-sm",
                                isIncluded
                                  ? "border-blue-100 bg-blue-50/10"
                                  : "border-blue-200 bg-blue-50/5",
                              )}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-gray-900">
                                    {extra.name}
                                  </span>
                                  {isIncluded && (
                                    <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] h-4 uppercase font-black">
                                      Incluído
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {extra.allowQuantity ? (
                                    <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-1 py-0.5">
                                      <button
                                        onClick={() =>
                                          setSelectedExtras((prev) => ({
                                            ...prev,
                                            [key]: Math.max(0, currentQty - 1),
                                          }))
                                        }
                                        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-400 cursor-pointer"
                                      >
                                        <Minus className="h-2.5 w-2.5" />
                                      </button>
                                      <span className="font-bold text-[10px] w-3 text-center">
                                        {currentQty}
                                      </span>
                                      <button
                                        onClick={() =>
                                          setSelectedExtras((prev) => ({
                                            ...prev,
                                            [key]: currentQty + 1,
                                          }))
                                        }
                                        className="w-5 h-5 rounded-full bg-[#006ce4] text-white flex items-center justify-center hover:bg-[#005bb5] cursor-pointer"
                                      >
                                        <Plus className="h-2.5 w-2.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setSelectedExtras((prev) => ({
                                          ...prev,
                                          [key]: 0,
                                        }))
                                      }
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 italic line-clamp-1 flex-1 mr-2">
                                  {extra.description}
                                </span>
                                <span className="text-[11px] font-black text-[#003580] shrink-0">
                                  {isIncluded
                                    ? "Grátis"
                                    : `AOA ${((extra.perDay ? extra.price * (currentType === "transfer" ? 1 : 3) : extra.price) * currentQty).toLocaleString()}`}
                                  {currentQty > 1 && !isIncluded && (
                                    <span className="text-[9px] text-gray-400 ml-1">
                                      (x{currentQty})
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[4px] p-5 shadow-xl border border-blue-50 sticky top-24">
              <h4 className="text-xs font-bold text-[#003580] uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
                Resumo da Reserva
              </h4>

              <div className="space-y-4">
                {cars.map((car) => (
                  <div key={car.id} className="pb-3 border-b border-gray-50">
                    <div className="flex justify-between items-start mb-1 text-sm">
                      <span className="font-bold text-black">{car.name}</span>
                      <span className="font-black">
                        AOA{" "}
                        {(
                          car.price * (currentType === "transfer" ? 1 : 3)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                      {currentType === "transfer"
                        ? "Viagem Direta"
                        : "Aluguer - 3 Dias"}
                    </div>
                    {currentType !== "transfer" &&
                      car.insurance?.dailyPrice && (
                        <div className="flex justify-between text-[11px] text-green-600 font-bold mt-1 uppercase">
                          <span>Proteção Total (Pack)</span>
                          <span>
                            AOA{" "}
                            {(car.insurance.dailyPrice * 3).toLocaleString()}
                          </span>
                        </div>
                      )}
                  </div>
                ))}

                {/* Selected Extras List (including toggled included ones) */}
                <AnimatePresence>
                  {extras
                    .flatMap((extra) =>
                      cars.map((car) => {
                        const key = `${car.id}-${extra.id}`;
                        const isIncluded = isExtraIncludedInCar(car, extra.id);
                        const qty = selectedExtras[key] ?? (isIncluded ? 1 : 0);

                        if (qty === 0) return null;

                        const extraName =
                          ALL_EXTRAS_NAMES[extra.id] || extra.name;
                        const price = isIncluded
                          ? 0
                          : extra.perDay
                            ? extra.price * (currentType === "transfer" ? 1 : 3)
                            : extra.price;

                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex justify-between items-center text-[11px] font-bold py-1"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  isIncluded ? "bg-blue-400" : "bg-green-500",
                                )}
                              ></span>
                              <span className="text-gray-600 uppercase">
                                {extraName} {qty > 1 && `(x${qty})`}
                              </span>
                            </div>
                            <span
                              className={cn(
                                isIncluded ? "text-blue-500" : "text-[#008009]",
                              )}
                            >
                              {isIncluded
                                ? "GRÁTIS"
                                : `AOA ${(price * qty).toLocaleString()}`}
                            </span>
                          </motion.div>
                        );
                      }),
                    )
                    .filter(Boolean)}
                </AnimatePresence>

                <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-100">
                  <div className="flex justify-between items-center text-black">
                    <span className="text-sm font-bold uppercase tracking-tight">
                      Preço Total
                    </span>
                    <span className="text-lg font-bold">
                      AOA {finalTotal.toLocaleString("pt-AO")}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase mt-2">
                    * Taxas e impostos inclusos no valor total.
                  </p>
                </div>

                <Button
                  className="w-full h-14 bg-[#003580] hover:bg-black text-white font-black uppercase tracking-widest mt-6 rounded-none border-none transition-all active:scale-95"
                  onClick={async () => {
                    setIsNavigating(true);
                    try {
                      const allIds = cars.map((c) => c.id).join(",");
                      const draftResponse = await fetch("/api/drafts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          carIds: cars.map((c) => c.id),
                          selectedExtras: selectedExtras,
                          searchContext: searchContext,
                          firstName:
                            formData.firstName ||
                            formData.billingName?.split(" ")[0] ||
                            "",
                          lastName:
                            formData.lastName ||
                            formData.billingName
                              ?.split(" ")
                              .slice(1)
                              .join(" ") ||
                            "",
                          email: formData.email,
                          phone: `${formData.ddi} ${formData.phone}`,
                          billingType: formData.billingType,
                          nif: formData.nif,
                          billingName: formData.billingName,
                        }),
                      });

                      const { id: draftId } = await draftResponse.json();

                      const params = new URLSearchParams();
                      params.set("s", searchParams.get("s") || "");
                      params.set("did", draftId);

                      router.push(
                        `/booking/checkout/${allIds}?${params.toString()}`,
                      );
                    } catch (error) {
                      console.error("Erro ao processar checkout:", error);
                    } finally {
                      setIsNavigating(false);
                    }
                  }}
                >
                  {isNavigating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Prosseguir Pagamento"
                  )}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
