"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    CreditCard,
    MapPin,
    Award,
    Globe,
    Clock,
    Edit,
    AlertCircle,
    CheckCircle2,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { getTeamMemberAction } from "@/actions/private/team/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TeamMemberDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMember() {
            try {
                const res = await getTeamMemberAction(id);
                if (res.success) {
                    setMember(res.data);
                } else {
                    toast.error("Membro não encontrado");
                    router.push("/partners/fleet/teams");
                }
            } catch (error) {
                toast.error("Erro ao carregar dados do membro");
            } finally {
                setLoading(false);
            }
        }
        loadMember();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Carregando perfil...</p>
            </div>
        );
    }

    if (!member) return null;

    const isDriver = ["motorista", "driver"].includes(member.sub_role?.toLowerCase() || "") || member.role === "DRIVER";

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "online": return "bg-emerald-500";
            case "ocupado": return "bg-amber-500";
            case "offline": return "bg-slate-300";
            default: return "bg-slate-300";
        }
    };

    // Helper to check if value exists and is not empty
    const hasValue = (val: any) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "string" && val.trim() === "") return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-none hover:bg-slate-100">
                        <Link href="/partners/fleet/teams">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {member.full_name || member.name}
                                {hasValue(member.nickname) && <span className="ml-2 text-slate-400 text-lg font-medium">({member.nickname})</span>}
                            </h1>
                            <Badge className="bg-blue-50 text-blue-600 border-blue-100 rounded-none text-[9px] font-black tracking-widest uppercase">
                                {member.sub_role || member.role}
                            </Badge>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">ID de Membro: <span className="text-slate-900 font-mono font-bold uppercase">{id.split('-')[0]}</span></p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-none border-slate-200 hover:bg-slate-50 text-[10px] font-black tracking-widest px-6" asChild>
                        <Link href={`/partners/fleet/teams/${id}/edit`}>
                            <Edit size={14} className="mr-2" />
                            Editar Perfil
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda: Card de Perfil & Status */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-100 shadow-sm overflow-hidden rounded-none">
                        <div className="h-32 bg-slate-900 relative">
                            <div className="absolute -bottom-12 left-8 p-1 bg-white border border-slate-100 shadow-xl">
                                {member.fotoPerfil || member.avatar_url ? (
                                    <img
                                        src={member.fotoPerfil || member.avatar_url}
                                        alt={member.name || member.full_name}
                                        className="w-24 h-24 object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-slate-300 font-black text-2xl">
                                        {(member.full_name || member.name || "U").charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pt-16 p-8 space-y-6">


                            <div className="space-y-4">
                                {hasValue(member.email) && <InfoItem icon={Mail} label="Email Principal" value={member.email} />}
                                {hasValue(member.phone || member.telefone) && <InfoItem icon={Phone} label="Telemóvel" value={member.phone || member.telefone} />}
                                {hasValue(member.phone_alt || member.phoneAlt) && <InfoItem icon={AlertCircle} label="Contacto Emergência" value={member.phone_alt || member.phoneAlt} />}
                                {hasValue(member.vehicleModel) && (
                                    <div className="pt-2">
                                        <Badge variant="outline" className="w-full justify-start rounded-none border-slate-100 bg-slate-50 text-slate-600 font-bold py-2">
                                            Veículo: {member.vehicleModel}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats de Atividade */}
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-none space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} /> Histórico de Registo
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Membro desde</span>
                                <span className="font-bold text-slate-700">{new Date(member.created_at || member.createdAt).toLocaleDateString("pt-PT")}</span>
                            </div>
                            {hasValue(member.updated_at || member.updatedAt) && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium">Última atualização</span>
                                    <span className="font-bold text-slate-700">{new Date(member.updated_at || member.updatedAt).toLocaleDateString("pt-PT")}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Informação Detalhada */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Informações Pessoais */}
                    <div className="bg-white border border-slate-100 shadow-sm p-8 space-y-10 rounded-none">
                        {/* Dados Fiscais */}
                        <section>
                            <h2 className="text-sm font-black tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
                                <Shield size={18} className="text-primary" />
                                Dados Identitários & Fiscais
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                                {hasValue(member.full_name || member.name || member.fullName) && <DetailItem label="Nome Completo" value={member.full_name || member.name || member.fullName} />}
                                {hasValue(member.nickname) && <DetailItem label="Nickname / Alcunha" value={member.nickname} />}
                                {hasValue(member.nif) && <DetailItem label="NIF" value={member.nif} color="font-mono text-blue-600" />}
                                {hasValue(member.document_number || member.documentNumber) && <DetailItem label="Documento (BI/Pass)" value={member.document_number || member.documentNumber} />}
                                {hasValue(member.date_of_birth || member.dateOfBirth) && <DetailItem label="Data de Nascimento" value={new Date(member.date_of_birth || member.dateOfBirth).toLocaleDateString("pt-PT")} />}
                                {hasValue(member.nationality) && <DetailItem label="Nacionalidade" value={member.nationality} />}
                                {hasValue(member.gender) && <DetailItem label="Género" value={member.gender} className="capitalize" />}
                            </div>
                        </section>

                        {/* Endereço */}
                        {(hasValue(member.address_street || member.addressStreet) || hasValue(member.address_city || member.addressCity) || hasValue(member.address_province || member.addressProvince)) && (
                            <section className="pt-8 border-t border-slate-50">
                                <h2 className="text-sm font-black tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
                                    <MapPin size={18} className="text-rose-500" />
                                    Localização & Residência
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                                    {hasValue(member.address_street || member.addressStreet) && <DetailItem label="Morada / Rua" value={member.address_street || member.addressStreet} className="md:col-span-1 text-left" />}
                                    {hasValue(member.address_city || member.addressCity) && <DetailItem label="Cidade" value={member.address_city || member.addressCity} />}
                                    {hasValue(member.address_province || member.addressProvince) && <DetailItem label="Província" value={member.address_province || member.addressProvince} />}
                                </div>
                            </section>
                        )}

                        {/* Secção específica para Motoristas */}
                        {isDriver && (hasValue(member.license_number || member.licenseNumber) || hasValue(member.license_category || member.licenseCategory)) && (
                            <section className="pt-8 border-t border-slate-50">
                                <h2 className="text-sm font-black tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
                                    <Award size={18} className="text-blue-600" />
                                    Habilitação de Condução
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                                    {hasValue(member.license_number || member.licenseNumber) && <DetailItem label="Nº Carta de Condução" value={member.license_number || member.licenseNumber} color="text-blue-700 font-mono" />}
                                    {hasValue(member.license_category || member.licenseCategory) && <DetailItem label="Categoria" value={member.license_category || member.licenseCategory} />}
                                    {hasValue(member.license_date || member.licenseDate) && <DetailItem label="Data de Emissão" value={new Date(member.license_date || member.licenseDate).toLocaleDateString("pt-PT")} />}
                                    {hasValue(member.license_expiry || member.licenseExpiry) && <DetailItem label="Validade da Carta" value={new Date(member.license_expiry || member.licenseExpiry).toLocaleDateString("pt-PT")} />}
                                    <DetailItem label="Carta Profissional" value={member.professional_license || member.professionalLicense ? "Sim" : "Não"} />
                                    {hasValue(member.experience_years || member.experienceYears) && <DetailItem label="Experiência" value={`${member.experience_years || member.experienceYears || 0} anos`} />}
                                </div>
                                {hasValue(member.languages) && (
                                    <div className="mt-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Idiomas Fluentes</p>
                                        <div className="flex flex-wrap gap-2">
                                            {member.languages.map((lang: string, idx: number) => (
                                                <Badge key={idx} variant="outline" className="rounded-none font-bold text-xs px-4 py-1.5 border-slate-200">
                                                    <Globe size={12} className="mr-2 text-slate-400" /> {lang}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Notas */}
                        {hasValue(member.notes) && (
                            <section className="pt-8 border-t border-slate-50">
                                <h2 className="text-sm font-black tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
                                    <AlertCircle size={18} className="text-slate-400" />
                                    Notas & Observações Internas
                                </h2>
                                <div className="bg-slate-50 p-6 border border-dashed border-slate-200 text-sm text-slate-600 font-medium leading-relaxed">
                                    {member.notes}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Status da Conta */}
                    <div className={cn(
                        "p-6 flex items-center justify-between rounded-none border shadow-sm",
                        member.is_active || member.isActive ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-none",
                                member.is_active || member.isActive ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                            )}>
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className={cn("font-black text-sm", (member.is_active || member.isActive) ? "text-emerald-900" : "text-rose-900")}>
                                    {(member.is_active || member.isActive) ? "Conta Ativa e Verificada" : "Conta Suspensa / Inativa"}
                                </h4>
                                <p className={cn("text-xs font-medium", (member.is_active || member.isActive) ? "text-emerald-700" : "text-rose-700")}>
                                    {(member.is_active || member.isActive)
                                        ? "Este colaborador possui credenciais válidas e acesso ativo aos sistemas da plataforma."
                                        : "O acesso deste colaborador foi temporariamente revogado ou ainda não foi ativado."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 text-slate-400 shrink-0">
                <Icon size={16} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
            </div>
        </div>
    );
}

function DetailItem({ label, value, color, className }: { label: string; value: any; color?: string; className?: string }) {
    return (
        <div className={cn("space-y-1", className)}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={cn("text-sm font-bold text-slate-700", color)}>{value || "---"}</p>
        </div>
    );
}
