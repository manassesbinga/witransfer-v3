/** @format */

import React from "react";
import {
    ChevronLeft,
    Plus,
    Car,
    Fuel,
    Gauge,
    Wind,
    Info,
    FileText,
    Users,
    ClipboardCheck,
    Wrench,
    Check,
    X,
    Edit,
    Activity,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCarAction, getRelatedVehiclesAction } from "@/actions/private/cars/actions";
import { Vehicle } from "@/types";
import { redirect } from "next/navigation";

export default async function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await getCarAction(id);

    let relatedVehicles: any[] = [];

    if (!res || !res.success || !res.data) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-none">
                <Car size={48} className="text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Veículo não encontrado</h2>
                <p className="text-slate-500 mb-6">Não foi possível localizar os dados deste veículo.</p>
                <Button variant="outline" asChild className="rounded-none">
                    <Link href="/admin/fleet/vehicles">Voltar à Frota</Link>
                </Button>
            </div>
        );
    }

    const vehicle: Vehicle = res.data;

    // Fetch related vehicles
    if (vehicle.memberId || vehicle.partnerId) {
        const relatedRes = await getRelatedVehiclesAction(id, vehicle.memberId, vehicle.partnerId);
        if (relatedRes.success && relatedRes.data) {
            relatedVehicles = relatedRes.data;
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "ativa": return "success";
            case "manutencao": return "warning";
            case "inativa": return "destructive";
            default: return "default";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header com Ações */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-none hover:bg-slate-100">
                        <Link href="/admin/fleet/vehicles">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <Badge variant={getStatusVariant(vehicle.status || "desconhecido") as any} className="rounded-none px-3 py-1 font-bold tracking-widest text-[10px]">
                                {vehicle.status}
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-medium">Matrícula: <span className="text-slate-900 font-bold font-mono">{vehicle.licensePlate}</span> • <span className="font-bold text-primary">{vehicle.categoryName}</span> • {vehicle.color}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-none border-slate-200 hover:bg-slate-50 text-[10px] font-black tracking-widest px-6" asChild>
                        <Link href={`/fleet/vehicles/${id}/edit`}>
                            <Edit size={16} className="mr-2" />
                            Editar Dados
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Principal: Info Técnica e Estado */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Imagem */}
                    <div className="bg-slate-50 border border-slate-100 flex items-center justify-center relative shadow-sm h-[400px] overflow-hidden">
                        {vehicle.image ? (
                            <img src={vehicle.image} alt={vehicle.model} className="object-cover w-full h-full" />
                        ) : (
                            <Car size={80} className="text-slate-200" />
                        )}
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 border border-slate-100 text-xs font-bold shadow-lg">
                            ANO {vehicle.year}
                        </div>
                    </div>

                    {/* Especificações Técnicas */}
                    <div className="bg-white border border-slate-100 shadow-sm overflow-hidden rounded-none">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Info size={18} className="text-primary" />
                            <h2 className="text-sm font-black tracking-wider text-slate-800">Especificações Técnicas</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-slate-100">
                            <div className="p-6 flex flex-col items-center text-center gap-2">
                                <Gauge size={20} className="text-slate-400" />
                                <span className="text-xs text-slate-500 font-semibold">Quilometragem</span>
                                <span className="font-bold text-slate-900">{vehicle.mileage?.toLocaleString()} KM</span>
                            </div>
                            <div className="p-6 flex flex-col items-center text-center gap-2">
                                <Fuel size={20} className="text-slate-400" />
                                <span className="text-xs text-slate-500 font-semibold">Combustível</span>
                                <span className="font-bold text-slate-900 capitalize">{vehicle.fuelType}</span>
                            </div>
                            <div className="p-6 flex flex-col items-center text-center gap-2">
                                <Users size={20} className="text-slate-400" />
                                <span className="text-xs text-slate-500 font-semibold">Lugares</span>
                                <span className="font-bold text-slate-900">{vehicle.seats} ADULTOS</span>
                            </div>
                            <div className="p-6 flex flex-col items-center text-center gap-2">
                                <Briefcase size={20} className="text-slate-400" />
                                <span className="text-xs text-slate-500 font-semibold">Bagagem (G/P)</span>
                                <span className="font-bold text-slate-900">{vehicle.luggageCapacity} / {vehicle.smallLuggageCapacity}</span>
                            </div>
                            <div className="p-6 flex flex-col items-center text-center gap-2 border-t border-slate-100 md:border-t-0 md:border-l">
                                <ClipboardCheck size={20} className="text-slate-400" />
                                <span className="text-xs text-slate-500 font-semibold">Transmissão</span>
                                <span className="font-bold text-slate-900 capitalize">{vehicle.transmission}</span>
                            </div>
                        </div>
                    </div>

                    {/* Detalhes do Motor e Identificação */}
                    <div className="bg-white border border-slate-100 shadow-sm p-6 space-y-6 rounded-none">
                        <h2 className="text-sm font-black tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
                            <Activity size={18} className="text-primary" />
                            Identificação & Desempenho
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <DocItem label="VIN (Chassi)" value={vehicle.vin} />
                            <DocItem label="Número do Motor" value={vehicle.engineNumber} />
                            <DocItem label="Cilindrada" value={vehicle.displacement} />
                            <DocItem label="Potência" value={vehicle.potency} />
                        </div>
                    </div>



                    {/* Extras */}
                    {vehicle.extrasList && vehicle.extrasList.length > 0 && (
                        <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-none mt-8">
                            <h2 className="text-sm font-black tracking-wider text-slate-800 mb-6 flex items-center gap-2">
                                <Plus size={18} className="text-primary" />
                                Extras & Serviços Incluídos
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicle.extrasList.map((extra: any) => (
                                    <div key={extra.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">{extra.name}</span>
                                            <span className="text-[10px] text-slate-400 capitalize">{extra.type?.replace('_', ' ') || 'Extra'}</span>
                                        </div>
                                        <Badge variant="outline" className="bg-white text-[10px] font-black rounded-none">
                                            {Number(extra.price) > 0 ? `${Number(extra.price).toLocaleString()} AOA` : 'Incluso'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Outros Veículos Associados */}
                    {relatedVehicles && relatedVehicles.length > 0 && (
                        <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-none mt-8">
                            <h2 className="text-sm font-black tracking-wider text-slate-800 mb-6 flex items-center gap-2">
                                <Car size={18} className="text-primary" />
                                Outros Veículos Associados
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {relatedVehicles.map((vehicle: any) => (
                                    <Link
                                        key={vehicle.id}
                                        href={`/admin/fleet/vehicles/${vehicle.id}`}
                                        className="group block"
                                    >
                                        <div className="border border-slate-100 rounded-none overflow-hidden hover:shadow-lg transition-all hover:border-primary/30">
                                            {/* Vehicle Image */}
                                            <div className="bg-slate-50 h-32 flex items-center justify-center overflow-hidden relative group-hover:bg-slate-100 transition-colors">
                                                {vehicle.image ? (
                                                    <img src={vehicle.image} alt={vehicle.model} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <Car size={48} className="text-slate-200" />
                                                )}
                                            </div>
                                            {/* Vehicle Info */}
                                            <div className="p-4 bg-white">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm text-slate-900">{vehicle.brand} {vehicle.model}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{vehicle.license_plate}</p>
                                                    </div>
                                                    <Badge variant={getStatusVariant(vehicle.status || "desconhecido") as any} className="text-[8px] font-bold rounded-none px-2 py-0.5 whitespace-nowrap">
                                                        {vehicle.status}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 text-xs">
                                                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Ano:</span> {vehicle.year}</p>
                                                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Lugares:</span> {vehicle.seats}</p>
                                                    {vehicle.memberName && (
                                                        <p className="text-slate-600"><span className="font-semibold text-slate-700">Condutor:</span> {vehicle.memberName}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Coluna Lateral: Manutenção e Documentos */}
                <div className="space-y-8">
                    {/* Manutenção */}
                    <div className="bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden rounded-none">
                        <Wrench size={100} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
                        <h2 className="text-xs font-black tracking-widest text-white/50 mb-6">Manutenção Próxima</h2>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-white/40 mb-1">Última Revisão</p>
                                <p className="text-lg font-bold">{vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString() : "Sem registo"}</p>
                            </div>
                            <div className="bg-white/10 p-4 border-l-2 border-primary">
                                <p className="text-[10px] font-bold text-white/60 mb-1">Próxima Revisão Agendada</p>
                                <p className="text-xl font-black text-primary">{vehicle.nextService ? new Date(vehicle.nextService).toLocaleDateString() : "Não agendada"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Documentação */}
                    <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-none">
                        <div className="flex items-center gap-2 mb-6">
                            <FileText size={18} className="text-primary" />
                            <h2 className="text-sm font-black tracking-wider text-slate-800">Documentação</h2>
                        </div>
                        <div className="space-y-4">
                            <DocItem label="Seguradora" value={vehicle.insuranceCompany} />
                            <DocItem label="Apólice de Seguro" value={vehicle.insurancePolicy} />
                            <DocItem label="Validade do Seguro" value={vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : null} />
                            <hr className="border-slate-50" />
                            <DocItem label="Última Inspeção" value={vehicle.inspectionLast ? new Date(vehicle.inspectionLast).toLocaleDateString() : null} />
                            <DocItem label="Próxima Inspeção" value={vehicle.inspectionExpiry ? new Date(vehicle.inspectionExpiry).toLocaleDateString() : null} />
                        </div>
                    </div>

                    {/* Assigned Member */}
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-none">
                        <h2 className="text-[10px] font-black tracking-widest text-slate-400 mb-4">Membro Atribuído</h2>
                        {vehicle.memberName ? (
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center text-white font-black text-xl">
                                    {vehicle.memberName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{vehicle.memberName}</p>
                                    <p className="text-xs text-slate-500 font-bold tracking-widest">Membro Ativo</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 font-bold tracking-widest">Nenhum membro atribuído de momento.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureTag({ active, label }: { active?: boolean; label: string }) {
    return (
        <div className={`px-4 py-2 border flex items-center gap-2 text-[10px] font-black tracking-widest transition-all rounded-none uppercase ${active ? "bg-primary/5 border-primary/20 text-primary" : "bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-50"}`}>
            {active ? <Check size={14} /> : <X size={14} />}
            <span>{label}</span>
        </div>
    );
}

function DocItem({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 mb-0.5">{label}</span>
            <span className="text-sm font-bold text-slate-700">{value || "---"}</span>
        </div>
    );
}
