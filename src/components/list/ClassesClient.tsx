/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Layers, Edit, DollarSign, Trash2, MapPin, Calendar } from "lucide-react";
import { deleteCategoryAction, getCategoriesAction } from "@/actions/private/catalog/actions";
import { toast } from "sonner";
import { DeleteConfirmation } from "@/components/modal/delete-confirmation";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { Loader2 } from "lucide-react";
import { globalDataCache } from "@/lib/data-cache";

interface ClassesClientProps {
    initialClasses: any[];
}

export default function ClassesClient({ initialClasses }: ClassesClientProps) {
    const router = useRouter();
    const { data: classes, loading: isPageLoading, hasMore, loadMore } = usePaginatedQuery<any>({
        key: "vehicle-classes-catalog",
        fetchAction: (page, limit) => getCategoriesAction(page, limit),
        limit: 12,
        initialData: initialClasses,
        tags: ["classes"]
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
            const res = await deleteCategoryAction(itemToDelete.id);
            if (res.success) {
                toast.success("Classe eliminada com sucesso");
                const cached = globalDataCache.get<any>("vehicle-classes-catalog");
                if (cached) {
                    globalDataCache.set("vehicle-classes-catalog", cached.filter(c => c.id !== itemToDelete.id), ["classes"]);
                }
                setItemToDelete(null);
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao eliminar classe");
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Classes de Veículos</h1>
                    <p className="text-slate-500 mt-1 font-medium">Gerencie os segmentos e categorias da frota.</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/categories/classes/new")}
                    className="bg-primary text-white rounded-none flex items-center gap-2 px-8 h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                    <Plus size={18} />
                    Nova Classe
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(classes.length === 0 && !isPageLoading) ? (
                    <div className="col-span-full py-20 bg-white border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-slate-50 mb-6 rounded-none">
                            <Layers className="w-12 h-12 text-slate-300" />
                        </div>
                        <p className="text-slate-900 font-black text-lg uppercase tracking-tight">Nenhuma classe encontrada</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Comece adicionando classes como Económico, SUV ou Van</p>
                    </div>
                ) : (
                    <>
                        {classes.map((item) => (
                            <Card key={item.id} className="group border border-slate-100 shadow-sm hover:border-primary/50 transition-all duration-300 bg-white h-full rounded-none">
                                <CardHeader className="pb-4 p-8">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Layers size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors rounded-none"
                                                onClick={() => router.push(`/admin/categories/classes/${item.id}`)}
                                            >
                                                <Edit size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-none"
                                                onClick={() => handleDeleteClick(item.id, item.name)}
                                                disabled={deleting === item.id}
                                            >
                                                {deleting === item.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent animate-spin rounded-full" /> : <Trash2 size={18} />}
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
                                <CardContent className="px-8 pb-8 pt-0">
                                    <div className="pt-6 border-t border-slate-50 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <MapPin size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Transfer</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-900 tracking-tight">
                                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.servicePrices?.Transfer || 0)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Aluguer</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-900 tracking-tight">
                                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.servicePrices?.Aluguer || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

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
                                    ) : "CARREGAR MAIS CLASSES"}
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
                title="Eliminar Classe"
                description="Esta ação removerá permanentemente esta classe de veículo do catálogo."
                itemName={itemToDelete?.name || ""}
                itemLabel="Classe de Veículo"
                icon={Layers}
            />
        </div>
    );
}
