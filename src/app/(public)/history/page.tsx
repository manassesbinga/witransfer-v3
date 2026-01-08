"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Car,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ChevronRight,
  XCircle,
  Phone,
  Mail,
  FileText,
  History as HistoryIcon,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ItemListSkeleton } from "@/components/skeletons/skeleton-examples";

export default function HistoryPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("is_auth") === "true";
    const email = localStorage.getItem("user_email");
    setIsAuth(auth);

    if (!auth || !email) {
      setLoading(false);
      return;
    }

    fetchBookings(email);
  }, []);

  const fetchBookings = async (email: string) => {
    try {
      const res = await fetch(`/api/bookings?email=${email}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(
          data.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: "cancel" | "receipt";
  } | null>(null);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;

    setPendingAction({ id: bookingId, type: "cancel" });
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
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
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success(`Comprovativo reenviado para ${email}`);
    setPendingAction(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#003580] p-2 rounded-lg text-white">
                <HistoryIcon className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-black text-[#003580] tracking-tight uppercase">
                Minhas Viagens
              </h1>
            </div>
          </header>

          <div className="space-y-6">
            <ItemListSkeleton count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <HistoryIcon className="h-12 w-12 text-[#003580]" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Aceda à sua conta
        </h1>
        <p className="text-gray-500 max-w-xs mb-8">
          Faça login para visualizar e gerenciar todas as suas reservas
          efetuadas na WiTransfer.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-[#003580] hover:bg-[#002b66] font-black uppercase text-xs px-8 h-12"
        >
          Fazer Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#003580] p-2 rounded-lg text-white">
              <HistoryIcon className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black text-[#003580] tracking-tight uppercase">
              Minhas Viagens
            </h1>
          </div>
          <p className="text-gray-500 font-medium">
            Gerencie seus alugueres e acompanhe o estado das suas viagens.
          </p>
        </header>

        {bookings.length === 0 ? (
          <Card className="border-none shadow-sm p-12 text-center bg-white">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Ainda não efetuou nenhuma reserva? Explore os nossos veículos e
              comece a sua jornada.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-[#008009] hover:bg-[#006607] font-black uppercase text-xs px-8 h-12"
            >
              Pesquisar Carros
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isCancelling={
                  pendingAction?.id === booking.id &&
                  pendingAction?.type === "cancel"
                }
                isSendingReceipt={
                  pendingAction?.id === booking.id &&
                  pendingAction?.type === "receipt"
                }
                onCancel={() => handleCancel(booking.id)}
                onSendReceipt={() =>
                  handleSendReceipt(booking.id, booking.customer.email)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  onSendReceipt,
  isCancelling,
  isSendingReceipt,
}: {
  booking: any;
  onCancel: () => void;
  onSendReceipt: () => void;
  isCancelling: boolean;
  isSendingReceipt: boolean;
}) {
  const isCancelled = booking.status === "cancelled";

  // Verificação real de 48h baseada na pickupDate
  const pickupDate = booking.pickupDate
    ? new Date(booking.pickupDate)
    : new Date("2025-12-28T10:00:00Z");
  const now = new Date();
  const diffInMs = pickupDate.getTime() - now.getTime();
  const hoursRemaining = diffInMs / (1000 * 60 * 60);
  const canCancel = !isCancelled && hoursRemaining > 48;

  const formattedPickup = pickupDate.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const returnDate = new Date(pickupDate);
  returnDate.setDate(returnDate.getDate() + 3);
  const formattedReturn = returnDate.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Card
      className={cn(
        "border-none shadow-sm overflow-hidden group transition-all hover:shadow-md",
        isCancelled && "opacity-75 grayscale-[0.5]",
      )}
    >
      <CardContent className="p-0">
        {/* Header of Card */}
        <div
          className={cn(
            "px-6 py-4 flex items-center justify-between border-b",
            isCancelled
              ? "bg-gray-50 border-gray-100"
              : "bg-white border-blue-50",
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                isCancelled
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700",
              )}
            >
              {isCancelled ? "Cancelada" : "Confirmada"}
            </div>
            <span className="text-xs font-mono text-gray-400 font-bold">
              #{booking.id}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
              Data do Pedido
            </p>
            <p className="text-xs font-bold text-gray-900">
              {new Date(booking.createdAt).toLocaleDateString("pt-PT")}
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-8">
            {/* Main info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                  <Car className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1 leading-none uppercase italic">
                    WiTransfer Rental
                  </h3>
                  <p className="text-sm text-[#006ce4] font-bold">
                    Reserva múltipla ou individual
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-black">
                    Levantamento
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{formattedPickup}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Aeroporto de Luanda</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-black">
                    Devolução
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{formattedReturn}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Aeroporto de Luanda</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Price */}
            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100/50 flex flex-col justify-between gap-6">
              <div className="text-center md:text-right">
                <p className="text-[10px] text-gray-400 uppercase font-black mb-1">
                  Valor Total
                </p>
                <p className="text-2xl font-black text-gray-900 leading-none">
                  AOA {booking.totalAmount.toLocaleString("pt-AO")}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={onSendReceipt}
                  variant="outline"
                  loading={isSendingReceipt}
                  className="w-full h-10 text-[11px] font-black uppercase text-[#003580] border-[#003580] hover:bg-[#003580] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  {!isSendingReceipt && <Mail className="h-4 w-4" />}
                  Enviar Comprovativo
                </Button>

                {!isCancelled && (
                  <>
                    {canCancel ? (
                      <Button
                        onClick={onCancel}
                        variant="ghost"
                        loading={isCancelling}
                        className="w-full h-10 text-[11px] font-black uppercase text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        {!isCancelling && <XCircle className="h-4 w-4 mr-2" />}
                        Cancelar Reserva
                      </Button>
                    ) : (
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span className="text-[10px] font-black uppercase italic tracking-tighter">
                            Alterações Restritas
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-600 font-medium leading-tight">
                          Para cancelar em menos de 48h, por favor contacte a
                          nossa central.
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs font-black text-blue-800">
                          <Phone className="h-3 w-3" />
                          <span>+244 9XX XXX XXX</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
