"use client";

import { useState } from "react";
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
import { saveExtraAction } from "@/actions/private/catalog/actions";
import { ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function NewExtraPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: 0,
        type: "vehicle_feature",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Fetch current user again to be sure of partner context
            const userRes = await (await import("@/actions/private/auth/actions")).getCurrentUserAction();
            const partnerId = userRes.success ? userRes.data?.partnerId : null;

            const res = await saveExtraAction({
                ...form,
                partnerId: partnerId
            });
            if (res.success) {
                toast.success("Extra salvo com sucesso!");
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

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/categories/extras">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Novo Extra</h1>
                    <p className="text-slate-500 text-sm font-medium">Adicione opcionais para reservas.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 font-bold">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black text-slate-800">Detalhes do Extra</CardTitle>
                            <CardDescription className="text-[10px] font-bold tracking-widest text-slate-400">Preços e categorias</CardDescription>
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
                                className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4"
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
                                {loading ? "Salvando..." : "Salvar Extra"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
