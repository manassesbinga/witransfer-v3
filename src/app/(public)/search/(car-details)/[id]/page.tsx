"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getCarById, getCarsByIds } from "@/actions/public/search/cars";
import { verifyEmail } from "@/actions/public/auth";
import { Car } from "@/types/cars";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronRight,
  Info,
  MapPin,
  Users,
  Zap,
  Luggage,
  Navigation,
  Check,
  Clock,
  Briefcase,
  AlertCircle,
  ChevronDown,
  Mail,
  Plane,
  CreditCard,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CarDetailsSkeleton } from "@/components/skeletons";

interface Extra {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
  perDay?: boolean;
}

const EXTRAS_DATA: Extra[] = [
  {
    id: "driver",
    name: "Motorista Profissional",
    description: "Motorista experiente e certificado.",
    price: 25000,
    icon: Users,
    perDay: true,
  },
  {
    id: "gps",
    name: "Navegação GPS",
    description: "Sistema de navegação atualizado.",
    price: 4000,
    icon: Navigation,
    perDay: false,
  },
  {
    id: "wifi",
    name: "WiFi Portátil",
    description: "Dados ilimitados para a viagem.",
    price: 6000,
    icon: Zap,
    perDay: true,
  },
  {
    id: "baby_seat",
    name: "Cadeira de Bebé (0-13kg)",
    description: "Cadeira de segurança homologada.",
    price: 5000,
    icon: Luggage,
    perDay: false,
  },
  {
    id: "insurance",
    name: "Proteção Total Premium",
    description: "Cobertura completa sem franquia.",
    price: 15000,
    icon: ShieldCheck,
    perDay: true,
  },
  {
    id: "limpeza",
    name: "Limpeza Profunda",
    description: "Higienização completa do veículo.",
    price: 8000,
    icon: Sparkles,
    perDay: false,
  },
];

