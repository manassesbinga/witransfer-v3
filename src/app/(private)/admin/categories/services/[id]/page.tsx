"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { saveServiceCategoryAction, getServiceCategoriesAction } from "@/actions/private/catalog/actions";
import { ChevronLeft, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditServicePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [form, setForm] = useState({
        id: "",
        name: "",
        description: "",
        billingType: "fixed",
        includedQuantity: 0,
        isActive: true,
    });

    useEffect(() => {
        async function loadData() {
            try {
                const res = await getServiceCategoriesAction();
                if (res.success && Array.isArray(res.data)) {
                    const service = res.data.find((s: any) => s.id === id);
                    if (service) {
                        setForm({
                            id: service.id,
                            name: service.name || "",
                            description: service.description || "",
                            billingType: service.billingType || "fixed",
                            includedQuantity: service.includedQuantity || 0,
                            isActive: service.isActive !== false,
                        });
                    } else {
                        toast.error("Serviço não encontrado.");
                        router.push("/admin/categories/services");
                    }
                } else {
                    toast.error("Erro ao carregar dados.");
                }
            } catch (error) {
                toast.error("Erro de conexão.");
            } finally {
                setFetching(false);
            }
        }
        if (id) loadData();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await saveServiceCategoryAction(form);
            if (res.success) {
                toast.success("Serviço atualizado com sucesso!");
                router.push("/admin/categories/services");
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao salvar serviço.");
            }
        } catch (error) {
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    const getQuantityLabel = () => {
        switch (form.billingType) {
            case "per_km": return "Kms Incluídos";
            case "per_day": return "Dias Incluídos";
            case "per_hour": return "Horas Incluídas";
            default: return "Quantidade Incluída";
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/admin/categories/services">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Editar Serviço</h1>
                    <p className="text-slate-500 text-sm font-medium">Atualize as especificações do serviço.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 font-bold">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black text-slate-800">Especificações do Serviço</CardTitle>
                            <CardDescription className="text-[10px] font-bold tracking-widest text-slate-400">Configuração de cobrança</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Tipo de Serviço *</Label>
                                <Select
                                    required
                                    value={form.name}
                                    onValueChange={(v) => {
                                        setForm({
                                            ...form,
                                            name: v,
                                            billingType: v === "Transfer" ? "per_km" : "per_day"
                                        });
                                    }}
                                >
                                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4 shadow-none">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="Transfer">Transfer</SelectItem>
                                        <SelectItem value="Rental">Rental / Aluguer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Tipo de Cobrança *</Label>
                                <Select
                                    required
                                    value={form.billingType}
                                    onValueChange={(v) => setForm({ ...form, billingType: v })}
                                >
                                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="fixed">Preço Fixo</SelectItem>
                                        <SelectItem value="per_km">Por Quilómetro</SelectItem>
                                        <SelectItem value="per_day">Por Dia</SelectItem>
                                        <SelectItem value="per_hour">Por Hora</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">{getQuantityLabel()} *</Label>
                                <Input
                                    type="number"
                                    required
                                    min={0}
                                    value={form.includedQuantity}
                                    onChange={(e) => setForm({ ...form, includedQuantity: Number(e.target.value) })}
                                    placeholder="ex: 50"
                                    className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4"
                                />
                                <p className="text-[10px] text-slate-400 font-medium px-1">Quantidade base incluída na tarifa inicial.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Status</Label>
                                <Select
                                    required
                                    value={form.isActive ? "true" : "false"}
                                    onValueChange={(v) => setForm({ ...form, isActive: v === "true" })}
                                >
                                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="true">Ativo</SelectItem>
                                        <SelectItem value="false">Inativo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Descrição</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="ex: Viagem de ponto A para ponto B com motorista"
                                className="rounded-xl bg-slate-50 border-slate-100 h-12 min-h-[48px] px-4 py-3"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="ghost"
                                asChild
                                className="rounded-xl font-bold text-slate-400 h-12 px-6"
                            >
                                <Link href="/admin/categories/services">Cancelar</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl font-black tracking-widest text-[11px] px-10 h-12 shadow-lg shadow-primary/20"
                            >
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
