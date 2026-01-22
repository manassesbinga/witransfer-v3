/** @format */

"use client";

import React, { useState } from "react";
import {
    Plus,
    User,
    Search,
    Filter,
    Edit,
    Trash2,
    Mail,
    Phone,
    History,
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deleteClientAction } from "@/actions/private/clients/actions";

interface ClientsClientProps {
    initialClients: any[];
    userRole?: string;
}

import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { getClientsAction } from "@/actions/private/clients/actions";

export default function ClientsClient({ initialClients, userRole }: ClientsClientProps) {
    const router = useRouter();

    const {
        data: clients,
        loading,
        hasMore,
        loadMore
    } = usePaginatedQuery<any>({
        fetchAction: getClientsAction,
        key: "clients-list",
        initialData: initialClients,
        limit: 50,
        tags: ["clients"]
    });

    const [searchTerm, setSearchTerm] = useState("");

    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Registado", value: clients.length, icon: User },
                    { label: "Reservas Ativas", value: clients.filter(c => (c.activeBookings || 0) > 0).length, icon: History },
                    { label: "Novos este Mês", value: "12", icon: Plus },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-none">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600">
                                <stat.icon size={24} />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">{stat.value}</p>
                                <p className="text-slate-400 text-[10px] font-black tracking-widest">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-[11px] font-medium">Indicador de desempenho</p>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-100 shadow-none rounded-none">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Pesquisar por nome, identificação ou contactos..."
                            className="pl-4 h-11 rounded-none border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="rounded-none h-11 px-6 border-slate-200 font-black text-[10px] tracking-widest hover:bg-slate-50">
                        <Filter className="w-4 h-4 mr-2" /> Filtros
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-none">
                                <TableHead className="font-black text-[10px] tracking-widest text-slate-400 h-16 pl-8">Cliente / Identidade</TableHead>
                                <TableHead className="font-black text-[10px] tracking-widest text-slate-400">Contactos</TableHead>
                                <TableHead className="font-black text-[10px] tracking-widest text-slate-400">Status</TableHead>
                                <TableHead className="font-black text-[10px] tracking-widest text-slate-400">Última Atividade</TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-60 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                                            <User size={48} />
                                            <p className="font-black text-[11px] tracking-[0.2em]">Sem registos correspondentes</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        onClick={() => router.push(`/fleet/clients/${client.id}`)}
                                        className="hover:bg-blue-50 transition-colors h-20 border-slate-50 cursor-pointer group">
                                        <TableCell className="pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#0069B8]/5 border border-[#0069B8]/10 flex items-center justify-center font-black text-[#0069B8] text-xs">
                                                    {client.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-[13px] tracking-tighter">{client.name}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold tracking-widest">{client.customerType || 'Particular'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Mail className="w-3 h-3 text-[#0069B8]" />
                                                    <span className="text-[11px] font-bold">{client.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Phone className="w-3 h-3 text-slate-300" />
                                                    <span className="text-[11px] font-bold">{client.phone || "---"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    client.status === 'active' ? "bg-emerald-500" : "bg-rose-500"
                                                )} />
                                                <span className="text-[10px] font-black tracking-widest text-slate-600">
                                                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-900">{client.lastBookingDate ? new Date(client.lastBookingDate).toLocaleDateString() : 'Nunca'}</span>
                                                <span className="text-[9px] text-slate-400 font-medium tracking-widest">Via Web App</span>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {hasMore && (
                    <div className="flex justify-center mt-8 mb-12">
                        <Button
                            onClick={() => loadMore()}
                            disabled={loading}
                            variant="outline"
                            className="min-w-[200px] h-12 rounded-none border-2 border-primary text-primary font-black text-[10px] tracking-[2px] hover:bg-primary hover:text-white transition-all group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                                    CARREGANDO...
                                </div>
                            ) : (
                                "CARREGAR MAIS"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

