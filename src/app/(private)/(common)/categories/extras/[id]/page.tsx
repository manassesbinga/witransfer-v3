"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
import { saveExtraAction, getExtrasAction } from "@/actions/private/catalog/actions";
import { ChevronLeft, Edit, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditExtraPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [form, setForm] = useState({
        id: "",
        name: "",
        description: "",
        price: 0,
        type: "vehicle_feature",
    });

    useEffect(() => {
        const fetchExtra = async () => {
            try {
                const res = await getExtrasAction();
                if (res.success && Array.isArray(res.data)) {
                    const extra = res.data.find((e: any) => e.id === id);
                    if (extra) {
                        setForm({
                            id: extra.id,
                            name: extra.name || "",
                            description: extra.description || "",
                            price: extra.price || 0,
                            type: extra.type || "vehicle_feature",
                        });
                    } else {
                        toast.error("Extra não encontrado.");
                        router.push("/categories/extras");
                    }
                } else {
                    toast.error("Erro ao carregar dados.");
                }
            } catch (error) {
                toast.error("Erro de conexão.");
            } finally {
                setFetching(false);
            }
        };
        if (id) fetchExtra();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userRes = await (await import("@/actions/private/auth/actions")).getCurrentUserAction();
            const currentPartnerId = userRes.success ? userRes.data?.partnerId : null;

            const res = await saveExtraAction({
                ...form,
                partnerId: currentPartnerId
            });
            if (res.success) {
                toast.success("Extra atualizado com sucesso!");
                router.push("/categories/extras");
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao salvar extra.");
            }
        } catch (error) {
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            setLoading(false);
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
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/categories/extras">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Editar Extra</h1>
                    <p className="text-slate-500 text-sm font-medium">Atualize os detalhes do item opcional.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 font-bold">
                            <Edit className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black text-slate-800">Detalhes do Extra</CardTitle>
                            <CardDescription className="text-[10px] font-bold tracking-widest text-slate-400">ID: {id}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Nome do Extra *</Label>
                            <Input
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="ex: Cadeira de Bebé, GPS"
                                className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4 font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Descrição</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="ex: Assento seguro para crianças até 3 anos"
                                className="rounded-xl bg-slate-50 border-slate-100 min-h-[100px] px-4 py-3"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Preço (Kz) *</Label>
                                <Input
                                    type="number"
                                    required
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                    className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4 font-black text-emerald-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Tipo *</Label>
                                <Select
                                    required
                                    value={form.type}
                                    onValueChange={(v) => setForm({ ...form, type: v })}
                                >
                                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="vehicle_feature">Equipamento do Veículo</SelectItem>
                                        <SelectItem value="service_extra">Serviço Adicional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="ghost"
                                asChild
                                className="rounded-xl font-bold text-slate-400 h-12 px-6"
                            >
                                <Link href="/categories/extras">Cancelar</Link>
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
