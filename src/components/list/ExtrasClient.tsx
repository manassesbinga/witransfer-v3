/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit, Tag, Trash2 } from "lucide-react";
import { deleteExtraAction, getExtrasAction } from "@/actions/private/catalog/actions";
import { toast } from "sonner";
import { DeleteConfirmation } from "@/components/modal/delete-confirmation";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { Loader2 } from "lucide-react";
import { globalDataCache } from "@/lib/data-cache";

interface ExtrasClientProps {
    initialExtras: any[];
    currentUser: any;
}

export default function ExtrasClient({ initialExtras, currentUser }: ExtrasClientProps) {
    const router = useRouter();
    const { data: extras, loading: isPageLoading, hasMore, loadMore } = usePaginatedQuery<any>({
        key: "extras-catalog",
        fetchAction: (page, limit) => getExtrasAction(page, limit),
        limit: 12,
        initialData: initialExtras,
        tags: ["extras"]
    });

    const [deleting, setDeleting] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);

    const isReadOnly = currentUser?.role === "DRIVER" || currentUser?.subRole === "driver" || currentUser?.subRole === "motorista";
    const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(currentUser?.role || "");

    // Check if the current user can manage a specific item
    const canUserManage = (itemPartnerId: string | null) => {
        if (isSystemAdmin) return true;
        if (!currentUser?.partnerId) return false;
        return itemPartnerId === currentUser.partnerId;
    };

    const handleDeleteClick = (id: string, name: string) => {
        setItemToDelete({ id, name });
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setDeleting(itemToDelete.id);
        try {
            const res = await deleteExtraAction(itemToDelete.id);
            if (res.success) {
                toast.success("Item eliminado com sucesso");
                // Sync with cache
                const cached = globalDataCache.get<any>("extras-catalog");
                if (cached) {
                    globalDataCache.set("extras-catalog", cached.filter(e => e.id !== itemToDelete.id), ["extras"]);
                }
                setItemToDelete(null);
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao eliminar item");
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Extras & Complementos</h1>
                    <p className="text-slate-500 mt-1 font-medium">Gerencie os itens adicionais e funcionalidades dos veículos.</p>
                </div>
                {!isReadOnly && (
                    <Button
                        onClick={() => router.push("/categories/extras/new")}
                        className="bg-primary text-white flex items-center gap-2 px-8 h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-none"
                    >
                        <Plus size={18} />
                        Novo Extra
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {extras.length === 0 && !isPageLoading ? (
                    <div className="col-span-full py-20 bg-white border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-slate-50 mb-6 rounded-none">
                            <Package className="w-12 h-12 text-slate-300" />
                        </div>
                        <p className="text-slate-900 font-black text-lg uppercase tracking-tight">Nenhum extra encontrado</p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Comece adicionando itens como GPS, Cadeiras de Bebé ou Wi-Fi</p>
                    </div>
                ) : (
                    <>
                        {extras.map((item) => (
                            <Card key={item.id || Math.random()} className="group border border-slate-100 shadow-sm hover:border-amber-200 transition-all duration-300 bg-white h-full rounded-none">
                                <CardHeader className="pb-4 p-8">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                            <Package size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            {!isReadOnly && canUserManage(item.partnerId) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors rounded-none"
                                                    onClick={() => router.push(`/categories/extras/${item.id}`)}
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                            )}
                                            {canUserManage(item.partnerId) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-none"
                                                    onClick={() => handleDeleteClick(item.id, item.name)}
                                                    disabled={deleting === item.id}
                                                >
                                                    {deleting === item.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent animate-spin rounded-full" /> : <Trash2 size={18} />}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-6 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-xl font-black text-slate-900 leading-none tracking-tight">{item.name || "Sem Nome"}</CardTitle>
                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-400 py-0 h-5 rounded-none">
                                                {item.type === 'vehicle_feature' ? 'Feature' : 'Extra'}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-xs text-slate-400 line-clamp-2 font-bold uppercase tracking-widest">
                                            {item.description || "Nenhuma descrição fornecida"}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-8 pb-8 pt-0">
                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Tag size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{item.type || "-"}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-lg font-black text-emerald-600 tracking-tight">
                                                {item.price > 0 ? `${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price)}` : "GRÁTIS"}
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
                                    ) : "CARREGAR MAIS EXTRAS"}
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
                title="Eliminar Extra"
                description="Esta ação removerá permanentemente este item adicional do catálogo."
                itemName={itemToDelete?.name || ""}
                itemLabel="Item Adicional"
                icon={Package}
            />
        </div>
    );
}
