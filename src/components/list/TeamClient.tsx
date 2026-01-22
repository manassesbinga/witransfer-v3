/** @format */

"use client";

import React, { useState, useMemo } from "react";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { getTeamMembersAction } from "@/actions/private/team/actions";
import { globalDataCache } from "@/lib/data-cache";
import {
    Plus,
    Users,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Star,
    Calendar,
    Phone,
    LayoutGrid,
    List,
    X,
    User,
    CheckCircle
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { deleteTeamMemberAction } from "@/actions/private/team/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DeleteConfirmation } from "@/components/modal/delete-confirmation";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    sub_role?: string;
    role?: string;
    status?: string;
    telefone?: string;
    phone?: string;
    vehicleModel?: string;
    fotoPerfil?: string;
    nif?: string;
    documentNumber?: string;
}

interface TeamListProps {
    members: TeamMember[];
    viewMode: "grid" | "list";
    cols: {
        role: boolean;
        contact: boolean;
        vehicle: boolean;
    };
    basePath: string;
    onDelete: (id: string, name: string) => void;
}

function TeamList({ members, viewMode, cols, basePath, onDelete }: TeamListProps) {
    const router = useRouter();

    if (members.length === 0) {
        return (
            <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-slate-50 mb-4">
                    <Users className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold text-lg">Nenhum membro encontrado.</p>
                <p className="text-slate-400 text-sm max-w-xs">Tente ajustar os filtros de pesquisa para encontrar o que procura.</p>
            </div>
        );
    }

    if (viewMode === "list") {
        return (
            <div className="bg-white shadow-sm border border-gray-100 overflow-hidden mb-6 rounded-none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="from-gray-50 to-gray-100 border-b border-gray-200 bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400 uppercase">Membro</th>
                                {cols.role && <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400 uppercase hidden sm:table-cell">Cargo</th>}
                                {cols.contact && <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400 uppercase hidden md:table-cell">Contacto</th>}
                                {cols.vehicle && <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400 uppercase hidden lg:table-cell">Veículo</th>}
                                <th className="px-6 py-4 text-right text-[10px] font-black tracking-wider text-slate-400 uppercase pr-10">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {members.map((member) => (
                                <tr key={member.id} onClick={() => router.push(`${basePath}/${member.id}`)} className="hover:bg-blue-50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            {member.fotoPerfil ? (
                                                <div className="w-10 h-10 rounded-none overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                                                    <img src={member.fotoPerfil} alt={member.name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-slate-100 rounded-none flex items-center justify-center font-black text-slate-400 border border-slate-100 flex-shrink-0">
                                                    {member.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-[11px] leading-tight">{member.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {cols.role && (
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <Badge variant="outline" className="rounded-none border-slate-100 text-[9px] font-black tracking-widest text-[#0069B8] bg-blue-50/20 uppercase">
                                                {member.sub_role === 'attendant' ? 'Atendente' :
                                                    member.sub_role === 'finance_manager' ? 'Gestor Financeiro' :
                                                        member.sub_role === 'manager' ? 'Gestor da Conta' :
                                                            member.sub_role === 'driver' || member.role === 'DRIVER' ? 'Motorista' :
                                                                member.sub_role || member.role}
                                            </Badge>
                                        </td>
                                    )}
                                    {cols.contact && (
                                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Phone className="w-3 h-3" />
                                                <span className="text-xs font-bold">{member.telefone || member.phone || "---"}</span>
                                            </div>
                                        </td>
                                    )}
                                    {cols.vehicle && (
                                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                            <span className="text-xs font-bold text-slate-600">{member.vehicleModel || "---"}</span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap pr-10" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Ocultar botões se for ADMIN ou PARTNER_ADMIN */}
                                            {!(member.role === 'ADMIN' || member.role === 'SUPER_ADMIN' || member.role === 'PARTNER_ADMIN') ? (
                                                <>
                                                    <Link href={`${basePath}/${member.id}/edit`} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-none transition-colors" title="Editar">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button onClick={() => onDelete(member.id, member.name)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-none transition-colors" title="Eliminar">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <Badge variant="outline" className="text-[8px] opacity-30 uppercase font-black tracking-tighter rounded-none">Bloqueado</Badge>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {members.map((member) => (
                <div key={member.id} onClick={() => router.push(`${basePath}/${member.id}`)} className="bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group rounded-none cursor-pointer">
                    <div className="relative h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {member.fotoPerfil ? (
                            <img src={member.fotoPerfil} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <User size={64} className="text-slate-200 group-hover:scale-110 transition-transform duration-300" />
                        )}

                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-4 py-2 shadow-md rounded-none">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cargo</p>
                            <p className="font-bold text-gray-900 text-xs">
                                {member.sub_role === 'attendant' ? 'Atendente' :
                                    member.sub_role === 'finance_manager' ? 'Gestor Financeiro' :
                                        member.sub_role === 'manager' ? 'Gestor da Conta' :
                                            member.sub_role === 'driver' || member.role === 'DRIVER' ? 'Motorista' :
                                                member.sub_role || member.role}
                            </p>
                        </div>
                    </div>

                    <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 tracking-tight">{member.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 truncate">{member.email}</p>

                        <div className="grid grid-cols-1 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-[11px]">
                                <div className="bg-blue-50 p-1.5 rounded-none">
                                    <Phone size={14} className="text-blue-600" />
                                </div>
                                <span className="text-slate-600 font-bold">{member.telefone || member.phone || "---"}</span>
                            </div>
                        </div>

                        {member.vehicleModel && (
                            <div className="bg-slate-50 p-3 mb-4 border border-slate-100 rounded-none">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Veículo Atribuído</p>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <div className="w-7 h-7 bg-slate-200 rounded-none flex items-center justify-center text-slate-600 font-black text-[10px]">
                                        {member.vehicleModel.charAt(0)}
                                    </div>
                                    {member.vehicleModel}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {!(member.role === 'ADMIN' || member.role === 'SUPER_ADMIN' || member.role === 'PARTNER_ADMIN') && (
                                <>
                                    <Link href={`${basePath}/${member.id}/edit`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-xs font-bold rounded-none shadow-sm">
                                        <Edit size={16} /> Editar
                                    </Link>
                                    <button onClick={() => onDelete(member.id, member.name)} className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-xs font-bold rounded-none" title="Eliminar">
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}
                            {/* O clique no card já leva ao perfil */}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}


export default function TeamClient({ initialTeam }: { initialTeam: any[] }) {
    const router = useRouter();
    const pathname = usePathname();

    const {
        data: members,
        loading,
        hasMore,
        loadMore,
        refresh
    } = usePaginatedQuery<TeamMember>({
        fetchAction: getTeamMembersAction,
        key: "team-members",
        initialData: initialTeam,
        limit: 50,
        tags: ["team"]
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [memberToDelete, setMemberToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [cols, setCols] = useState({
        role: true,
        contact: true,
        vehicle: true,
    });

    const filteredMembers = useMemo(() => {
        return members.filter(m =>
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.telefone?.includes(searchTerm) ||
            m.sub_role?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [members, searchTerm]);

    const handleDeleteClick = (id: string, name: string) => {
        setMemberToDelete({ id, name });
    };

    const confirmDelete = async () => {
        if (!memberToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteTeamMemberAction(memberToDelete.id);
            if (result.success) {
                toast.success("Membro removido com sucesso!");
                // Direct cache update for immediate UI response
                globalDataCache.invalidate("team-members");
                refresh();
                setMemberToDelete(null);
                router.refresh();
            }
        } catch (error) {
            toast.error("Erro ao remover membro.");
        } finally {
            setIsDeleting(false);
        }
    };

    const stats = useMemo(() => ({
        total: members.length,
        ativos: members.filter(m => m.status === 'online' || m.status === 'ocupado').length,
        disponiveis: members.filter(m => m.status === 'online').length,
        media: "4.8"
    }), [members]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                    { label: "Total Equipa", value: stats.total, icon: Users, color: "blue", desc: "Membros registados" },
                    { label: "Em Serviço", value: stats.ativos, icon: Calendar, color: "emerald", desc: "Operadores ativos agora" },
                    { label: "Disponíveis", value: stats.disponiveis, icon: CheckCircle, color: "amber", desc: "Prontos para serviço" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-none">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn(
                                "p-3",
                                stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                                    stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                                        stat.color === "amber" ? "bg-amber-50 text-amber-600" :
                                            "bg-slate-50 text-slate-600"
                            )}>
                                <stat.icon size={24} />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">{stat.value}</p>
                                <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase truncate">{stat.label}</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-[11px] font-medium">{stat.desc}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div />
                <div className="flex gap-3">
                    <Button onClick={() => router.push(`${pathname}/new`)} className="bg-primary hover:opacity-90 text-white rounded-none h-11 px-6 font-bold shadow-lg shadow-primary/10 text-xs">
                        <Plus size={18} className="mr-2" /> Novo Utilizador
                    </Button>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-100 p-6 mb-6 rounded-none">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-8 relative">
                        <Input
                            placeholder="Pesquisar por nome, email ou cargo..."
                            className="pl-4 pr-10 py-2.5 border-slate-200 focus:ring-2 focus:ring-blue-500 w-full text-xs rounded-none h-[42px] font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <div className="md:col-span-4 flex items-center justify-end gap-2">
                        <button onClick={() => setViewMode("list")} className={cn("p-2.5 transition-all rounded-none", viewMode === "list" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                            <List size={18} />
                        </button>
                        <button onClick={() => setViewMode("grid")} className={cn("p-2.5 transition-all rounded-none", viewMode === "grid" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <TeamList
                members={filteredMembers}
                viewMode={viewMode}
                cols={cols}
                basePath={pathname}
                onDelete={handleDeleteClick}
            />

            <DeleteConfirmation
                open={!!memberToDelete}
                onOpenChange={(open) => !open && setMemberToDelete(null)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                title="Eliminar Membro"
                description="Esta ação removerá permanentemente o acesso deste colaborador ao sistema."
                itemName={memberToDelete?.name || ""}
                itemLabel="Colaborador"
                icon={User}
            />

            {hasMore && (
                <div className="flex justify-center mt-8 mb-12">
                    <Button
                        onClick={() => loadMore()}
                        disabled={loading}
                        variant="outline"
                        className="min-w-[200px] h-12 rounded-none border-2 border-primary text-primary font-black text-[10px] tracking-[2px] hover:bg-primary hover:text-white transition-all group"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                                CARREGANDO...
                            </div>
                        ) : (
                            "CARREGAR MAIS"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
