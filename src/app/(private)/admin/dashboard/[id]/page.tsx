"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Building2, Mail, Phone, Calendar, Users, Car, Shield, Loader2, MapPin, Check, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getPartnerByIdAction, approvePartnerAction } from "@/actions/private/partners/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PartnerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isApproving, setIsApproving] = useState(false);

    const fetchPartner = async () => {
        const res = await getPartnerByIdAction(id);
        if (res.success) {
            setPartner(res.data);
        } else {
            toast.error("Erro ao carregar detalhes do parceiro");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPartner();
    }, [id]);

    const handleApprove = async () => {
        setIsApproving(true);
        const res = await approvePartnerAction(id);
        if (res.success) {
            toast.success("Parceiro aprovado!");
            fetchPartner();
        } else {
            toast.error(res.error || "Erro ao aprovar");
        }
        setIsApproving(false);
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">Parceiro não encontrado.</p>
                <Link href="/admin/dashboard" className="text-primary font-bold mt-4 inline-block">
                    Voltar ao Dashboard
                </Link>
            </div>
        );
    }

    const isPending = partner.status === "pending";

    return (
        <div className="space-y-6 pb-12 overflow-x-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/admin/dashboard">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Detalhes do Parceiro</h1>
                        <p className="text-slate-500 text-sm font-bold tracking-widest text-[10px]">Gestão e verificação de conta</p>
                    </div>
                </div>

                {isPending && (
                    <Button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-black h-11 px-6 shadow-lg shadow-emerald-200 text-[10px] tracking-widest gap-2 border-none"
                    >
                        {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Aprovar Parceiro
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="lg:col-span-2 border border-slate-100 shadow-none rounded-none overflow-hidden bg-white">
                    <CardHeader className={cn(
                        "border-b border-slate-50 p-8",
                        isPending ? "bg-amber-50/50" : "bg-slate-50/50"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-4 rounded-2xl font-bold shadow-sm",
                                    isPending ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                )}>
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black text-slate-900 tracking-tight">
                                        {partner.name || partner.legal_name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn(
                                            "border-none px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider",
                                            partner.status === "active" ? "bg-green-100 text-green-700" :
                                                partner.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {partner.status === "active" ? "Ativo" :
                                                partner.status === "pending" ? "Aguardando Aprovação" : partner.status}
                                        </Badge>
                                        <span className="text-[10px] font-black text-slate-300 tracking-widest">
                                            ID: {partner.id?.split('-')[0]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-10">
                        {/* Profile Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-[10px] font-black tracking-[0.2em]">E-mail de Contato</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{partner.email}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-[10px] font-black tracking-[0.2em]">Telefone / WhatsApp</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{partner.phone || "Não informado"}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-[10px] font-black tracking-[0.2em]">Responsável Legal</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{partner.manager_name || "N/A"}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-[10px] font-black tracking-[0.2em]">Localização</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">
                                    {partner.address_province}, {partner.address_city || partner.address_street || "Angola"}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-[10px] font-black tracking-[0.2em]">Membro desde</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">
                                    {new Date(partner.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Remuneration Info */}
                        <div className="p-6 bg-slate-50 rounded-none border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 tracking-widest mb-1">Modelo de Remuneração</p>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-white border-slate-200 text-slate-700 capitalize font-bold">
                                        {partner.remuneration_type || "percentual"}
                                    </Badge>
                                    <span className="text-lg font-black text-slate-900">
                                        {partner.remuneration_value || "15"}{partner.remuneration_type === 'fixo' ? ' Kz' : '%'}
                                    </span>
                                </div>
                            </div>
                            {partner.document_url && (
                                <div className="flex items-end justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(partner.document_url, '_blank')}
                                        className="rounded-none border-blue-200 text-blue-600 font-black text-[10px] tracking-widest gap-2 bg-white px-6 h-11"
                                    >
                                        <Shield className="w-4 h-4" /> Visualizar Documentos
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    <Card className="border border-slate-100 shadow-none rounded-none overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-purple-50 rounded-none">
                                    <Car className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-slate-400">Frota de Veículos</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <h3 className="text-4xl font-black text-slate-900 tabular-nums">{partner.vehicleCount}</h3>
                                <span className="text-xs font-bold text-slate-400">viaturas</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-100 shadow-none rounded-none overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-green-50 rounded-none">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-slate-400">Equipa Operacional</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <h3 className="text-4xl font-black text-slate-900 tabular-nums">{partner.driverCount}</h3>
                                <span className="text-xs font-bold text-slate-400">motoristas</span>
                            </div>
                        </CardContent>
                    </Card>

                    {!isPending && (
                        <Card className="border border-slate-100 shadow-none rounded-none overflow-hidden bg-primary text-white">
                            <CardContent className="p-8 space-y-4">
                                <h4 className="text-lg font-black tracking-tight">Status de Verificação</h4>
                                <div className="flex items-center gap-2 text-white/80">
                                    <div className="w-6 h-6 rounded-none bg-white/20 flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold">Identidade Validada</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/80">
                                    <div className="w-6 h-6 rounded-none bg-white/20 flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold">Documentos Aprovados</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
