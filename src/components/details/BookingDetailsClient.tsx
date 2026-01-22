/** @format */

"use client";

import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Clock,
    DollarSign,
    User,
    Car,
    CheckCircle2,
    XCircle,
    RefreshCw,
    ShieldCheck,
    Navigation,
    Flag,
    AlertTriangle,
    Plus
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    getBookingDetailsAction,
    updateBookingStatusAction,
    cancelAndReassignBookingAction,
    getAvailableVehiclesAction,
    getAvailableDriversAction,
    assignBookingManuallyAction
} from "@/actions/private/bookings/actions";
import { getPartnersAction } from "@/actions/private/partners/actions";
import { getExtras } from "@/actions/public/extras";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getCurrentUserAction } from "@/actions/private/auth/actions";

interface BookingDetailsClientProps {
    bookingId: string;
    type: "rental" | "transfer";
}

export default function BookingDetailsClient({ bookingId, type }: BookingDetailsClientProps) {
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [extras, setExtras] = useState<any[]>([]);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const router = useRouter();

    // Assignment State
    const [partners, setPartners] = useState<any[]>([]);
    const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
    const [assignmentForm, setAssignmentForm] = useState({
        partnerId: "",
        vehicleId: "",
        driverId: ""
    });
    const [isManualAssignOpen, setIsManualAssignOpen] = useState(false);

    const fetchDetails = async () => {
        try {
            const [detailsResult, userResult] = await Promise.all([
                getBookingDetailsAction(bookingId),
                getCurrentUserAction()
            ]);

            if (userResult.success) setCurrentUser(userResult.data);

            if (detailsResult.success && detailsResult.data) {
                setBooking(detailsResult.data);

                // Fetch partners if admin
                if (["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(userResult.data?.role)) {
                    const partnersRes = await getPartnersAction();
                    if (partnersRes.success) setPartners(partnersRes.data || []);
                }

                // Fetch extras for the vehicle if applicable
                if (detailsResult.data.vehicle_id) {
                    const extrasRes = await getExtras({ vehicleId: detailsResult.data.vehicle_id });
                    if (extrasRes) setExtras(extrasRes);
                } else if (detailsResult.data.partner_id) {
                    const extrasRes = await getExtras({ partnerId: detailsResult.data.partner_id });
                    if (extrasRes) setExtras(extrasRes);
                }
            } else {
                toast.error("Erro ao carregar detalhes");
            }
        } catch (error) {
            console.error("Erro:", error);
            toast.error("Erro ao carregar reserva");
        } finally {
            setLoading(false);
        }
    };

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetchDetails();
    }, [bookingId]);

    // Handle partner selection to load vehicles/drivers
    useEffect(() => {
        const loadResources = async () => {
            if (!assignmentForm.partnerId) return;

            try {
                const vRes = await getAvailableVehiclesAction(assignmentForm.partnerId);

                if (vRes.success) setAvailableVehicles(vRes.data || []);
            } catch (error) {
                toast.error("Erro ao carregar recursos do parceiro");
            }
        };

        loadResources();
    }, [assignmentForm.partnerId]);

    const handleStatusUpdate = async (status: string) => {
        setIsActionLoading(true);
        try {
            const result = await updateBookingStatusAction(bookingId, status);
            if (result.success) {
                toast.success(`Reserva ${status === 'confirmed' ? 'confirmada' : status} com sucesso!`);
                await fetchDetails();
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao atualizar status");
            }
        } catch (error) {
            toast.error("Erro ao atualizar status");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelAndReassign = async () => {
        if (!confirm("Tem certeza que deseja cancelar esta atribuição? O sistema tentará encontrar um substituto automaticamente.")) return;

        setIsActionLoading(true);
        try {
            const result = await cancelAndReassignBookingAction(bookingId, "admin_reassign");
            if (result.success) {
                if (result.data?.reassignment?.type === 'reassigned') {
                    toast.success("Reserva reatribuída com sucesso!");
                } else if (result.data?.reassignment?.type === 'waitlist') {
                    toast.warning("Nenhum recurso disponível. Reserva colocada em lista de espera.");
                } else {
                    toast.success("Operação concluída.");
                }
                await fetchDetails();
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao processar reatribuição.");
            }
        } catch (error) {
            toast.error("Erro na operação de cancelamento.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleManualAssignSubmit = async () => {
        if (!assignmentForm.partnerId || !assignmentForm.vehicleId) {
            toast.error("Por favor, selecione pelo menos o parceiro e o veículo.");
            return;
        }

        setIsActionLoading(true);
        try {
            const result = await assignBookingManuallyAction(bookingId, assignmentForm);
            if (result.success) {
                toast.success("Recursos atribuídos manualmente com sucesso!");
                setIsManualAssignOpen(false);
                await fetchDetails();
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao atribuir recursos");
            }
        } catch (error) {
            toast.error("Erro técnico na atribuição");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (!isMounted || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-200" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">A carregar...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertTriangle className="w-12 h-12 text-amber-500" />
                <h1 className="text-xl font-black text-slate-900">Reserva não encontrada</h1>
                <Button variant="outline" asChild className="rounded-none">
                    <Link href={`/operations/${type === 'rental' ? 'bookings' : 'transfers'}`}>Voltar para Lista</Link>
                </Button>
            </div>
        );
    }

    const statusColor = {
        confirmed: "bg-slate-100 text-slate-700",
        pending: "bg-slate-50 text-slate-600 border border-slate-200",
        canceled: "bg-rose-50 text-rose-600",
        completed: "bg-slate-900 text-white",
    };

    const statusLabel = {
        confirmed: "Confirmado",
        pending: "Pendente",
        canceled: "Cancelado",
        completed: "Concluído",
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6">
                <div className="space-y-1">
                    <Link
                        href={`/operations/${type === 'rental' ? 'bookings' : 'transfers'}`}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        <ChevronLeft className="w-3 h-3" /> Voltar
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            #{booking.code || booking.id?.slice(0, 8)}
                        </h1>
                        <div className="flex gap-2">
                            <Badge className={cn("rounded-sm px-2 py-0.5 font-bold uppercase text-[9px] tracking-wider shadow-none", statusColor[booking.status as keyof typeof statusColor])}>
                                {statusLabel[booking.status as keyof typeof statusLabel] || booking.status}
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-500 border-none rounded-sm px-2 py-0.5 font-bold uppercase text-[9px] tracking-wider">
                                {type === 'rental' ? 'Aluguer' : 'Transfer'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {booking.status === 'pending' && (
                        <>
                            <Button
                                onClick={() => handleStatusUpdate('confirmed')}
                                disabled={isActionLoading || booking.waitlistEntry?.status === 'waiting'}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold text-[11px] uppercase tracking-wider h-10 px-4 transition-all"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirmar
                            </Button>
                            <Button
                                onClick={handleCancelAndReassign}
                                disabled={isActionLoading}
                                variant="ghost"
                                className="text-rose-600 hover:bg-rose-50 rounded-md font-bold text-[11px] uppercase tracking-wider h-10 px-4"
                            >
                                <XCircle className="w-3.5 h-3.5 mr-1.5" /> {booking.waitlistEntry?.status === 'waiting' ? 'Reatribuir' : 'Cancelar'}
                            </Button>
                        </>
                    )}
                    {["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(currentUser?.role) && (
                        <Button
                            onClick={() => setIsManualAssignOpen(!isManualAssignOpen)}
                            disabled={isActionLoading}
                            variant="outline"
                            className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md font-bold text-[11px] uppercase tracking-wider h-10 px-4"
                        >
                            <User className="w-3.5 h-3.5 mr-1.5" />
                            {isManualAssignOpen ? 'Fechar' : 'Atribuição Manual'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Manual Assignment Form */}
            {isManualAssignOpen && (
                <div className="bg-slate-50 border border-slate-200 p-6 space-y-4 rounded-md animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2 text-slate-900">
                        <Car className="w-4 h-4 text-slate-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest">Atribuição Manual de Recursos</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Parceiro</label>
                            <Select
                                value={assignmentForm.partnerId}
                                onValueChange={(val) => setAssignmentForm({ ...assignmentForm, partnerId: val, vehicleId: "", driverId: "" })}
                            >
                                <SelectTrigger className="h-10 rounded-sm border-slate-200 bg-white text-xs font-medium">
                                    <SelectValue placeholder="Selecionar Parceiro" />
                                </SelectTrigger>
                                <SelectContent>
                                    {partners.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name || p.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Viatura</label>
                            <Select
                                value={assignmentForm.vehicleId}
                                disabled={!assignmentForm.partnerId}
                                onValueChange={(val) => setAssignmentForm({ ...assignmentForm, vehicleId: val })}
                            >
                                <SelectTrigger className="h-10 rounded-sm border-slate-200 bg-white text-xs font-medium">
                                    <SelectValue placeholder={availableVehicles.length > 0 ? "Selecionar Viatura" : "Sem viaturas"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableVehicles.map(v => (
                                        <SelectItem key={v.id} value={v.id}>{v.brand} {v.model}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    <div className="flex justify-end pt-2 gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsManualAssignOpen(false)}
                            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 h-8"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleManualAssignSubmit}
                            disabled={isActionLoading || !assignmentForm.vehicleId}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold text-[10px] uppercase tracking-widest h-8 px-6"
                        >
                            {isActionLoading ? '...' : 'Atribuir'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Waitlist Alert */}
            {booking.waitlistEntry?.status === 'waiting' && (
                <div className="bg-slate-50 border border-dashed border-slate-300 p-5 rounded-md flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="w-5 h-5 text-slate-400" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Lista de Espera</h3>
                            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Aguardando atribuição de recursos por um administrador.</p>
                        </div>
                    </div>
                    {["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(currentUser?.role) && !isManualAssignOpen && (
                        <Button
                            variant="outline"
                            onClick={() => setIsManualAssignOpen(true)}
                            className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md font-bold text-[10px] uppercase tracking-widest h-9 px-6 shadow-sm"
                        >
                            Resolver Agora
                        </Button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Data */}
                <div className="lg:col-span-2 space-y-6">

                    {/* User Section */}
                    <section className="bg-white border border-slate-200 p-6 rounded-md shadow-sm">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                            <User className="w-4 h-4 text-slate-400" />
                            <h2 className="font-bold text-xs text-slate-900 uppercase tracking-widest">Dados do Cliente</h2>
                        </div>

                        {booking.client ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Nome</p>
                                    <p className="text-xs font-semibold text-slate-800">{booking.client.full_name || booking.client.name}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Email</p>
                                    <p className="text-xs font-semibold text-slate-800">{booking.client.email}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Telefone</p>
                                    <p className="text-xs font-semibold text-slate-800">{booking.client.phone || "---"}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">NIF</p>
                                    <p className="text-xs font-semibold text-slate-800">{booking.client.nif || "---"}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-400 font-medium italic">Dados não disponíveis</p>
                        )}
                    </section>

                    {/* Service Details Section */}
                    <section className="bg-white border border-slate-200 p-6 rounded-md shadow-sm">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                            <h2 className="font-bold text-xs text-slate-900 uppercase tracking-widest">Detalhes do Serviço</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Itinerary */}
                            <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-900" />
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Levantamento</p>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 pl-4">
                                            {booking.pickup_address || booking.pickupLocation || "---"}
                                        </p>
                                        {booking.start_time && (
                                            <div className="flex items-center gap-4 pl-4 pt-1">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                                    <Calendar className="w-3 h-3" /> {new Date(booking.start_time).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                                    <Clock className="w-3 h-3" /> {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 border border-slate-900 rounded-full" />
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Entrega</p>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 pl-4">
                                            {booking.dropoff_address || booking.dropoffLocation || "---"}
                                        </p>
                                        {booking.end_time && (
                                            <div className="flex items-center gap-4 pl-4 pt-1">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                                    <Calendar className="w-3 h-3" /> {new Date(booking.end_time).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Resource Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 border border-slate-100 rounded-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Car className="w-4 h-4 text-slate-400" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Viatura</p>
                                    </div>
                                    {booking.vehicle ? (
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-800">{booking.vehicle.brand} {booking.vehicle.model}</p>
                                            <p className="text-[10px] font-medium text-slate-500">{booking.vehicle.license_plate}</p>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 italic">Pendente</p>
                                    )}
                                </div>
                                <div className="p-4 border border-slate-100 rounded-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Motorista</p>
                                    </div>
                                    {booking.driver ? (
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-800">{booking.driver.full_name}</p>
                                            <p className="text-[10px] font-medium text-slate-500">{booking.driver.phone}</p>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 italic">Pendente</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stops for transfer */}
                    {type === 'transfer' && booking.stops && booking.stops.length > 0 && (
                        <div className="bg-slate-50 p-6 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paragens Intermédias</p>
                            <div className="space-y-3">
                                {booking.stops.map((stop: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                        <span className="text-xs font-bold text-slate-600">{stop}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Totals & Partner */}
                <div className="space-y-6">
                    <section className="bg-slate-900 p-6 rounded-md text-white shadow-sm">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 border-b border-slate-800 pb-3">Resumo Financeiro</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-tight">Preço Base</span>
                                <span className="text-xs font-bold">{(booking.total_price || 0).toLocaleString()} Kz</span>
                            </div>
                            {extras.map((extra, idx) => (
                                <div key={idx} className="flex justify-between items-center text-slate-400">
                                    <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[120px]">{extra.name}</span>
                                    <span className="text-xs font-bold">{(extra.price || 0).toLocaleString()} Kz</span>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-slate-800 mt-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Geral</span>
                                    <span className="text-xl font-black text-white">
                                        {(booking.total_price || 0).toLocaleString()} <span className="text-[10px] text-slate-500 font-bold ml-1">Kz</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Extras Section (Compact) */}
                    {extras.length > 0 && (
                        <div className="bg-white border border-slate-200 p-6 rounded-md shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Plus className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Extras Adicionados</h3>
                            </div>
                            <div className="space-y-3">
                                {extras.map((extra) => (
                                    <div key={extra.id} className="flex justify-between items-start pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-bold text-slate-800 leading-none">{extra.name}</p>
                                            <p className="text-[9px] text-slate-400 font-medium">Extra selecionado</p>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-700">{(extra.price || 0).toLocaleString()} Kz</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <section className="bg-white border border-slate-200 p-6 rounded-md shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Flag className="w-4 h-4 text-slate-400" />
                            <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Parceiro Responsável</h2>
                        </div>
                        {booking.partner ? (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-800">{booking.partner.name || booking.partner.nome}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="truncate">{booking.partner.email || "Sem e-mail"}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-400 italic">Não vinculado</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
