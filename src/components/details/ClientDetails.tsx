"use client";

import React from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    Shield,
    Clock,
    FileText,
    Car
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ClientDetailsProps {
    client: any;
}

export default function ClientDetails({ client }: ClientDetailsProps) {
    if (!client) return null;

    return (
        <div className="space-y-6">
            {/* Header / Identity Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-slate-100 shadow-sm rounded-none">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-24 h-24 bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl font-black text-blue-600 rounded-full shrink-0">
                                {client.avatarUrl ? (
                                    <img src={client.avatarUrl} alt={client.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    client.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                                )}
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{client.name}</h2>
                                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className={client.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500"}>
                                                {client.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                            <span className="text-xs tracking-widest uppercase text-slate-400">Cliente Principal</span>
                                        </p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Registrado em</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {client.joinedAt ? new Date(client.joinedAt).toLocaleDateString('pt-PT') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium">{client.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Phone className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-medium">{client.phone || "Sem contacto"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <MapPin className="w-4 h-4 text-orange-500" />
                                            <span className="text-sm font-medium">
                                                {[client.address?.city, client.address?.province].filter(Boolean).join(', ') || "Localização não informada"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Shield className="w-4 h-4 text-indigo-500" />
                                            <span className="text-sm font-medium">NIF: {client.nif || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="border-slate-100 shadow-sm rounded-none bg-slate-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black tracking-widest text-slate-400 uppercase">Resumo Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">
                                {client.stats.totalSpent?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) || "0,00 Kz"}
                            </p>
                            <p className="text-xs font-medium text-slate-500 mt-1">Total gasto em serviços</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white border border-slate-100 shadow-sm">
                                <p className="text-xl font-bold text-slate-900">{client.stats.totalBookings}</p>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reservas</p>
                            </div>
                            <div className="p-3 bg-white border border-slate-100 shadow-sm">
                                <p className="text-xl font-bold text-emerald-600">{client.stats.completedBookings}</p>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Concluídas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Info & History */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Details */}
                <Card className="border-slate-100 shadow-sm rounded-none h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <User className="w-4 h-4" />
                            Dados Pessoais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <DetailRow label="Nacionalidade" value={client.nationality} />
                            <DetailRow label="Género" value={client.gender} />
                            <DetailRow label="Data de Nascimento" value={client.birthDate ? new Date(client.birthDate).toLocaleDateString() : null} />
                            <DetailRow label="Documento ID" value={client.documentNumber} />
                            <Separator />
                            <DetailRow label="Endereço Completo" value={client.address?.street} />
                        </div>
                    </CardContent>
                </Card>

                {/* Booking History */}
                <Card className="md:col-span-2 border-slate-100 shadow-sm rounded-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <HistoryIcon className="w-4 h-4" />
                            Histórico Recente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {client.recentBookings && client.recentBookings.length > 0 ? (
                            <div className="space-y-4">
                                {client.recentBookings.map((booking: any) => (
                                    <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 text-[10px] font-black tracking-wider uppercase rounded-sm">
                                                    {booking.service}
                                                </Badge>
                                                <span className="text-xs font-medium text-slate-500">
                                                    {new Date(booking.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800">{booking.route || "Rota não especificada"}</p>
                                        </div>

                                        <div className="mt-2 sm:mt-0 text-right">
                                            <p className="text-sm font-black text-slate-900">
                                                {Number(booking.price).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                            </p>
                                            <StatusBadge status={booking.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <Car className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Nenhuma reserva encontrada</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: string | null | undefined }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
            <span className="text-sm font-medium text-slate-700">{value || "---"}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "text-amber-600 bg-amber-50",
        confirmed: "text-blue-600 bg-blue-50",
        completed: "text-emerald-600 bg-emerald-50",
        cancelled: "text-rose-600 bg-rose-50",
    };

    const labels: Record<string, string> = {
        pending: "Pendente",
        confirmed: "Confirmado",
        completed: "Concluído",
        cancelled: "Cancelado",
    };

    return (
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${styles[status] || "text-slate-600 bg-slate-100"}`}>
            {labels[status] || status}
        </span>
    );
}

const HistoryIcon = Clock; // Alias for clarity
