"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveCategoryAction, getServiceCategoriesAction, saveClassPricesAction } from "@/actions/private/catalog/actions";
import { ChevronLeft, Car, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

export default function NewClassPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [form, setForm] = useState({
        name: "",
        description: "",
        icon: "Car", // Default icon
    });

    // Keys are serviceId, values are { price: number, minPrice: number }
    const [servicePrices, setServicePrices] = useState<Record<string, any>>({});

    useEffect(() => {
        async function loadServices() {
            try {
                const res = await getServiceCategoriesAction();
                if (res.success && Array.isArray(res.data)) {
                    setServices(res.data);
                    // Initialize prices state
                    const initialPrices: Record<string, any> = {};
                    res.data.forEach((s: any) => {
                        initialPrices[s.id] = { price: 0, minPrice: 0 };
                    });
                    setServicePrices(initialPrices);
                }
            } catch (error) {
                console.error("Erro ao carregar serviços:", error);
            }
        }
        loadServices();
    }, []);

    const handlePriceChange = (serviceId: string, field: string, value: number) => {
        setServicePrices(prev => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Salvar a Classe
            const resClass = await saveCategoryAction(form);
            if (!resClass.success) throw new Error(resClass.error || "Erro ao criar classe.");

            const classId = resClass.data?.id;
            if (!classId) throw new Error("ID da classe não retornado.");

            // 2. Preparar preços para todos os serviços
            const pricesToSave = Object.entries(servicePrices).map(([serviceId, values]) => ({
                serviceId,
                price: values.price,
                minPrice: values.minPrice
            }));

            if (pricesToSave.length > 0) {
                const resPrices = await saveClassPricesAction(classId, pricesToSave);
                if (!resPrices.success) toast.warning("Classe criada, mas erro ao salvar preços.");
            }

            toast.success("Classe e tarifas configuradas com sucesso!");
            router.push("/admin/categories/classes");
            router.refresh();

        } catch (error: any) {
            toast.error(error.message || "Erro de comunicação com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/admin/categories/classes">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nova Classe de Veículo</h1>
                    <p className="text-slate-500 text-sm font-medium">Configure um novo segmento e seus valores base.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 font-bold">
                                <Car className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black text-slate-800">Especificações da Classe</CardTitle>
                                <CardDescription className="text-[10px] font-bold tracking-widest text-slate-400">Segmentação de veículos</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Nome da Classe *</Label>
                                <Input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="ex: Económico, Executivo, Van, Luxo"
                                    className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4 font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Descrição</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="ex: Veículos eficientes para o dia-a-dia"
                                className="rounded-xl bg-slate-50 border-slate-100 min-h-[100px] px-4 py-3"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-400 tracking-widest ml-1">Tarifas por Serviço</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <Card key={service.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                            {service.name === 'Transfer' ? <MapPin className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-black text-slate-800">{service.name}</CardTitle>
                                            <p className="text-[10px] text-slate-400 font-bold tracking-tighter">Cobrança: {service.billingType}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Preço Base (Kz)</Label>
                                        <Input
                                            type="number"
                                            value={servicePrices[service.id]?.price || 0}
                                            onChange={(e) => handlePriceChange(service.id, 'price', Number(e.target.value))}
                                            className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Preço Mínimo (Kz)</Label>
                                        <Input
                                            type="number"
                                            value={servicePrices[service.id]?.minPrice || 0}
                                            onChange={(e) => handlePriceChange(service.id, 'minPrice', Number(e.target.value))}
                                            className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4 font-bold"
                                        />
                                        <p className="text-[9px] text-slate-400 font-medium ml-1">Valor mínimo que o cliente pagará pelo serviço.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="ghost"
                        asChild
                        className="rounded-xl font-bold text-slate-400 h-12 px-6"
                    >
                        <Link href="/admin/categories/classes">Cancelar</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl font-black tracking-widest text-[11px] px-10 h-12 shadow-lg shadow-primary/20"
                    >
                        {loading ? "Criando..." : "Criar Classe e Tarifas"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
