/** @format */

"use client";

import React, { useState, useMemo } from "react";
import {
    Plus,
    Car,
    TrendingUp,
    AlertTriangle,
    Settings,
    LayoutGrid,
    List,
    X,
    Edit,
    Users,
    Gauge,
    Check,
    Filter,
    Trash2,
    Building2,
    AlertCircle,
    Loader2
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { deleteCarAction, getCarsAction } from "@/actions/private/cars/actions";
import { useNotification } from "@/hooks/use-notification";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { globalDataCache } from "@/lib/data-cache";
import { DeleteConfirmation } from "@/components/modal/delete-confirmation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle, VehicleStatus } from "@/app/(private)/(common)/fleet/vehicles/page";

interface VehiclesListProps {
    vehicles: Vehicle[]
    viewMode: "grid" | "list"
    cols?: {
        member?: boolean
        places?: boolean
        partner?: boolean
        status?: boolean
    }
    basePath: string
    currentUser: any
    onDeleteSuccess: (id: string) => void
}

function VehiclesList({
    vehicles,
    viewMode,
    cols = { member: true, places: true, partner: true, status: true },
    basePath,
    currentUser,
    onDeleteSuccess
}: VehiclesListProps) {
    const router = useRouter()
    const { sucesso, erro } = useNotification();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<{ id: string, plate: string } | null>(null);

    const isAllowedToDelete = (currentUser?.role === "PARTNER_ADMIN" || currentUser?.subRole === "attendant") && currentUser?.subRole !== "manager";
    const isReadOnly = currentUser?.role === "DRIVER" || currentUser?.subRole === "driver" || currentUser?.subRole === "motorista";

    const confirmDelete = async () => {
        if (!vehicleToDelete) return;

        const { id, plate } = vehicleToDelete;
        setDeletingId(id);
        setVehicleToDelete(null);

        try {
            const res = await deleteCarAction(id);
            if (res.success) {
                sucesso(`Veículo ${plate} eliminado com sucesso!`);
                onDeleteSuccess(id);
                router.refresh();
            } else {
                erro(res.error || "Erro ao eliminar veículo.");
            }
        } catch (error: any) {
            erro(error.message || "Erro inesperado ao eliminar veículo.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteClick = (id: string, plate: string) => {
        setVehicleToDelete({ id, plate });
    };

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case "ativa":
                return "success"
            case "inativa":
                return "destructive"
            case "manutencao":
                return "warning"
            case "inspecao":
                return "info"
            default:
                return "default"
        }
    }

    if (vehicles.length === 0) {
        return (
            <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-slate-50 mb-4">
                    <Car className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold text-lg">Nenhum veículo encontrado.</p>
                <p className="text-slate-400 text-sm max-w-xs">Tente ajustar os filtros de pesquisa para encontrar o que procura.</p>
            </div>
        )
    }

    const content = viewMode === "list" ? (
        <div className="bg-white shadow-sm border border-gray-100 overflow-hidden mb-6 rounded-none">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400">
                                Matrícula
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400">
                                Veículo
                            </th>
                            {cols.member && (
                                <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400">
                                    Membro da Equipa
                                </th>
                            )}
                            {cols.places && (
                                <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400">
                                    Lugares
                                </th>
                            )}
                            {cols.partner && (
                                <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400">
                                    Empresa
                                </th>
                            )}
                            {cols.status && (
                                <th className="px-6 py-4 text-left text-[10px] font-black tracking-wider text-slate-400">
                                    Estado
                                </th>
                            )}
                            <th className="px-6 py-4 text-center text-[10px] font-black tracking-wider text-slate-400">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {vehicles.map((vehicle, index) => (
                            <tr
                                key={vehicle.id}
                                onClick={() => router.push(`${basePath}/${vehicle.id}`)}
                                className="hover:bg-blue-50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        {vehicle.image ? (
                                            <div className="w-10 h-10 rounded-none overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                                                <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className={`${[
                                                "bg-blue-50 text-blue-500",
                                                "bg-sky-50 text-sky-500",
                                                "bg-indigo-50 text-indigo-500",
                                                "bg-cyan-50 text-cyan-500",
                                                "bg-blue-100 text-blue-600"
                                            ][index % 5]} w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-none shadow-sm`}>
                                                <Car size={16} />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-900 border-none text-[11px] leading-tight">
                                                {vehicle.licensePlate}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">{vehicle.year}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <p className="font-bold text-slate-800 text-[11px] leading-tight">
                                            {vehicle.model}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {vehicle.brand} • {vehicle.color}
                                        </p>
                                    </div>
                                </td>
                                {cols.member && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {vehicle.memberName ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-none bg-blue-600 flex items-center justify-center text-white text-[9px] font-black shadow-sm flex-shrink-0">
                                                    {vehicle.memberName.charAt(0)}
                                                </div>
                                                <span className="text-slate-700 font-bold truncate max-w-[120px] text-[11px]">
                                                    {vehicle.memberName}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                                                Não atribuído
                                            </span>
                                        )}
                                    </td>
                                )}
                                {cols.places && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-[11px] text-slate-600 font-bold">
                                            {vehicle.seats} lugares
                                        </span>
                                    </td>
                                )}
                                {cols.partner && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-[11px] text-slate-600 font-bold tracking-tight">
                                            {vehicle.partnerName || "WiTransfer"}
                                        </span>
                                    </td>
                                )}
                                {cols.status && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={getBadgeVariant(vehicle.status) as any} className="rounded-none text-[9px] font-black px-2 py-0.5">
                                            {vehicle.status.toUpperCase()}
                                        </Badge>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-2">
                                        {!isReadOnly && (
                                            <Link
                                                href={`${basePath}/${vehicle.id}/edit`}
                                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-none transition-colors"
                                                title="Editar">
                                                <Edit size={18} />
                                            </Link>
                                        )}
                                        {isAllowedToDelete && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(vehicle.id, vehicle.licensePlate);
                                                }}
                                                disabled={deletingId === vehicle.id}
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-none transition-colors disabled:opacity-50"
                                                title="Eliminar">
                                                {deletingId === vehicle.id ? (
                                                    <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {vehicles.map((vehicle) => (
                <div
                    key={vehicle.id}
                    className="bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group rounded-none">
                    <div className="relative h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {vehicle.image ? (
                            <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <Car
                                size={64}
                                className="text-slate-200 group-hover:scale-110 transition-transform duration-300"
                            />
                        )}

                        <div className="absolute top-3 right-3">
                            <Badge
                                variant={getBadgeVariant(vehicle.status) as any}
                                className="shadow-lg rounded-none text-xs">
                                {vehicle.status.charAt(0).toUpperCase() +
                                    vehicle.status.slice(1)}
                            </Badge>
                        </div>

                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-4 py-2 shadow-md rounded-none">
                            <p className="text-xs text-gray-500">Matrícula</p>
                            <p className="font-bold text-gray-900">{vehicle.licensePlate}</p>
                        </div>
                    </div>

                    <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {vehicle.brand} • {vehicle.year} • {vehicle.color}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-[11px]">
                                <div className="bg-blue-50 p-1.5 rounded-none">
                                    <Users size={14} className="text-blue-600" />
                                </div>
                                <span className="text-slate-600 font-bold truncate">
                                    {vehicle.memberName || "S/ Membro"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px]">
                                <div className="bg-blue-50 p-1.5 rounded-none">
                                    <Car size={14} className="text-blue-600" />
                                </div>
                                <span className="text-slate-600 font-bold">
                                    {vehicle.seats} lugares
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-blue-50 p-1.5 rounded-none">
                                    <Users size={14} className="text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-bold">
                                    {vehicle.partnerName || "WiTransfer"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-blue-50 p-1.5 rounded-none">
                                    <Gauge size={14} className="text-blue-600" />
                                </div>
                                <span className="text-gray-700">
                                    {(typeof vehicle.mileage === 'number' ? vehicle.mileage : 0).toLocaleString()} km
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px]">
                                <div
                                    className={`${vehicle.hasAC ? "bg-blue-50" : "bg-slate-50"
                                        } p-1.5 rounded-none`}>
                                    <Check
                                        size={14}
                                        className={
                                            vehicle.hasAC
                                                ? "text-blue-600"
                                                : "text-slate-400"
                                        }
                                    />
                                </div>
                                <span className="text-slate-600 font-bold">
                                    {vehicle.hasAC ? "Com AC" : "Sem AC"}
                                </span>
                            </div>
                        </div>

                        {vehicle.partnerName && (
                            <div className="bg-slate-50 p-3 mb-4 border border-slate-100 rounded-none">
                                <p className="text-xs text-slate-500 font-bold tracking-wider mb-1">
                                    Empresa Gestora
                                </p>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <div className="w-7 h-7 bg-slate-200 rounded-none flex items-center justify-center text-slate-600 font-black text-[10px] shadow-sm">
                                        {vehicle.partnerName.charAt(0)}
                                    </div>
                                    {vehicle.partnerName}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {!isReadOnly && (
                                <Link
                                    href={`${basePath}/${vehicle.id}/edit`}
                                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-none"
                                    title="Editar">
                                    <Edit size={18} />
                                </Link>
                            )}
                            {isAllowedToDelete && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteClick(vehicle.id, vehicle.licensePlate);
                                    }}
                                    disabled={deletingId === vehicle.id}
                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-none disabled:opacity-50"
                                    title="Eliminar">
                                    {deletingId === vehicle.id ? (
                                        <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                </button>
                            )}
                            <Link
                                href={`${basePath}/${vehicle.id}`}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-bold rounded-none shadow-sm">
                                Ver Detalhes
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            {content}

            <DeleteConfirmation
                open={!!vehicleToDelete}
                onOpenChange={(open) => !open && setVehicleToDelete(null)}
                onConfirm={confirmDelete}
                isDeleting={!!deletingId}
                title="Eliminar Veículo"
                description="Esta ação é irreversível e só será permitida se não houver reservas associadas."
                itemName={vehicleToDelete?.plate || ""}
                itemLabel="Matrícula do Veículo"
                icon={Car}
            />
        </>
    )
}

const VehiclesClient = ({ initialVehicles, currentUser }: { initialVehicles: Vehicle[], currentUser: any }) => {
    const router = useRouter();
    const pathname = usePathname();
    const isReadOnly = currentUser?.role === "DRIVER" || currentUser?.subRole === "driver" || currentUser?.subRole === "motorista";
    const { data: vehicles, loading: isPageLoading, hasMore, loadMore } = usePaginatedQuery<Vehicle>({
        key: "vehicles-list",
        fetchAction: (page, limit) => getCarsAction(page, limit),
        limit: 10,
        initialData: initialVehicles,
        tags: ["vehicles"]
    });

    const [pagina, setPagina] = useState(1);
    const [busca, setBusca] = useState("");
    const [statusFiltro, setStatusFiltro] = useState<VehicleStatus | "">("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [sortKey, setSortKey] = useState<keyof Vehicle>("model");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState<number>(10);
    const [cols, setCols] = useState({
        member: true,
        places: true,
        partner: true,
        status: true,
    });

    const filteredVehicles = vehicles.filter((vehicle) => {
        const matchesSearch =
            (vehicle.licensePlate || "").toLowerCase().includes(busca.toLowerCase()) ||
            (vehicle.model || "").toLowerCase().includes(busca.toLowerCase()) ||
            (vehicle.memberName || "").toLowerCase().includes(busca.toLowerCase());

        const matchesStatus = statusFiltro ? vehicle.status === statusFiltro : true;

        return matchesSearch && matchesStatus;
    });

    const handleDeleteSuccess = (id: string) => {
        const cached = globalDataCache.get<Vehicle>("vehicles-list");
        if (cached) {
            const updated = cached.filter(v => v.id !== id);
            globalDataCache.set("vehicles-list", updated, ["vehicles"]);
        }
    };

    const sortedVehicles = React.useMemo(() => {
        const arr = [...filteredVehicles];
        arr.sort((a, b) => {
            const av: any = a[sortKey];
            const bv: any = b[sortKey];
            let comp = 0;
            if (typeof av === "number" && typeof bv === "number") {
                comp = av - bv;
            } else {
                comp = String(av ?? "").localeCompare(String(bv ?? ""), "pt");
            }
            return sortDir === "asc" ? comp : -comp;
        });
        return arr;
    }, [filteredVehicles, sortKey, sortDir]);

    const stats = {
        total: vehicles.length,
        ativas: vehicles.filter((v) => v.status === "ativa").length,
        manutencao: vehicles.filter((v) => v.status === "manutencao").length,
        inativas: vehicles.filter((v) => v.status === "inativa").length,
    };

    const itemsPerPage = pageSize;
    const totalPaginas = Math.ceil(sortedVehicles.length / itemsPerPage);
    const pageData = sortedVehicles.slice(
        (pagina - 1) * itemsPerPage,
        pagina * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white border border-slate-100 p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-none">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600">
                            <Car size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">{stats.total}</p>
                            <p className="text-slate-400 text-[10px] font-black tracking-widest">
                                Veículos
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-[11px] font-medium">Frota total registada</p>
                </div>

                <div className="bg-white border border-slate-100 p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-none">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600">
                            <TrendingUp size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">
                                {stats.ativas}
                            </p>
                            <p className="text-slate-400 text-[10px] font-black tracking-widest">
                                Operacionais
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-[11px] font-medium">Veículos em serviço</p>
                </div>

                <div className="bg-white border border-slate-100 p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-none">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600">
                            <Settings size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">
                                {stats.manutencao}
                            </p>
                            <p className="text-slate-400 text-[10px] font-black tracking-widest">
                                Em Manutenção
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-[11px] font-medium">Aguardando reparo</p>
                </div>

                <div className="bg-white border border-slate-100 p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-none">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-rose-50 text-rose-600">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">
                                {stats.inativas}
                            </p>
                            <p className="text-slate-400 text-[10px] font-black tracking-widest">
                                Parados
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-[11px] font-medium">Veículos inativos</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div />
                {!isReadOnly && (
                    <Button
                        onClick={() => router.push(`${pathname}/new`)}
                        className="bg-primary text-white rounded-none flex items-center gap-2 px-6 h-11 font-bold shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} />
                        Novo Veículo
                    </Button>
                )}
            </div>

            <div className="bg-white shadow-sm border border-slate-100 p-6 mb-6 rounded-none">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-6 relative">
                        <Input
                            type="text"
                            placeholder="Pesquisar por nome, matrícula ou modelo..."
                            className="pl-4 pr-10 py-2.5 border-slate-200 focus:ring-2 focus:ring-blue-500 w-full text-xs rounded-none h-[42px] font-medium"
                            value={busca}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setBusca(e.target.value);
                                setPagina(1);
                            }}
                        />
                        {busca && (
                            <button
                                onClick={() => setBusca("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="md:col-span-6">
                        <select
                            value={statusFiltro}
                            onChange={(e) => {
                                setStatusFiltro(e.target.value as VehicleStatus | "");
                                setPagina(1);
                            }}
                            className="px-3 py-2.5 border border-slate-200 text-xs text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none bg-white cursor-pointer h-[42px] rounded-none">
                            <option value="">Todos os Estados</option>
                            <option value="ativa">Ativo</option>
                            <option value="inativa">Inativo</option>
                            <option value="manutencao">Manutenção</option>
                            <option value="inspecao">Inspeção</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                        <select
                            value={sortKey as string}
                            onChange={(e) => setSortKey(e.target.value as keyof Vehicle)}
                            className="px-3 py-2.5 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px] rounded-none">
                            <option value="model">Ordenar por: Modelo</option>
                            <option value="licensePlate">Ordenar por: Matrícula</option>
                            <option value="year">Ordenar por: Ano</option>
                            <option value="mileage">Ordenar por: Quilometragem</option>
                            <option value="status">Ordenar por: Estado</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <select
                            value={sortDir}
                            onChange={(e) => setSortDir(e.target.value as any)}
                            className="px-3 py-2.5 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px] rounded-none">
                            <option value="asc">Ascendente</option>
                            <option value="desc">Descendente</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(parseInt(e.target.value, 10));
                                setPagina(1);
                            }}
                            className="px-3 py-2.5 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px] rounded-none">
                            <option value={10}>10 por página</option>
                            <option value={25}>25 por página</option>
                            <option value={50}>50 por página</option>
                        </select>
                    </div>

                    <div className="md:col-span-5 flex items-center justify-end gap-2">
                        <div className="relative group inline-block">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors h-[42px] rounded-none">
                                <Filter size={18} />
                                Colunas
                            </button>
                            <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg border border-slate-100 py-2 hidden group-hover:block z-10 rounded-none">
                                <label className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cols.member}
                                        onChange={(e) =>
                                            setCols({ ...cols, member: e.target.checked })
                                        }
                                        className="rounded-none text-blue-600 focus:ring-blue-500"
                                    />
                                    Equipa
                                </label>
                                <label className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cols.places}
                                        onChange={(e) =>
                                            setCols({ ...cols, places: e.target.checked })
                                        }
                                        className="rounded-none text-blue-600 focus:ring-blue-500"
                                    />
                                    Lugares
                                </label>
                                <label className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cols.partner}
                                        onChange={(e) =>
                                            setCols({ ...cols, partner: e.target.checked })
                                        }
                                        className="rounded-none text-blue-600 focus:ring-blue-500"
                                    />
                                    Empresa
                                </label>
                                <label className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cols.status}
                                        onChange={(e) =>
                                            setCols({ ...cols, status: e.target.checked })
                                        }
                                        className="rounded-none text-blue-600 focus:ring-blue-500"
                                    />
                                    Estado
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2.5 transition-all rounded-none ${viewMode === "list"
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            title="Lista">
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2.5 transition-all rounded-none ${viewMode === "grid"
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            title="Grade">
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <VehiclesList
                vehicles={sortedVehicles}
                viewMode={viewMode}
                cols={cols}
                basePath={pathname}
                currentUser={currentUser}
                onDeleteSuccess={handleDeleteSuccess}
            />

            {hasMore && (
                <div className="flex justify-center mt-8">
                    <Button
                        variant="outline"
                        onClick={() => loadMore()}
                        disabled={isPageLoading}
                        className="rounded-none border-slate-200 text-slate-500 font-bold text-xs px-8 h-10 hover:bg-slate-50 transition-colors"
                    >
                        {isPageLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                CARREGANDO MAIS...
                            </>
                        ) : (
                            "CARREGAR MAIS"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VehiclesClient;