export default function DealPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromDateParam = searchParams.get("from");
  const toDateParam = searchParams.get("to");
  let rentalDays = 3;
  if (fromDateParam && toDateParam) {
    const d1 = new Date(fromDateParam);
    const d2 = new Date(toDateParam);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChecklistTab, setActiveChecklistTab] = useState(0);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>(
    {},
  );
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        if (id) {
          const rawId = Array.isArray(id) ? id[0] : id;
          const decodedId = decodeURIComponent(rawId);
          const ids = decodedId
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);

          console.log("Loading data for IDs:", ids);
          const data = await getCarsByIds(ids);

          if (data && data.length > 0) {
            setCars(data);
            setSelectedCarId(data[0].id);

            // Inicializar extras incluídos a partir dos dados reais do carro
            const initialExtras: Record<string, number> = {};
            data.forEach((car) => {
              car.extras?.forEach((extraId) => {
                initialExtras[`${car.id}-${extraId}`] = 1;
              });
            });
            setSelectedExtras(initialExtras);
          } else {
            console.warn("No cars found for IDs:", ids);
          }
        }
      } catch (error) {
        console.error("DealPage: Error loading car data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const isExtraIncludedInCar = (carId: string, extraId: string): boolean => {
    const car = cars.find((c) => c.id === carId);
    return car?.extras?.includes(extraId) || false;
  };

  const toggleExtra = (carId: string, extraId: string) => {
    const key = `${carId}-${extraId}`;
    setSelectedExtras((prev) => {
      const current = prev[key] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: 1 };
    });
  };

  const calculateExtrasTotal = () => {
    let total = 0;
    Object.entries(selectedExtras).forEach(([key, qty]) => {
      const [carId, extraId] = key.split("-");
      if (isExtraIncludedInCar(carId, extraId)) return;
      const extra = EXTRAS_DATA.find((e) => e.id === extraId);
      if (extra) {
        const price = extra.perDay ? extra.price * rentalDays : extra.price;
        total += price * qty;
      }
    });
    return total;
  };

  const selectedExtrasCountForCar = (carId: string) => {
    return Object.keys(selectedExtras).filter((key) =>
      key.startsWith(`${carId}-`),
    ).length;
  };

  if (loading) return <CarDetailsSkeleton />;
  if (cars.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 font-bold p-4 text-center">
        <p className="text-xl mb-4">Nenhuma oferta encontrada</p>
        <p className="text-base text-gray-600 mb-6">
          Parece que não conseguimos encontrar os carros que procura. Por favor,
          tente pesquisar novamente.
        </p>
        <Link
          href="/search"
          className="bg-[#006ce4] hover:bg-[#005bb5] text-white font-bold py-3 px-6 rounded-md transition-colors"
        >
          Voltar à Pesquisa
        </Link>
      </div>
    );

  const totalCarsPrice = cars.reduce(
    (acc, car) => acc + car.price * rentalDays,
    0,
  );
  const totalInsurancePrice = cars.reduce(
    (acc, car) => acc + (car.insurance?.dailyPrice || 0) * rentalDays,
    0,
  );
  const extrasTotal = calculateExtrasTotal();
  const finalTotal = totalCarsPrice + totalInsurancePrice + extrasTotal;

  return (
    <div className="min-h-screen bg-[#f8faff] text-gray-900">
      {/* Top Details Bar - Simple & Clean */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 mr-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm font-medium text-gray-900">
              <div className="flex flex-col">
                <span className="font-black truncate max-w-[150px] md:max-w-none">
                  {cars[0].locationName || "Aeroporto de Luanda"}
                </span>
                <span className="text-[11px] text-gray-500">
                  {fromDateParam
                    ? format(new Date(fromDateParam), "dd MMM yyyy, HH:mm", {
                        locale: ptBR,
                      })
                    : "28 Dez 2025, 10:00"}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="font-black truncate max-w-[150px] md:max-w-none">
                  {cars[0].locationName || "Aeroporto de Luanda"}
                </span>
                <span className="text-[11px] text-gray-500">
                  {toDateParam
                    ? format(new Date(toDateParam), "dd MMM yyyy, HH:mm", {
                        locale: ptBR,
                      })
                    : "31 Dez 2025, 10:00"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {emailVerified && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-sm border border-green-200">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] font-black text-green-700 uppercase">
                    {email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/search"
            className="text-[13px] text-[#006ce4] hover:underline flex items-center gap-1 mb-2 font-medium"
          >
            Voltar aos resultados
          </Link>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">
            A sua oferta {cars.length > 1 && `(${cars.length} carros)`}
          </h1>
          <p className="text-[15px] text-gray-600 font-medium tracking-tight">
            Próximo passo: Finalizar reserva
          </p>
          <div className="w-full h-1.5 bg-gray-200 mt-4 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-[#006ce4]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Coluna 1: Informações do Veículo */}
          <div className="space-y-6">
            {cars.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm">
                <p className="text-sm font-bold text-[#003580] flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Selecionou {cars.length} modelos diferentes para comparar ou
                  reservar.
                </p>
              </div>
            )}

            {cars.map((car, index) => (
              <div key={car.id} className="space-y-6">
                <div className="bg-[#f0fff1] border border-[#008009] p-4 rounded-sm flex gap-3 items-start">
                  <div className="bg-[#008009] rounded-full p-1 mt-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-[14px] font-bold text-gray-900">
                    Cancelamento gratuito para {car.name} até 48 horas antes
                  </span>
                </div>

                <div
                  onClick={() => setSelectedCarId(car.id)}
                  className={cn(
                    "bg-white rounded-lg p-6 shadow-sm border-2 relative transition-all cursor-pointer",
                    selectedCarId === car.id
                      ? "border-[#006ce4] ring-4 ring-[#006ce4]/5"
                      : "border-gray-100 hover:border-gray-300",
                  )}
                >
                  {cars.length > 1 && (
                    <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-1 rounded">
                      VEÍCULO {index + 1}
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-[280px] flex-shrink-0">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-auto object-contain max-h-48"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-4">
                        <h2 className="text-2xl font-black text-gray-900">
                          {car.name}
                        </h2>
                        <span className="text-sm text-[#006ce4] font-bold underline cursor-pointer flex items-center gap-1">
                          ou similar {car.type} <Info className="h-3.5 w-3.5" />
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2.5 text-[14px] font-medium text-gray-700">
                          <Users className="h-4 w-4 text-gray-400" />{" "}
                          <span>{car.seats} assentos</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[14px] font-medium text-gray-700">
                          <Zap className="h-4 w-4 text-gray-400 rotate-12" />{" "}
                          <span className="capitalize">{car.transmission}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[14px] font-medium text-gray-700">
                          <Luggage className="h-4 w-4 text-gray-400" />{" "}
                          <span>1 Mala grande</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[14px] font-medium text-gray-700">
                          <Navigation className="h-4 w-4 text-gray-400" />{" "}
                          <span>Quilometragem ilimitada</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex flex-col gap-1">
                        <p className="font-black text-[#006ce4] text-[15px]">
                          {car.locationName || "Aeroporto de Luanda"}
                        </p>
                        <p className="text-[13px] text-gray-500 font-bold uppercase tracking-tight italic">
                          Inclui Shuttle / Autocarro de cortesia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="text-[17px] font-black text-gray-900 mb-6 uppercase tracking-tight">
                Levantamento e devolução
              </h4>
              <div className="relative pl-6 space-y-12 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
                <div className="relative">
                  <div className="absolute left-[-29px] top-1 h-4 w-4 rounded-full border-2 border-gray-900 bg-white shadow-sm z-10"></div>
                  <p className="text-[14px] font-bold text-gray-900">
                    {fromDateParam
                      ? format(new Date(fromDateParam), "eee, dd MMM - HH:mm", {
                          locale: ptBR,
                        })
                      : "Dom, 28 Dez - 10:00"}
                  </p>
                  <p className="text-[14px] text-gray-700 font-medium truncate italic">
                    {cars[0].locationName || "Aeroporto de Luanda"}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute left-[-29px] top-1 h-4 w-4 rounded-full border-2 border-gray-900 bg-white shadow-sm z-10"></div>
                  <p className="text-[14px] font-bold text-gray-900">
                    {toDateParam
                      ? format(new Date(toDateParam), "eee, dd MMM - HH:mm", {
                          locale: ptBR,
                        })
                      : "Qua, 31 Dez - 10:00"}
                  </p>
                  <p className="text-[14px] text-gray-700 font-medium truncate italic">
                    {cars[0].locationName || "Aeroporto de Luanda"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-4">
                Porquê escolher esta oferta?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                <BenefitItem text="Pontuação dos clientes: 7.5 / 10" />
                <BenefitItem text="Política de combustível 'Cheio para Cheio'" />
                <BenefitItem text="Balcão fácil de encontrar" />
                <BenefitItem text="Carros higienizados" />
                <BenefitItem text="Cancelamento gratuito" />
              </div>
            </div>
          </div>

          {/* Coluna 2: Checkout e Extras */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h4 className="text-[15px] font-black text-gray-900 mb-4 uppercase tracking-tighter">
                Sua Checklist
              </h4>
              <div className="grid grid-cols-3 border-b border-gray-100 mb-4 font-black uppercase text-[9px]">
                <ChecklistTab
                  label="Horário"
                  icon={<Clock className="h-4 w-4" />}
                  active={activeChecklistTab === 0}
                  onClick={() => setActiveChecklistTab(0)}
                />
                <ChecklistTab
                  label="O que levar"
                  icon={<Luggage className="h-4 w-4" />}
                  active={activeChecklistTab === 1}
                  onClick={() => setActiveChecklistTab(1)}
                />
                <ChecklistTab
                  label="Caução"
                  icon={<Zap className="h-4 w-4" />}
                  active={activeChecklistTab === 2}
                  onClick={() => setActiveChecklistTab(2)}
                />
              </div>
              <div className="min-h-[50px]">
                {activeChecklistTab === 0 && (
                  <p className="text-[12px] text-gray-600 font-medium italic">
                    Recomendamos chegar 15 min antes.
                  </p>
                )}
                {activeChecklistTab === 1 && (
                  <p className="text-[12px] text-gray-600 font-medium">
                    Carta condução original e voucher.
                  </p>
                )}
                {activeChecklistTab === 2 && (
                  <p className="text-[12px] text-gray-600 font-medium">
                    Bloqueio de depósito no cartão.
                  </p>
                )}
              </div>
            </div>

            {selectedCarId && (
              <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-[#006ce4]/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#006ce4]/10 rounded-lg">
                    <Settings2 className="h-5 w-5 text-[#006ce4]" />
                  </div>
                  <h4 className="text-[17px] font-black text-gray-900 uppercase tracking-tight">
                    Gerir Serviços
                  </h4>
                </div>
                <div className="space-y-2">
                  {EXTRAS_DATA.map((extra) => {
                    const isIncluded = isExtraIncludedInCar(
                      selectedCarId,
                      extra.id,
                    );
                    const isSelected =
                      !!selectedExtras[`${selectedCarId}-${extra.id}`];
                    const Icon = extra.icon;
                    return (
                      <div
                        key={extra.id}
                        onClick={() => toggleExtra(selectedCarId, extra.id)}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-lg border transition-all",
                          isSelected
                            ? "bg-green-50/40 border-[#008009] shadow-sm"
                            : "bg-white border-gray-100 hover:border-gray-200",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-1.5 rounded-md",
                              isSelected
                                ? "bg-[#008009] text-white"
                                : "bg-gray-50 text-gray-400",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-black text-gray-900 leading-tight">
                              {extra.name}
                            </span>
                            {isIncluded ? (
                              <span className="text-[9px] text-[#008009] font-black uppercase flex items-center gap-1">
                                <Check className="h-2.5 w-2.5" /> Incluído
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#006ce4]">
                                + AOA {extra.price.toLocaleString("pt-AO")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center",
                            isSelected
                              ? "bg-[#008009] border-[#008009]"
                              : "border-gray-200",
                          )}
                        >
                          {isSelected && (
                            <Check className="h-2.5 w-2.5 text-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="text-[17px] font-black text-gray-900 mb-6 uppercase tracking-tight">
                Resumo do preço
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[14px] font-medium text-gray-600">
                  <span>Aluguer de {cars.length} carro(s)</span>
                  <span>AOA {totalCarsPrice.toLocaleString("pt-AO")}</span>
                </div>
                {extrasTotal > 0 && (
                  <div className="flex justify-between items-center text-[14px] font-medium text-[#008009]">
                    <span>Serviços Adicionais</span>
                    <span>+ AOA {extrasTotal.toLocaleString("pt-AO")}</span>
                  </div>
                )}
                <div className="w-full h-[1px] bg-gray-100"></div>
                <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-2 font-black uppercase tracking-tight">
                  <span>Total:</span>
                  <span>AOA {finalTotal.toLocaleString("pt-AO")}</span>
                </div>

                <Button
                  onClick={() => {
                    const allIds = cars.map((c) => c.id).join(",");
                    const extrasParam = Object.entries(selectedExtras)
                      .map(([key, qty]) => {
                        const segments = key.split("-");
                        const extraId = segments.length > 1 ? segments[1] : key;
                        return `${extraId}-${qty}`;
                      })
                      .join(",");
                    const nextParams = new URLSearchParams(
                      searchParams.toString(),
                    );
                    if (extrasParam) nextParams.set("e", extrasParam);
                    // Vai para a página de dados do cliente com os extras já selecionados e as datas
                    router.push(`/booking/${allIds}?${nextParams.toString()}`);
                  }}
                  className="w-full mt-6 bg-[#008009] hover:bg-[#006607] text-white font-black h-14 text-lg rounded-sm shadow-lg tracking-wide uppercase"
                >
                  Confirmar reserva
                </Button>
              </div>
            </div>

            <div className="bg-[#f0fff1] border border-[#008009] p-6 rounded-lg space-y-2">
              <h5 className="font-black text-gray-900 text-[15px]">
                Excelente oportunidade!
              </h5>
              <p className="text-[12px] text-gray-700 font-medium italic">
                Esta reserva garante os melhores veículos para sua viagem.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 mt-12 font-medium">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[12px] text-gray-500 italic">
            Preços baseados em simulação de reserva para Luanda, Angola.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[14px] font-bold text-gray-700">
      <Check className="h-4 w-4 text-[#008009] flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function ChecklistTab({
  label,
  icon,
  active = false,
  onClick,
}: { label: string; icon: any; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex items-center justify-center gap-2 py-3 px-2 text-[10px] md:text-[11px] font-black border-b-2 transition-all cursor-pointer bg-transparent outline-none",
        active
          ? "border-[#006ce4] text-[#006ce4]"
          : "border-transparent text-gray-500 hover:text-gray-900",
      )}
    >
      {icon}
      <span className="truncate uppercase">{label}</span>
    </button>
  );
}
