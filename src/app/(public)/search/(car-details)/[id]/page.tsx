"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { searchCars } from "@/actions/public/search/cars";
import { getExtras } from "@/actions/public/extras";
import { Car, Extra } from "@/types";
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
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  ArrowRight,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

import { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  driver: Users,
  gps: Navigation,
  wifi: Zap,
  baby_seat: Luggage,
  insurance: ShieldCheck,
  limpeza: Sparkles,
};

export default function DealPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromDateParam = searchParams.get("from");
  const toDateParam = searchParams.get("to");
  const searchType = (searchParams.get("type") as "rental" | "transfer") || "rental";

  let rentalDays = 1;
  if (fromDateParam && toDateParam) {
    const d1 = new Date(fromDateParam);
    const d2 = new Date(toDateParam);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }

  const [cars, setCars] = useState<Car[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeChecklistTab, setActiveChecklistTab] = useState(0);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>(
    {},
  );
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
          const rawId = Array.isArray(id) ? id[0] : id;
          const decodedId = decodeURIComponent(rawId);
          const ids = decodedId
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);

          const response = await searchCars({
            ids,
            type: searchType,
            from: fromDateParam || undefined,
            to: toDateParam || undefined,
            pickup: searchParams.get("pickup") || undefined,
            dropoff: searchParams.get("dropoff") || undefined,
            passengers: searchParams.get("passengers") || undefined,
            luggage: searchParams.get("luggage") || undefined,
          });

          if (response && response.results && response.results.length > 0) {
            setCars(response.results);
            setSelectedCarId(response.results[0].id);

            const initialExtras: Record<string, number> = {};
            response.results.forEach((car) => {
              car.extras?.forEach((extraId: string) => {
                initialExtras[`${car.id}-${extraId}`] = 1;
              });
            });
            setSelectedExtras(initialExtras);

            // Fetch extras for the loaded cars: vehicle-specific and partner-level
            try {
              const vehicleIds = Array.from(new Set(response.results.map((c: any) => c.id).filter(Boolean)));
              const partnerIds = Array.from(new Set(response.results.map((c: any) => c.partnerId || c.partner_id).filter(Boolean)));

              const extrasMap: Record<string, Extra> = {};

              // vehicle-specific extras
              await Promise.all(vehicleIds.map(async (vid) => {
                try {
                  const ev = await getExtras({ vehicleId: vid });
                  (ev || []).forEach((e: Extra) => { extrasMap[e.id] = e; });
                } catch (e) { /* ignore per-vehicle failures */ }
              }));

              // partner-level extras
              await Promise.all(partnerIds.map(async (pid) => {
                try {
                  const ep = await getExtras({ partnerId: pid });
                  (ep || []).forEach((e: Extra) => { extrasMap[e.id] = e; });
                } catch (e) { /* ignore per-partner failures */ }
              }));

              setExtras(Object.values(extrasMap));
            } catch (e) {
              console.error("Erro ao buscar extras para veículos:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error loading deal data:", error);
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
      const extra = extras.find((e) => e.id === extraId);
      if (extra) {
        const multiplier = extra.perDay ? rentalDays : 1;
        total += extra.price * qty * multiplier;
      }
    });
    return total;
  };

  const selectedExtrasCountForCar = (carId: string) => {
    return Object.keys(selectedExtras).filter((key) =>
      key.startsWith(`${carId}-`),
    ).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-400 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold tracking-tight text-xs">Preparando Experiência...</p>
      </div>
    );
  }
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

  const totalCarsPrice = cars.reduce((acc, car) => {
    const isPerDay = car.perDay || searchType === "rental";
    return acc + (isPerDay ? car.price * rentalDays : car.price);
  }, 0);
  const totalInsurancePrice = cars.reduce(
    (acc, car) => acc + (car.insurance?.dailyPrice || 0) * rentalDays,
    0,
  );
  const extrasTotal = calculateExtrasTotal();
  const finalTotal = totalCarsPrice + totalInsurancePrice + extrasTotal;

  return (
    <div className="min-h-screen bg-[#f8faff] text-gray-900">
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 mr-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm font-medium text-gray-900">
              <div className="flex flex-col">
                <span className="font-bold truncate max-w-[150px] md:max-w-none">
                  {searchParams.get("pickup") || cars[0].locationName || "Local de Levantamento"}
                </span>
                <span className="text-[11px] text-gray-500">
                  {fromDateParam
                    ? format(new Date(fromDateParam), "dd MMM yyyy, HH:mm", {
                      locale: ptBR,
                    })
                    : "-"}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="font-bold truncate max-w-[150px] md:max-w-none">
                  {searchParams.get("dropoff") || cars[0].locationName || "Local de Devolução"}
                </span>
                <span className="text-[11px] text-gray-500">
                  {toDateParam
                    ? format(new Date(toDateParam), "dd MMM yyyy, HH:mm", {
                      locale: ptBR,
                    })
                    : "-"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {emailVerified && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-sm border border-green-200">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-green-700">
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
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2">
            A sua oferta {cars.length > 1 && `(${cars.length} carros)`}
          </h1>
          <p className="text-lg text-gray-600 font-medium">
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

            {/* Toggle Visualização */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-full transition-all",
                  viewMode === "grid"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                )}
                title="Visualização em Grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-full transition-all",
                  viewMode === "list"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                )}
                title="Visualização em Lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Tabela de Veículos - Grid */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cars.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => setSelectedCarId(car.id)}
                    className={cn(
                      "bg-white rounded-lg shadow-md border overflow-hidden transition-all duration-300 cursor-pointer group",
                      selectedCarId === car.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-slate-200 hover:shadow-lg hover:border-slate-300"
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
                  <div className="p-5">
                    {/* Título e Rating */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                          {car.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-slate-700">4.9</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 uppercase font-bold">{car.supplier || "WiTransfer Partner"}</p>
                    </div>

                    {/* Badges de Tipo */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-bold uppercase">
                        {car.transmission === 'automatic' ? 'Automático' : 'Manual'}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-bold uppercase">
                        {car.seats} Lugares
                      </Badge>
                    </div>

                    {/* Especificações Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-200">
                      <div className="flex items-center gap-2 text-xs">
                        <Users size={14} className="text-slate-500" />
                        <span className="text-slate-700 font-medium">{car.seats} Lugares</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Zap size={14} className="text-slate-500" />
                        <span className="text-slate-700 font-medium">{car.transmission === 'automatic' ? 'Automático' : 'Manual'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Luggage size={14} className="text-slate-500" />
                        <span className="text-slate-700 font-medium">{car.luggage_big || 0} Malas</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin size={14} className="text-slate-500" />
                        <span className="text-slate-700 font-medium">{searchType === "transfer" ? (car.distanceString || "S/D") : "Ilimitada"}</span>
                      </div>
                    </div>

                    {/* Serviços Inclusos */}
                    {car.includedServices && car.includedServices.length > 0 && (
                      <div className="mb-4 pb-4 border-b border-slate-200">
                        <p className="text-xs font-bold text-slate-600 uppercase mb-2">Serviços Inclusos</p>
                        <div className="flex flex-wrap gap-1">
                          {car.includedServices.slice(0, 4).map((service, idx) => (
                            <Badge key={idx} className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2 py-0.5">
                              <Check size={10} className="mr-1" /> {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preço e Ação */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Taxa Diária</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900">
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(car.pricePerUnit || 0)}
                          </span>
                          <span className="text-xs text-slate-500 font-bold uppercase">
                            / {car.billingType === 'per_km' ? 'KM' : car.billingType === 'per_day' ? 'DIA' : 'UNID'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          Total: <span className="font-bold text-primary">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(car.price)}</span>
                        </p>
                      </div>
                      <button
                        className={cn(
                          "px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap",
                          selectedCarId === car.id
                            ? "bg-primary text-white"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                      >
                        {selectedCarId === car.id ? "Selecionado" : "Selecionar"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              // LIST VIEW - Linhas finas
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {cars.map((car) => (
                    <div
                      key={car.id}
                      onClick={() => setSelectedCarId(car.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 hover:bg-slate-50 transition-all cursor-pointer border-l-4",
                        selectedCarId === car.id
                          ? "border-l-primary bg-primary/5"
                          : "border-l-transparent hover:border-l-primary/30"
                      )}
                    >
                      {/* Imagem pequena */}
                      <div className="w-20 h-16 bg-slate-100 rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src={car.image || "/car-placeholder.png"}
                          alt={car.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Informações principais */}
                      <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                        {/* Nome e fornecedor */}
                        <div className="col-span-1">
                          <h4 className="font-bold text-slate-900 text-sm">{car.name}</h4>
                          <p className="text-xs text-slate-500 uppercase">{car.supplier || "WiTransfer"}</p>
                        </div>

                        {/* Especificações */}
                        <div className="col-span-2 grid grid-cols-4 gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Users size={12} className="text-slate-500" />
                            <span className="text-slate-700">{car.seats}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap size={12} className="text-slate-500" />
                            <span className="text-slate-700">{car.transmission === 'automatic' ? 'Auto' : 'Man'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Luggage size={12} className="text-slate-500" />
                            <span className="text-slate-700">{car.luggage_big || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-500" />
                            <span className="text-slate-700">{searchType === "transfer" ? (car.distanceString || "S/D") : "Ilim."}</span>
                          </div>
                        </div>

                        {/* Preço */}
                        <div className="col-span-1 text-right">
                          <div className="font-black text-slate-900 text-sm">
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(car.price)}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(car.pricePerUnit || 0)} / {car.billingType === 'per_km' ? 'KM' : car.billingType === 'per_day' ? 'DIA' : 'UNID'}
                          </p>
                        </div>
                      </div>

                      {/* Botão Seleção */}
                      <button
                        className={cn(
                          "px-3 py-2 rounded font-bold text-xs flex-shrink-0 transition-all",
                          selectedCarId === car.id
                            ? "bg-primary text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        )}
                      >
                        {selectedCarId === car.id ? "✓" : "Sel"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-8 shadow-sm border border-gray-100">
              <h4 className="text-xl font-bold text-gray-900 mb-8 tracking-tight">
                Levantamento e devolução
              </h4>
              <div className="relative pl-8 space-y-16 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-gray-300">
                <div className="relative">
                  <div className="absolute left-[-35px] top-1 h-5 w-5 rounded-full border-3 border-gray-900 bg-white shadow-md z-10"></div>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {fromDateParam
                      ? format(new Date(fromDateParam), "eee, dd MMM - HH:mm", {
                        locale: ptBR,
                      })
                      : "-"}
                  </p>
                  <p className="text-base text-gray-700 font-medium truncate">
                    {searchParams.get("pickup") || cars[0].locationName}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute left-[-35px] top-1 h-5 w-5 rounded-full border-3 border-gray-900 bg-white shadow-md z-10"></div>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {toDateParam
                      ? format(new Date(toDateParam), "eee, dd MMM - HH:mm", {
                        locale: ptBR,
                      })
                      : "-"}
                  </p>
                  <p className="text-base text-gray-700 font-medium truncate">
                    {searchParams.get("dropoff") || cars[0].locationName}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Porquê escolher esta oferta?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <BenefitItem text="Pontuação dos clientes: 7.5 / 10" />
                <BenefitItem text="Política de combustível 'Cheio para Cheio'" />
                <BenefitItem text="Balcão fácil de encontrar" />
                <BenefitItem text="Carros higienizados" />
                <BenefitItem text="Cancelamento gratuito" />
              </div>
            </div>
          </div>

          {/* Coluna 2: Checkout e Extras */}
          <div className="lg:sticky lg:top-[64px] h-fit max-h-[calc(100vh-84px)] space-y-6">
            <div className="bg-white p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-5">
                Sua Checklist
              </h4>
              <div className="grid grid-cols-3 border-b-2 border-gray-200 mb-5 font-bold text-xs">
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
              <div className="min-h-[60px]">
                {activeChecklistTab === 0 && (
                  <p className="text-base text-gray-700 font-medium">
                    Recomendamos chegar 15 min antes.
                  </p>
                )}
                {activeChecklistTab === 1 && (
                  <p className="text-base text-gray-700 font-medium">
                    Carta condução original e voucher.
                  </p>
                )}
                {activeChecklistTab === 2 && (
                  <p className="text-base text-gray-700 font-medium">
                    Bloqueio de depósito no cartão.
                  </p>
                )}
              </div>
            </div>

            {selectedCarId && (
              <div className="bg-white rounded-xl p-7 shadow-sm border-2 border-[#006ce4]/10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="p-3 bg-[#006ce4]/10 rounded-lg">
                    <Settings2 className="h-6 w-6 text-[#006ce4]" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 tracking-tight">
                    Gerir Serviços
                  </h4>
                </div>
                <div className="space-y-2">
                  {extras.map((extra) => {
                    const isIncluded = isExtraIncludedInCar(
                      selectedCarId,
                      extra.id,
                    );
                    const isSelected =
                      !!selectedExtras[`${selectedCarId}-${extra.id}`];
                    const Icon = ICON_MAP[extra.id] || Settings2;
                    return (
                      <div
                        key={extra.id}
                        onClick={() => toggleExtra(selectedCarId, extra.id)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                          isSelected
                            ? "bg-green-50/40 border-[#008009] shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              isSelected
                                ? "bg-[#008009] text-white"
                                : "bg-gray-100 text-gray-500",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 leading-tight mb-1">
                              {extra.name}
                            </span>
                            {isIncluded ? (
                              <span className="text-xs text-[#008009] font-bold flex items-center gap-1.5">
                                <Check className="h-3 w-3" /> Incluído
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-[#006ce4]">
                                + AOA {extra.price.toLocaleString("pt-AO")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "h-5 w-5 rounded border-2 flex items-center justify-center",
                            isSelected
                              ? "bg-[#008009] border-[#008009]"
                              : "border-gray-300",
                          )}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-7 shadow-sm border border-gray-100">
              <h4 className="text-xl font-bold text-gray-900 mb-7">
                Resumo do preço
              </h4>
              <div className="space-y-5">
                <div className="flex justify-between items-center text-base font-medium text-gray-700">
                  <span>{searchType === "transfer" ? "Serviço de Transfer" : `Aluguer de ${cars.length} carro(s)`}</span>
                  <span className="font-bold">AOA {totalCarsPrice.toLocaleString("pt-AO")}</span>
                </div>
                {extrasTotal > 0 && (
                  <div className="flex justify-between items-center text-base font-medium text-[#008009]">
                    <span>Serviços Adicionais</span>
                    <span className="font-bold">+ AOA {extrasTotal.toLocaleString("pt-AO")}</span>
                  </div>
                )}
                <div className="w-full h-[2px] bg-gray-200"></div>
                <div className="flex justify-between items-center text-2xl font-bold text-gray-900 pt-3 tracking-tight">
                  <span>Total:</span>
                  <span className="text-primary">AOA {finalTotal.toLocaleString("pt-AO")}</span>
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
                    router.push(`/booking/${allIds}?${nextParams.toString()}`);
                  }}
                  className="w-full mt-8 bg-[#008009] hover:bg-[#006607] text-white font-bold h-16 text-lg rounded-lg shadow-lg tracking-wide"
                >
                  Confirmar reserva
                </Button>
              </div>
            </div>

            <div className="bg-[#f0fff1] border-2 border-[#008009] p-7 rounded-xl space-y-2">
              <h5 className="font-bold text-gray-900 text-lg">
                Excelente oportunidade!
              </h5>
              <p className="text-base text-gray-700 font-medium">
                Esta reserva garante os melhores veículos para sua viagem.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 mt-12 font-medium">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[12px] text-gray-500">
            Preços baseados em simulação de reserva para Luanda, Angola.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-base font-bold text-gray-700">
      <Check className="h-5 w-5 text-[#008009] flex-shrink-0" />
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
        "flex items-center justify-center gap-2 py-4 px-3 text-xs md:text-sm font-bold border-b-3 transition-all cursor-pointer bg-transparent outline-none",
        active
          ? "border-[#006ce4] text-[#006ce4]"
          : "border-transparent text-gray-500 hover:text-gray-900",
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
