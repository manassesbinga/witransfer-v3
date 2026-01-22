/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Edit, Clock, Calendar, MapPin, DollarSign, Trash2 } from "lucide-react";
import { deleteServiceCategoryAction, getServiceCategoriesAction } from "@/actions/private/catalog/actions";
import { toast } from "sonner";
import { DeleteConfirmation } from "@/components/modal/delete-confirmation";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { Loader2 } from "lucide-react";
import { globalDataCache } from "@/lib/data-cache";

interface ServicesClientProps {
    initialServices: any[];
}

const billingTypeLabels: Record<string, string> = {
    fixed: "Preço Fixo",
    per_km: "Por Quilómetro",
    per_day: "Por Dia",
    per_hour: "Por Hora",
};

const billingTypeIcons: Record<string, any> = {
    fixed: DollarSign,
    per_km: MapPin,
    per_day: Calendar,
    per_hour: Clock,
};

export default function ServicesClient({ initialServices }: ServicesClientProps) {
    const router = useRouter();
    const { data: services, loading: isPageLoading, hasMore, loadMore } = usePaginatedQuery<any>({
        key: "services-catalog",
        fetchAction: (page, limit) => getServiceCategoriesAction(page, limit),
        limit: 12,
        initialData: initialServices,
        tags: ["services"]
    });

    const [deleting, setDeleting] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);

    const handleDeleteClick = (id: string, name: string) => {
        setItemToDelete({ id, name });
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setDeleting(itemToDelete.id);
        try {
            const res = await deleteServiceCategoryAction(itemToDelete.id);
            if (res.success) {
                toast.success("Serviço eliminado com sucesso");
                const cached = globalDataCache.get<any>("services-catalog");
                if (cached) {
                    globalDataCache.set("services-catalog", cached.filter(s => s.id !== itemToDelete.id), ["services"]);
                }
                setItemToDelete(null);
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao eliminar serviço");
            }
        } catch (error: any) {
            toast.error(error.message || "Erro inesperado");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categorias de Serviços</h1>
                    <p className="text-slate-500 mt-1 font-medium">Defina as lógicas de cobrança dos serviços oferecidos.</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/categories/services/new")}
                    className="bg-primary text-white rounded-none flex items-center gap-2 px-8 h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                    <Plus size={18} />
                    Novo Serviço
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(services.length === 0 && !isPageLoading) ? (
                    <div className="col-span-full py-20 bg-white border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-slate-50 mb-6 rounded-none">
                            <Briefcase className="w-12 h-12 text-slate-300" />
                        </div>
                        <p className="text-slate-900 font-black text-lg uppercase tracking-tight">Nenhum serviço encontrado</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Comece adicionando serviços como Transfer ou À Disposição</p>
                    </div>
                ) : (
                    <>
                        {services.map((item) => {
                            const BillingIcon = billingTypeIcons[item.billingType] || DollarSign;
                            return (
                                <Card
                                    key={item.id}
                                    className="group border border-slate-100 shadow-sm hover:border-emerald-200 transition-all duration-300 bg-white h-full rounded-none"
                                >
                                    <CardHeader className="pb-4 p-8">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {item.isActive ? (
                                                    <Badge className="bg-emerald-100/50 text-emerald-700 border-emerald-200 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-none shadow-none">ATIVO</Badge>
                                                ) : (
                                                    <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-none shadow-none">INATIVO</Badge>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-none"
                                                    onClick={() => router.push(`/admin/categories/services/${item.id}`)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-none"
                                                    onClick={() => handleDeleteClick(item.id, item.name)}
                                                    disabled={deleting === item.id}
                                                >
                                                    {deleting === item.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent animate-spin rounded-full" /> : <Trash2 size={16} />}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-6 space-y-2">
                                            <CardTitle className="text-xl font-black text-slate-900 leading-none tracking-tight">{item.name || "Sem Nome"}</CardTitle>
                                            <CardDescription className="text-xs text-slate-400 line-clamp-2 font-bold uppercase tracking-widest">
                                                {item.description || "Nenhuma descrição fornecida"}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8 pt-0 space-y-4">
                                        <div className="pt-6 border-t border-slate-50">
                                            <div className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100/50 hover:bg-emerald-50/30 transition-colors">
                                                <div className="p-2 bg-white shadow-sm text-emerald-600 border border-slate-100">
                                                    <BillingIcon size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-tight mb-1">Tipo de Cobrança</p>
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{billingTypeLabels[item.billingType] || item.billingType}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {hasMore && (
                            <div className="col-span-full py-10 flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => loadMore()}
                                    disabled={isPageLoading}
                                    className="h-14 px-12 border-2 border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white font-black uppercase tracking-widest text-xs transition-all rounded-none"
                                >
                                    {isPageLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            A CARREGAR...
                                        </>
                                    ) : "CARREGAR MAIS SERVIÇOS"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <DeleteConfirmation
                open={!!itemToDelete}
                onOpenChange={(open) => !open && setItemToDelete(null)}
                onConfirm={confirmDelete}
                isDeleting={!!deleting}
                title="Eliminar Serviço"
                description="Esta ação removerá permanentemente esta categoria de serviço do sistema."
                itemName={itemToDelete?.name || ""}
                itemLabel="Categoria de Serviço"
                icon={Briefcase}
            />
        </div>
    );
}
