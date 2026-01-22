/** @format */

"use client";

import React, { useState } from "react";
import {
    Search,
    User,
    Loader2,
    X,
    Filter
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { updateBookingStatusAction, cancelAndReassignBookingAction, getFilteredBookingsAction } from "@/actions/private/bookings/actions";
import { getActivePartnersAction } from "@/actions/private/partners/actions";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { globalDataCache } from "@/lib/data-cache";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";

interface BookingWithDetails extends Partial<Booking> {
    userName?: string;
    carName?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    totalAmount?: number;
    startDate?: string;
    endDate?: string;
    created_at?: string;
    userEmail?: string;
    userPhone?: string;
    carPlate?: string;
    partnerName?: string;
    waitlistEntry?: { id: string; status: string } | null;
    id: string; // Keep ID mandatory
}

interface TransfersClientProps {
    initialTransfers: BookingWithDetails[];
}

export default function TransfersClient({ initialTransfers }: TransfersClientProps) {
    const router = useRouter();

    // DEBUG: Log initial data
    console.log(`[DEBUG_UI] TransfersClient mounted with ${initialTransfers?.length || 0} initial items.`);

    const [partnerFilter, setPartnerFilter] = useState<string>("all");
    const [partners, setPartners] = useState<any[]>([]);

    const { data: transfers, loading: isPageLoading, hasMore, loadMore } = usePaginatedQuery<BookingWithDetails>({
        key: "bookings-transfer",
        fetchAction: (page, limit) => getFilteredBookingsAction({ service_type: 'transfer', page, limit, partnerId: partnerFilter } as any),
        limit: 10,
        initialData: initialTransfers,
        tags: ["bookings"]
    });

    // DEBUG: Log current state
    console.log(`[DEBUG_UI] Current transfers in state: ${transfers?.length || 0}`);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [routeFilter, setRouteFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Sync status change to global cache if needed
    const syncStatusToCache = (id: string, status: string) => {
        const cached = globalDataCache.get<BookingWithDetails>("bookings-transfer");
        if (cached) {
            const updated = cached.map(b => b.id === id ? { ...b, status: status as any } : b);
            globalDataCache.set("bookings-transfer", updated, ["bookings"]);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        console.log(`[ACTION] handleUpdateStatus for ID: ${id}, Status: ${status}`);
        setLoadingId(id);
        try {
            let result;

            if (status === 'canceled') {
                result = await cancelAndReassignBookingAction(id, "admin_cancel");
            } else {
                result = await updateBookingStatusAction(id, status);
            }

            console.log(`[ACTION] Result:`, result);

            if (result.success) {
                // Update local state by syncing with cache
                syncStatusToCache(id, status === 'confirmed' ? 'confirmed' : 'canceled');
                toast.success(`Transfer ${status === 'canceled' ? 'rejeitado' : 'aceite'} com sucesso!`);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao atualizar status.");
            }
        } catch (error: any) {
            console.error(`[ACTION] Error:`, error);
            toast.error("Erro ao atualizar status.");
        } finally {
            setLoadingId(null);
        }
    };

    const locations = Array.from(new Set([
        ...transfers.map(b => b.pickupLocation),
        ...transfers.map(b => b.dropoffLocation)
    ])).filter(Boolean);

    const filteredTransfers = transfers.filter(b => {
        const matchesSearch =
            (b.userName || b.client?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.userPhone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.pickupLocation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.dropoffLocation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.carPlate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        const matchesRoute = routeFilter === 'all' || b.pickupLocation === routeFilter || b.dropoffLocation === routeFilter;
        const matchesDate = !dateFilter || (b.created_at && b.created_at.includes(dateFilter));

        return matchesSearch && matchesStatus && matchesRoute && matchesDate;
    });

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        getActivePartnersAction().then(res => {
            if (res.success) setPartners(res.data || []);
        });
    }, []);

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setRouteFilter("all");
        setPartnerFilter("all");
        setDateFilter("");
    };

    if (!isMounted) return null;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Header Controls Reserved Space */}
            </div>

            <div className="bg-white shadow-sm border border-slate-100 p-6 mb-8 rounded-none">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-3 relative">
                        <Input
                            type="text"
                            placeholder="Pesquisar por cliente, email, local, id..."
                            className="pl-4 pr-10 py-2.5 border-slate-200 focus:ring-2 focus:ring-blue-500 w-full text-xs rounded-none h-[42px] font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2.5 border border-slate-200 text-xs text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none bg-white cursor-pointer h-[42px] rounded-none">
                            <option value="all">Estado</option>
                            <option value="pending">Pendente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="canceled">Cancelado</option>
                            <option value="completed">Completo</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <select
                            value={partnerFilter}
                            onChange={(e) => setPartnerFilter(e.target.value)}
                            className="px-3 py-2.5 border border-slate-200 text-xs text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none bg-white cursor-pointer h-[42px] rounded-none">
                            <option value="all">Parceiros</option>
                            {partners.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <select
                            value={routeFilter}
                            onChange={(e) => setRouteFilter(e.target.value)}
                            className="px-3 py-2.5 border border-slate-200 text-xs text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none bg-white cursor-pointer h-[42px] rounded-none">
                            <option value="all">Todas Rotas</option>
                            {locations.map(l => (
                                <option key={l} value={l!}>{l?.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <Input
                            type="date"
                            className="px-3 py-2.5 border border-slate-200 text-xs text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white h-[42px] rounded-none"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filtros Ativos:</span>
                        {searchTerm || statusFilter !== 'all' || routeFilter !== 'all' || partnerFilter !== 'all' || dateFilter ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-4 rounded-none text-[10px] font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-rose-100"
                                onClick={resetFilters}
                            >
                                <Filter className="w-3 h-3 mr-2" />
                                LIMPAR TUDO
                            </Button>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-300">Nenhum filtro aplicado</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Total: <span className="text-slate-900">{filteredTransfers.length} resultados</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <Table className="border-separate border-spacing-y-3">
                    <TableHeader>
                        <TableRow className="bg-transparent hover:bg-transparent border-none">
                            <TableHead className="font-semibold text-[11px] text-slate-500 h-10 pl-4 border-none">ID / Data</TableHead>
                            <TableHead className="font-semibold text-[11px] text-slate-500 h-10 border-none">Cliente</TableHead>
                            <TableHead className="font-semibold text-[11px] text-slate-500 h-10 border-none hidden lg:table-cell">Origem / Destino</TableHead>
                            <TableHead className="font-semibold text-[11px] text-slate-500 h-10 border-none">Total</TableHead>
                            <TableHead className="font-semibold text-[11px] text-slate-500 h-10 border-none">Status</TableHead>
                            <TableHead className="font-semibold text-[11px] text-slate-500 h-10 text-right pr-4 border-none">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransfers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-medium text-xs">
                                    Nenhuma solicitação encontrada
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransfers.map((b) => (
                                <TableRow
                                    key={b.id}
                                    onClick={() => router.push(`/operations/transfers/${b.id}`)}
                                    className="hover:bg-white transition-all h-20 border-none cursor-pointer group shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md">
                                    <TableCell className="pl-4 bg-white first:rounded-l-xl border-y border-l border-slate-100/50">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-[10px] md:text-xs">#{b.code || b.id?.slice(0, 8)}</span>
                                            <span className="text-[9px] md:text-[10px] text-slate-400 font-medium">{new Date(b.created_at || "").toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="bg-white border-y border-slate-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {b.userName !== "Cliente" ? b.userName : (b.userEmail || "Cliente")}
                                                </span>
                                                <div className="flex flex-col text-[10px] text-slate-400 font-medium leading-tight">
                                                    {b.userEmail && b.userName !== "Cliente" && <span>{b.userEmail}</span>}
                                                    <span>{b.userPhone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="bg-white border-y border-slate-100/50 hidden lg:table-cell">
                                        <div className="flex flex-col gap-0.5 max-w-[200px]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[11px] font-semibold text-slate-700 truncate">{b.pickupLocation}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                <span className="text-[11px] font-semibold text-slate-700 truncate">{b.dropoffLocation}</span>
                                            </div>
                                            {b.carName && b.carName !== "Viatura" && (
                                                <div className="mt-1">
                                                    <span className="text-[10px] font-bold text-blue-500">Viatura: {b.carName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="bg-white border-y border-slate-100/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] md:text-sm font-bold text-slate-900">{Number(b.totalPrice || b.totalAmount).toLocaleString()} Kz</span>
                                            <span className="text-[9px] md:text-[10px] text-slate-400 font-medium hidden sm:inline">{b.partnerName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="bg-white border-y border-slate-100/50">
                                        <div className="flex flex-col gap-1 items-start">
                                            <Badge className={cn(
                                                "border-none rounded-full px-2.5 py-0.5 font-semibold text-[10px]",
                                                b.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" :
                                                    b.status === 'pending' ? (b.waitlistEntry?.status === 'waiting' ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-600") :
                                                        b.status === 'canceled' ? "bg-rose-50 text-rose-600" :
                                                            "bg-slate-50 text-slate-500"
                                            )}>
                                                {b.status === 'confirmed' ? 'Aceite' :
                                                    b.status === 'pending' ? (b.waitlistEntry?.status === 'waiting' ? 'Lista de Espera' : 'Pendente') :
                                                        b.status === 'canceled' ? 'Rejeitado' : b.status}
                                            </Badge>
                                            {b.waitlistEntry?.status === 'waiting' && (
                                                <span className="text-[8px] font-black text-purple-400 uppercase tracking-tighter">Aguardando Viatura</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-4 bg-white last:rounded-r-xl border-y border-r border-slate-100/50">
                                        <div className="flex justify-end gap-5 items-center">
                                            {loadingId === b.id ? (
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Processando...
                                                </div>
                                            ) : b.status === 'pending' ? (
                                                <>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        disabled={!!loadingId || b.waitlistEntry?.status === 'waiting'}
                                                        title={b.waitlistEntry?.status === 'waiting' ? "Não é possível aceitar enquanto estiver na lista de espera" : "Aceitar Transfer"}
                                                        className={cn(
                                                            "h-7 px-0 font-bold text-[12px] no-underline hover:no-underline flex items-center gap-1",
                                                            b.waitlistEntry?.status === 'waiting' ? "text-slate-300 cursor-not-allowed" : "text-emerald-600 hover:text-emerald-700"
                                                        )}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleUpdateStatus(b.id, 'confirmed');
                                                        }}
                                                    >
                                                        Aceitar
                                                    </Button>
                                                    {b.waitlistEntry?.status !== 'waiting' && (
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            disabled={!!loadingId}
                                                            className="h-7 px-0 text-rose-500 hover:text-rose-600 font-bold text-[12px] no-underline hover:no-underline flex items-center gap-1"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleUpdateStatus(b.id, 'canceled');
                                                            }}
                                                        >
                                                            Rejeitar
                                                        </Button>
                                                    )}
                                                </>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {hasMore && (
                <div className="flex justify-center mt-8">
                    <Button
                        variant="outline"
                        onClick={() => loadMore()}
                        disabled={isPageLoading}
                        className="rounded-none border-slate-200 text-slate-500 font-bold text-xs px-8 h-10 hover:bg-slate-50 transition-colors"
                    >
                        {isPageLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                CARREGANDO MAIS...
                            </>
                        ) : (
                            "CARREGAR MAIS"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
