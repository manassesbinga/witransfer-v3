/** @format */

"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Car,
  Navigation,
  Users,
  TrendingUp,
  Activity,
  Fuel,
  Clock,
  Phone,
  Mail,
  User,
  X,
  Eye,
  Gauge,
  Calendar,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCarsAction } from "../../../actions/cars/actions";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import {
  cancelBookingAction,
  getFilteredBookingsAction,
} from "../../../actions";

// Dynamically import the map component to avoid SSR issues
const VehicleMap = dynamic<any>(
  () => import("@/components/viagens/VehicleMap"),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-full rounded-none overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Carregando mapa de rastreamento...
          </p>
        </div>
      </div>
    ),
  }
);

interface VehicleLocation {
  id: string;
  modelo: string;
  marca: string;
  matricula: string;
  status: string;
  motoristanome?: string;
  motoristaId?: string;
  position: [number, number];
  velocidade?: number;
  ultimaAtualizacao?: string;
  ano?: number;
  cor?: string;
  lugares?: number;
  kilometragem?: number;
}

interface TransferBooking {
  id: string;
  carId: string;
  userName: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  date?: string;
  status: string;
}

export default function RastreamentoViaturas() {
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleLocation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [bookingsByCar, setBookingsByCar] = useState<
    Record<string, TransferBooking[]>
  >({});
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    const idFromUrl = searchParams.get("vehicleId");
    if (!idFromUrl || vehicles.length === 0) return;
    const found = vehicles.find((v) => v.id === idFromUrl);
    if (found) {
      setSelectedVehicle(found);
    }
  }, [searchParams, vehicles]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const result = await getCarsAction();
      if (result.success) {
        // Simular posições GPS para os veículos (em produção, viriam do backend)
        const vehiclesWithLocation = result.data.map(
          (car: any, index: number) => ({
            id: car.id || `vehicle-${index}`,
            modelo: car.modelo || car.name || "Sem modelo",
            marca: car.marca || "Sem marca",
            matricula: car.matricula || `ID-${car.id?.slice(0, 4) || index}`,
            status: car.status || "inativa",
            motoristanome: car.motoristanome || undefined,
            motoristaId: car.motoristaId || undefined,
            ano: car.ano || 2020,
            cor: car.cor || "Branco",
            lugares: car.lugares || 5,
            kilometragem: car.kilometragem || 0,
            position: [
              -8.83 + (Math.random() - 0.5) * 0.04,
              13.26 + (Math.random() - 0.5) * 0.04,
            ] as [number, number],
            velocidade:
              car.status === "ativa" ? Math.floor(Math.random() * 80) : 0,
            ultimaAtualizacao: new Date().toISOString(),
          })
        );
        setVehicles(vehiclesWithLocation);
        toast.success("Localizações atualizadas com sucesso!");

        // Buscar viagens de transfer e indexar por carId
        try {
          const bookingsResult = await getFilteredBookingsAction({
            type: "transfer",
          });
          if (bookingsResult.success && Array.isArray(bookingsResult.data)) {
            const map: Record<string, TransferBooking[]> = {};
            bookingsResult.data.forEach((b: any) => {
              if (!b.carId) return;
              const simple: TransferBooking = {
                id: b.id,
                carId: String(b.carId),
                userName: b.userName,
                pickupLocation: b.pickupLocation,
                dropoffLocation: b.dropoffLocation,
                date: b.date,
                status: b.status,
              };
              if (!map[simple.carId]) map[simple.carId] = [];
              map[simple.carId].push(simple);
            });
            setBookingsByCar(map);
          }
        } catch (err) {
          console.error(err);
        }
      }
    } catch (error) {
      toast.error("Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  };

  const getActiveBookingForVehicle = (
    vehicleId: string
  ): TransferBooking | undefined => {
    const list = bookingsByCar[vehicleId];
    if (!list || list.length === 0) return undefined;
    // Prioriza pendente/confirmada; se não tiver, pega a mais recente
    const active = list.find((b) => b.status !== "canceled");
    return active || list[0];
  };

  const handleCancelBooking = async (booking: TransferBooking) => {
    try {
      const result = await cancelBookingAction(booking.id);
      if ((result as any).success === false && (result as any).error) {
        toast.error((result as any).error);
        return;
      }
      toast.success("Corrida cancelada com sucesso.");
      // Atualizar mapa de bookings em memória
      setBookingsByCar((prev) => {
        const clone: Record<string, TransferBooking[]> = { ...prev };
        const list = clone[booking.carId]?.map((b) =>
          b.id === booking.id ? { ...b, status: "canceled" } : b
        );
        if (list) clone[booking.carId] = list;
        return clone;
      });
    } catch (error) {
      toast.error("Erro ao cancelar corrida.");
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (v.matricula || "").toLowerCase().includes(searchLower) ||
      (v.modelo || "").toLowerCase().includes(searchLower) ||
      (v.motoristanome || "").toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === "all" || v.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: vehicles.length,
    emMovimento: vehicles.filter(
      (v) => v.status === "ativa" && (v.velocidade || 0) > 0
    ).length,
    parados: vehicles.filter(
      (v) => v.status === "ativa" && (v.velocidade || 0) === 0
    ).length,
    manutencao: vehicles.filter((v) => v.status === "manutencao").length,
  };

  const handleVehicleClick = (vehicle: VehicleLocation) => {
    setSelectedVehicle(vehicle);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-emerald-500";
      case "manutencao":
        return "bg-amber-500";
      case "inativa":
        return "bg-slate-400";
      default:
        return "bg-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativa":
        return "Ativo";
      case "manutencao":
        return "Manutenção";
      case "inativa":
        return "Inativo";
      default:
        return status;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Rastreamento de Veículos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoramento em tempo real da localização da frota
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchVehicles}
            disabled={loading}
            variant="outline"
            className="rounded-none h-11 font-bold border-gray-200">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Atualizando...
              </>
            ) : (
              <>
                <Activity size={16} className="mr-2" />
                Atualizar Posições
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-none p-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="bg-blue-50 p-2.5 rounded-none">
              <Car size={20} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {stats.total}
              </p>
              <p className="text-slate-500 text-[10px] uppercase font-medium tracking-wider">
                Total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-none p-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="bg-emerald-50 p-2.5 rounded-none">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {stats.emMovimento}
              </p>
              <p className="text-slate-500 text-[10px] uppercase font-medium tracking-wider">
                Em Movimento
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-none p-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="bg-amber-50 p-2.5 rounded-none">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {stats.parados}
              </p>
              <p className="text-slate-500 text-[10px] uppercase font-medium tracking-wider">
                Parados
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-none p-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="bg-rose-50 p-2.5 rounded-none">
              <Activity size={20} className="text-rose-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {stats.manutencao}
              </p>
              <p className="text-slate-500 text-[10px] uppercase font-medium tracking-wider">
                Manutenção
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Sidebar - Vehicle List */}
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <Card className="border-gray-100 rounded-none shadow-sm flex-1 flex flex-col min-h-0">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Car size={18} className="text-blue-600" />
                Veículos ({filteredVehicles.length})
              </CardTitle>

              <Input
                type="text"
                placeholder="Buscar veículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-none border-gray-200 h-9 text-sm mb-3"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-none transition-colors ${
                    filterStatus === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  Todos
                </button>
                <button
                  onClick={() => setFilterStatus("ativa")}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-none transition-colors ${
                    filterStatus === "ativa"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  Ativos
                </button>
                <button
                  onClick={() => setFilterStatus("manutencao")}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-none transition-colors ${
                    filterStatus === "manutencao"
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  Manutenção
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="p-8 text-center text-slate-500">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm">Carregando...</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Car size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-sm">
                    Nenhum veículo encontrado
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => handleVehicleClick(vehicle)}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition-all ${
                        selectedVehicle?.id === vehicle.id
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : ""
                      }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {vehicle.matricula}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {vehicle.marca} {vehicle.modelo}
                          </p>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            vehicle.status
                          )} mt-1.5`}></div>
                      </div>

                      {vehicle.motoristanome && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Users size={11} className="text-slate-400" />
                          <p className="text-xs text-slate-600 truncate">
                            {vehicle.motoristanome}
                          </p>
                        </div>
                      )}

                      {/* Info da viagem associada, se existir */}
                      {getActiveBookingForVehicle(vehicle.id) && (
                        <div className="mt-2 border-t border-slate-100 pt-2">
                          {(() => {
                            const booking = getActiveBookingForVehicle(
                              vehicle.id
                            )!;
                            return (
                              <>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                  Viagem{" "}
                                  {booking.status === "canceled"
                                    ? "(cancelada)"
                                    : "ativa"}
                                </p>
                                {booking.pickupLocation &&
                                  booking.dropoffLocation && (
                                    <p className="text-[11px] text-slate-600 truncate">
                                      {booking.pickupLocation} →{" "}
                                      {booking.dropoffLocation}
                                    </p>
                                  )}
                                {booking.date && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {new Date(booking.date).toLocaleString()}
                                  </p>
                                )}
                                {booking.status !== "canceled" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelBooking(booking);
                                    }}
                                    className="mt-2 w-full text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-none py-1 transition-colors">
                                    Cancelar corrida
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Fuel size={11} />
                          <span>{vehicle.velocidade || 0} km/h</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock size={11} />
                          <span>Agora</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="border-gray-100 rounded-none shadow-sm flex-1 flex flex-col min-h-[500px]">
            <CardHeader className="border-b border-gray-100 py-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                Mapa de Localização em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0 relative">
              <VehicleMap
                vehicles={filteredVehicles}
                selectedVehicle={selectedVehicle?.id || null}
                bookingByVehicle={Object.fromEntries(
                  Object.entries(bookingsByCar).map(([carId, list]) => {
                    const active =
                      list.find((b) => b.status !== "canceled") ?? list[0];
                    return [
                      carId,
                      {
                        pickupLocation: active?.pickupLocation,
                        dropoffLocation: active?.dropoffLocation,
                        status: active?.status,
                      },
                    ];
                  })
                )}
                onVehicleClick={(id: string) => {
                  const found = filteredVehicles.find((v) => v.id === id);
                  if (found) handleVehicleClick(found);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
