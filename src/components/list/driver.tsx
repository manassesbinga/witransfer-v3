"use client"

import {
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Star,
    Phone,
    Mail,
    TrendingUp,
    CheckCircle,
    Ban,
    Users
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatarTelefone, formatarMoeda } from "@/lib/formatters"

interface Driver {
    id: string
    name: string
    email: string
    telefone: string
    status: string
    rating: number
    tripCount: number
    dataInicio: string
    fotoPerfil?: string
    viaturaModelo?: string
    totalEarnings?: number
    [key: string]: any
}

interface DriversListProps {
    drivers: Driver[]
    viewMode: "grid" | "list"
    cols?: {
        contato?: boolean
        performance?: boolean
        status?: boolean
        inicio?: boolean
    }
    basePath: string
    onStatusChange?: (id: string, currentStatus: string) => void
    onDelete?: (id: string) => void
    isPartner?: boolean
}

export function DriversList({
    drivers,
    viewMode,
    cols = { contato: true, performance: true, status: true, inicio: true },
    basePath,
    onStatusChange,
    onDelete,
    isPartner = false
}: DriversListProps) {

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "online":
            case "disponivel":
                return "success"
            case "ocupado":
                return "warning"
            case "suspenso":
                return "destructive"
            default:
                return "secondary"
        }
    }

    if (drivers.length === 0) {
        return (
            <div className="py-24 text-center bg-white rounded-3xl border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                    Nenhum motorista encontrado
                </h2>
                <p className="text-slate-500">Tente ajustar sua busca ou filtros.</p>
            </div>
        )
    }

    if (viewMode === "list") {
        return (
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest">
                                    Motorista
                                </th>
                                {cols.contato && (
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest">
                                        Contato
                                    </th>
                                )}
                                {cols.performance && (
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest">
                                        Performance
                                    </th>
                                )}
                                {cols.status && (
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest">
                                        Status
                                    </th>
                                )}
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest text-right">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {drivers.map((m) => (
                                <tr
                                    key={m.id}
                                    className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                <AvatarImage src={m.fotoPerfil} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {m.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-slate-900">{m.name}</p>
                                                {cols.inicio && (
                                                    <p className="text-xs text-slate-400 font-medium">
                                                        Início: {m.dataInicio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    {cols.contato && (
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Phone size={12} className="text-slate-400" />
                                                    {formatarTelefone(m.telefone)}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Mail size={12} className="text-slate-400" />
                                                    {m.email}
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                    {cols.performance && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Star
                                                        size={14}
                                                        className="text-yellow-500 fill-yellow-500"
                                                    />
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {(m.rating || 0).toFixed(1)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp size={14} className="text-blue-500" />
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {m.tripCount || 0} vgs
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                    {cols.status && (
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={getStatusVariant(m.status) as any}
                                                className="rounded-lg px-2 py-0.5 text-[10px] font-black tracking-widest border-none">
                                                {m.status}
                                            </Badge>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary hover:bg-slate-50">
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="rounded-xl border-slate-100 shadow-xl w-48 p-1.5">
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`${basePath}/${m.id}`}
                                                        className="flex items-center gap-2 font-bold text-xs p-2 rounded-lg cursor-pointer">
                                                        <Eye size={16} /> Ver perfil
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={basePath.includes("admin") ? `${basePath}/edit/${m.id}` : `${basePath}/${m.id}/edit`}
                                                        className="flex items-center gap-2 font-bold text-xs p-2 rounded-lg cursor-pointer">
                                                        <Edit size={16} /> Editar
                                                    </Link>
                                                </DropdownMenuItem>
                                                {onStatusChange && (
                                                    <DropdownMenuItem
                                                        className="text-orange-500 flex items-center gap-2 font-bold text-xs p-2 rounded-lg cursor-pointer focus:bg-orange-50 focus:text-orange-600"
                                                        onClick={() => onStatusChange(m.id, m.status)}>
                                                        {m.status === "suspenso" ? <CheckCircle size={16} /> : <Ban size={16} />}
                                                        {m.status === "suspenso" ? "Reativar" : "Suspender"}
                                                    </DropdownMenuItem>
                                                )}
                                                {onDelete && (
                                                    <DropdownMenuItem
                                                        className="text-red-600 flex items-center gap-2 font-bold text-xs p-2 rounded-lg cursor-pointer focus:bg-red-50 focus:text-red-700"
                                                        onClick={() => onDelete(m.id)}>
                                                        <Trash2 size={16} /> Excluir
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((m, i) => (
                <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-all group rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between space-y-0">
                            <Badge
                                variant={getStatusVariant(m.status) as any}
                                className="rounded-lg px-2 py-0.5 text-[10px] font-black tracking-widest border-none">
                                {m.status}
                            </Badge>
                            {cols.performance && (
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                    <Star
                                        size={12}
                                        className="text-yellow-500 fill-yellow-500"
                                    />
                                    <span className="text-xs font-black text-yellow-700">
                                        {(m.rating || 0).toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-6 text-center">
                            <Avatar className="w-20 h-20 mx-auto border-4 border-slate-50 shadow-sm mb-4">
                                <AvatarImage src={m.fotoPerfil} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                    {m.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <h3 className="font-black text-slate-900 text-lg leading-tight">
                                {m.name}
                            </h3>
                            <p className="text-sm text-slate-400 font-medium mb-4">
                                {m.viaturaModelo || "Sem viatura alocada"}
                            </p>

                            {cols.performance && (
                                <div className="grid grid-cols-2 gap-2 mb-6 text-left">
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-1">
                                            Viagens
                                        </p>
                                        <p className="text-sm font-black text-slate-700">
                                            {m.tripCount || 0}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-1">
                                            Ganhos
                                        </p>
                                        <p className="text-sm font-black text-slate-700">
                                            {formatarMoeda(m.totalEarnings || 0)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl h-10 font-bold border-slate-100 hover:bg-slate-50"
                                        asChild>
                                        <Link href={`${basePath}/${m.id}`}>
                                            Ver perfil
                                        </Link>
                                    </Button>
                                    <Button
                                        className="flex-1 rounded-xl h-10 font-bold shadow-sm"
                                        asChild>
                                        <Link href={basePath.includes("admin") ? `${basePath}/edit/${m.id}` : `${basePath}/${m.id}/edit`}>
                                            Editar
                                        </Link>
                                    </Button>
                                </div>
                                {(onStatusChange || onDelete) && (
                                    <div className="flex gap-2">
                                        {onStatusChange && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold h-9 rounded-lg"
                                                onClick={() => onStatusChange(m.id, m.status)}>
                                                {m.status === "suspenso" ? "Reativar" : "Suspender"}
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 text-red-700 hover:text-red-800 hover:bg-red-50 font-bold h-9 rounded-lg"
                                                onClick={() => onDelete(m.id)}>
                                                Excluir
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
