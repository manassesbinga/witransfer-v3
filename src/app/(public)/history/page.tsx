"use client";
export const dynamic = "force-dynamic";


import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserBookingsAction, cancelBookingAction, resendDigitalReceiptAction } from "@/actions/public/bookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Car,
  Calendar as CalendarIcon,
  MapPin,
  XCircle,
  Phone,
  Mail,
  History as HistoryIcon,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HistoryPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("is_auth") === "true";
    const email = localStorage.getItem("user_email");
    setIsAuth(auth);
    if (email) setUserEmail(email);

    if (!auth || !email) {
      setLoading(false);
      return;
    }

    fetchBookings(email);
  }, []);

  const fetchBookings = async (email: string) => {
    try {
      const data = await getUserBookingsAction(email);
      if (data) {
        setBookings(
          data.sort(
            (a: any, b: any) =>
              new Date(b.created_at || b.createdAt || "").getTime() -
              new Date(a.created_at || a.createdAt || "").getTime(),
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const vehicle = booking.vehicles;
      const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}`.toLowerCase() : "";
      const code = (booking.code || booking.id).toLowerCase();
      const pickup = (booking.pickup_address || "").toLowerCase();
      const dropoff = (booking.dropoff_address || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        vehicleName.includes(query) ||
        code.includes(query) ||
        pickup.includes(query) ||
        dropoff.includes(query);

      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      const matchesType = typeFilter === "all" || booking.service_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bookings, searchQuery, statusFilter, typeFilter]);

  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: "cancel" | "receipt";
  } | null>(null);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;

    setPendingAction({ id: bookingId, type: "cancel" });
    try {
      const result = await cancelBookingAction(bookingId);
      if (result.success) {
        toast.success("Reserva cancelada com sucesso");
        const email = localStorage.getItem("user_email");
        if (email) fetchBookings(email);
      } else {
        toast.error("Erro ao cancelar reserva");
      }
    } catch (error) {
      toast.error("Falha na comunicação com o servidor");
    } finally {
      setPendingAction(null);
    }
  };

  const handleSendReceipt = async (bookingId: string, email: string) => {
    setPendingAction({ id: bookingId, type: "receipt" });
    try {
      const result = await resendDigitalReceiptAction(bookingId, email);
      if (result.success) {
        toast.success(`Recibo enviado para ${email}`);
      } else {
        toast.error("Erro ao enviar recibo");
      }
    } catch (error) {
      toast.error("Erro na comunicação com o servidor");
    } finally {
      setPendingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#003580] p-2 rounded-none text-white">
                <HistoryIcon className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-black text-[#003580] tracking-tight">
                Minhas Viagens
              </h1>
            </div>
          </header>

          <div className="space-y-6 py-12 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#003580]" />
            <p className="text-[10px] font-black tracking-widest animate-pulse">
              Carregando histórico...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-blue-50 p-6 rounded-none mb-6 text-[#003580]">
          <HistoryIcon className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Aceda à sua conta
        </h1>
        <p className="text-gray-500 max-w-xs mb-8 font-medium">
          Faça login para filtrar e gerenciar suas reservas na WiTransfer.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-[#003580] hover:bg-[#002b66] font-black text-xs px-8 h-12 rounded-none tracking-widest"
        >
          Fazer Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/50 pt-24 pb-20 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-10 border-b border-gray-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#003580] p-2 rounded-none text-white">
                <HistoryIcon className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-black text-[#003580] tracking-tight text-nowrap">
                Minhas Viagens
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-[#003580] transition-colors" />
              <Input
                placeholder="Pesquisar por carro, código ou local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-[#003580] focus:ring-0 rounded-none bg-white font-medium text-sm transition-all"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-11 rounded-none border-gray-200 font-bold text-[10px] tracking-wider bg-white">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-gray-200">
                <SelectItem value="all" className="text-[10px] font-bold">Todos Status</SelectItem>
                <SelectItem value="confirmed" className="text-[10px] font-bold text-green-600">Confirmadas</SelectItem>
                <SelectItem value="pending" className="text-[10px] font-bold text-amber-600">Pendentes</SelectItem>
                <SelectItem value="cancelled" className="text-[10px] font-bold text-red-600">Canceladas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-11 rounded-none border-gray-200 font-bold text-[10px] tracking-wider bg-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-gray-200">
                <SelectItem value="all" className="text-[10px] font-bold">Todos Tipos</SelectItem>
                <SelectItem value="rental" className="text-[10px] font-bold">Rental</SelectItem>
                <SelectItem value="transfer" className="text-[10px] font-bold">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {filteredBookings.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 bg-white">
            <div className="bg-gray-50 w-24 h-24 flex items-center justify-center mx-auto mb-6 rounded-none">
              <Car className="h-10 w-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Sem resultados encontrados
            </h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto font-bold text-xs tracking-widest leading-relaxed">
              Tente ajustar os seus filtros de pesquisa para encontrar o que procura.
            </p>
            {bookings.length === 0 && (
              <Button
                onClick={() => router.push("/")}
                className="bg-[#008009] hover:bg-[#006607] font-black text-xs px-10 h-14 rounded-none tracking-[0.2em] shadow-lg shadow-green-100"
              >
                Iniciar Nova Reserva
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_180px_auto] gap-4 px-6 mb-4 text-[9px] font-black text-gray-400 tracking-widest">
              <div>Veículo & Serviço</div>
              <div>Partida & Itinerário</div>
              <div>Destino & Itinerário</div>
              <div className="text-right">Pagamento</div>
              <div>Ações</div>
            </div>
            {filteredBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/history/${booking.id}`}
                className="block"
              >
                <BookingListItem
                  booking={booking}
                  isCancelling={
                    pendingAction?.id === booking.id &&
                    pendingAction?.type === "cancel"
                  }
                  isSendingReceipt={
                    pendingAction?.id === booking.id &&
                    pendingAction?.type === "receipt"
                  }
                  onCancel={(e: any) => {
                    e?.stopPropagation();
                    handleCancel(booking.id);
                  }}
                  onSendReceipt={(e: any) => {
                    e?.stopPropagation();
                    handleSendReceipt(booking.id, userEmail);
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingListItem({
  booking,
  onCancel,
  onSendReceipt,
  isCancelling,
  isSendingReceipt,
}: {
  booking: any;
  onCancel: (e: any) => void;
  onSendReceipt: (e: any) => void;
  isCancelling: boolean;
  isSendingReceipt: boolean;
}) {
  const isCancelled = booking.status === "cancelled" || booking.status === "canceled";
  const vehicle = booking.vehicles;
  const vehicleClass = vehicle?.vehicle_classes;
  const payment = booking.transactions?.[0];

  const pickupDate = booking.start_time ? new Date(booking.start_time) : new Date();
  const returnDate = booking.end_time ? new Date(booking.end_time) : null;
  const now = new Date();

  const diffInMs = pickupDate.getTime() - now.getTime();
  const hoursRemaining = diffInMs / (1000 * 60 * 60);
  const canCancel = !isCancelled && hoursRemaining > 48;

  const formattedPickup = pickupDate.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const formattedReturn = returnDate ? returnDate.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "---";

  return (
    <div
      className={cn(
        "bg-white border-l-4 transition-all hover:bg-slate-50 relative",
        isCancelled ? "border-red-500 opacity-60 grayscale" : "border-[#003580] hover:border-blue-600",
        "border-y border-r border-gray-100 rounded-none shadow-sm hover:translate-x-1"
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_180px_auto] gap-6 items-center p-5 lg:p-6">

        {/* COL 1: Vehicle & Service */}
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 md:w-24 bg-gray-50 flex-shrink-0 flex items-center justify-center p-0 border border-gray-100 rounded-none overflow-hidden relative shadow-inner">
            {vehicle?.image_url ? (
              <img src={vehicle.image_url} alt={vehicle.model} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
            ) : (
              <Car className="h-8 w-8 text-gray-200" />
            )}
            <div className="absolute bottom-0 right-0 bg-[#003580] text-white text-[7px] font-black px-1.5 py-0.5 tracking-tighter">
              {vehicleClass?.name || "STD"}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-gray-400 font-mono tracking-tighter">#{booking.code || booking.id.slice(0, 8)}</span>
              <span className={cn(
                "text-[8px] font-black px-1.5 py-0.5 tracking-widest rounded-none",
                isCancelled ? "bg-red-50 text-red-600" : "bg-[#003580] text-white"
              )}>
                {booking.service_type === 'transfer' ? 'Transfer' : 'Rental'}
              </span>
              {booking.stops && Array.isArray(booking.stops) && booking.stops.length > 0 && (
                <span className="text-[8px] font-black px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-none tracking-widest whitespace-nowrap">
                  {booking.stops.length} {booking.stops.length === 1 ? 'PARAGEM' : 'PARAGENS'}
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-gray-900 leading-tight truncate">
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Aguardando Viatura"}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1 inline-flex items-center gap-1 tracking-tighter truncate max-w-full">
              <ShieldCheck className="h-2.5 w-2.5" />
              ID: {booking.id.slice(0, 12)}...
            </p>
          </div>
        </div>

        {/* COL 2: Pickup */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black text-[#003580]">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{formattedPickup}</span>
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-gray-500 font-bold leading-tight line-clamp-2">
            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{booking.pickup_address}</span>
          </div>
        </div>

        {/* COL 3: Dropoff */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black text-gray-700">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-40 " />
            <span>{formattedReturn}</span>
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-gray-500 font-bold leading-tight line-clamp-2 opacity-70">
            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{booking.dropoff_address || "CENTRAL WITRANSFER"}</span>
          </div>
        </div>

        {/* COL 4: Payment */}
        <div className="text-right">
          <div className="flex flex-col items-end gap-1 mb-2">
            <span className={cn(
              "text-[9px] font-black px-2 py-0.5 rounded-none",
              payment ? "bg-green-600 text-white" : "bg-amber-500 text-white"
            )}>
              {payment ? "Pago" : "Pendente"}
            </span>
          </div>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-[10px] font-black text-gray-300">AOA</span>
            <span className="text-xl font-black text-[#003580] tabular-nums tracking-tighter">
              {(booking.total_price || 0).toLocaleString("pt-AO")}
            </span>
          </div>
        </div>

        {/* COL 5: Actions */}
        <div className="flex items-center gap-2 justify-end lg:justify-start lg:pl-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0">
          <Button
            onClick={onSendReceipt}
            variant="outline"
            loading={isSendingReceipt}
            className="h-10 w-10 p-0 rounded-none border-gray-200 hover:border-[#003580] hover:bg-[#003580] hover:text-white transition-all group"
            title="Fatura / Recibo"
          >
            {!isSendingReceipt && <Mail className="h-4 w-4" />}
          </Button>

          {!isCancelled && (
            <>
              {canCancel ? (
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  loading={isCancelling}
                  className="h-10 w-10 p-0 rounded-none text-red-500 hover:bg-red-50 hover:text-red-600"
                  title="Cancelar Reserva"
                >
                  {!isCancelling && <XCircle className="h-4 w-4" />}
                </Button>
              ) : (
                <Button
                  title="Suporte Especializado"
                  disabled
                  className="h-10 w-10 p-0 rounded-none bg-blue-50 text-[#003580] border border-blue-100 opacity-100"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>

      </div>

      {/* Footer Mobile Tag */}
      <div className="lg:hidden bg-gray-50 px-5 py-2 text-[8px] font-black text-gray-400 tracking-[0.2em] border-t border-gray-100">
        Reserva WiTransfer • Security Verified • Data: {new Date(booking.created_at || booking.createdAt).toLocaleDateString("pt-PT")}
      </div>
    </div>
  );
}
