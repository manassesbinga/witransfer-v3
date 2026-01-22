"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    saveCategoryAction,
    getCategoriesAction,
    getServiceCategoriesAction,
    getClassPricesAction,
    saveClassPricesAction
} from "@/actions/private/catalog/actions";
import { ChevronLeft, Car, MapPin, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [services, setServices] = useState<any[]>([]);

    const [form, setForm] = useState({
        id: "",
        name: "",
        description: "",
        icon: "",
    });

    // Keys are serviceId, values are { price: number }
    const [servicePrices, setServicePrices] = useState<Record<string, { price: number }>>({});

    useEffect(() => {
        async function loadData() {
            try {
                // Load Class Data
                const resClasses = await getCategoriesAction();
                if (resClasses.success && Array.isArray(resClasses.data)) {
                    const item = resClasses.data.find((c: any) => c.id === id);
                    if (item) {
                        setForm({
                            id: item.id,
                            name: item.name || "",
                            description: item.description || "",
                            icon: item.icon || "",
                        });
                    } else {
                        toast.error("Classe não encontrada.");
                        router.push("/admin/categories/classes");
                        return;
                    }
                }

                // Load Services and Prices together
                const resCombined = await getClassPricesAction(id);
                if (resCombined.success && Array.isArray(resCombined.data)) {
                    setServices(resCombined.data);

                    const pricesState: Record<string, { price: number }> = {};
                    resCombined.data.forEach((item: any) => {
                        pricesState[item.serviceId] = {
                            price: item.price || 0
                        };
                    });
                    setServicePrices(pricesState);
                }
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                toast.error("Erro ao carregar dados da classe.");
            } finally {
                setFetching(false);
            }
        }
        if (id) loadData();
    }, [id, router]);

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
            if (!resClass.success) throw new Error(resClass.error || "Erro ao atualizar classe.");

            // 2. Preparar preços para todos os serviços
            const pricesToSave = Object.entries(servicePrices).map(([serviceId, values]) => ({
                serviceId,
                price: values.price
            }));

            if (pricesToSave.length > 0) {
                const resPrices = await saveClassPricesAction(id, pricesToSave);
                if (!resPrices.success) toast.warning("Classe atualizada, mas erro ao salvar preços específicos.");
            }

            toast.success("Classe e tarifas atualizadas com sucesso!");
            router.push("/admin/categories/classes");
            router.refresh();

        } catch (error: any) {
            toast.error(error.message || "Erro de comunicação com o servidor.");
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
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/admin/categories/classes">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Editar Classe</h1>
                    <p className="text-slate-500 text-sm font-medium">Atualize os detalhes do segmento: <span className="text-primary font-bold">{form.name}</span></p>
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
                                <CardDescription className="text-[10px] font-bold tracking-widest text-slate-400">ID: {id}</CardDescription>
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
                                    onChange={(e) => setForm({ ...form, name: e.target.value, icon: "Car" })}
                                    className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4 font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Descrição</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="rounded-xl bg-slate-50 border-slate-100 min-h-[100px] px-4 py-3"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-400 tracking-widest ml-1">Tarifas por Serviço</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <Card key={service.id || service.serviceId} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                            {service.name === 'Transfer' || service.serviceName === 'Transfer' ? <MapPin className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-black text-slate-800">{service.serviceName || service.name}</CardTitle>
                                            <p className="text-[10px] text-slate-400 font-bold tracking-tighter">Cobrança: {service.billingType}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-slate-400 ml-1">Preço Base (Kz)</Label>
                                        <Input
                                            type="number"
                                            value={servicePrices[service.serviceId || service.id]?.price || 0}
                                            onChange={(e) => handlePriceChange(service.serviceId || service.id, 'price', Number(e.target.value))}
                                            className="rounded-xl bg-slate-50 border-slate-100 h-12 px-4 font-bold"
                                        />
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
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
