import { User, Mail, Phone, MapPin, Star, Car, DollarSign, Calendar, MoreVertical, Eye, Users } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Client {
    id: string
    name: string
    email: string
    telefone: string
    createdAt: string
    tripCount: number
    totalSpent: number
    status: string
    lastTrip: string
    averageRating: number
    address: string
    preferences?: string[]
}

interface ClientsListProps {
    clients: Client[]
    viewMode: "grid" | "list"
    cols: {
        contato?: boolean
        estatisticas?: boolean
        status?: boolean
        cadastro?: boolean
    }
    basePath: string
}

export function ClientsList({ clients, viewMode, cols, basePath }: ClientsListProps) {
    if (clients.length === 0) {
        return (
            <div className="py-24 text-center bg-white rounded-3xl border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                    Nenhum cliente encontrado
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
                                    Cliente
                                </th>
                                {cols.contato && (
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest">
                                        Contato
                                    </th>
                                )}
                                {cols.estatisticas && (
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest">
                                        Estatísticas
                                    </th>
                                )}
                                {cols.status && (
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest">
                                        Status
                                    </th>
                                )}
                                {cols.cadastro && (
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest">
                                        Cadastro
                                    </th>
                                )}
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-widest text-right">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-5">
                            {clients.map((client) => (
                                <tr
                                    key={client.id}
                                    className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {client.name}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    ID: {client.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    {cols.contato && (
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Mail size={12} className="text-slate-400" />
                                                    {client.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Phone size={12} className="text-slate-400" />
                                                    {client.telefone}
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                    {cols.estatisticas && (
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <Car size={14} className="text-blue-500" />
                                                        <span className="text-sm font-bold text-slate-700">
                                                            {client.tripCount}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign
                                                            size={14}
                                                            className="text-green-500"
                                                        />
                                                        <span className="text-sm font-bold text-slate-700">
                                                            {new Intl.NumberFormat("pt-AO", {
                                                                style: "currency",
                                                                currency: "AOA",
                                                                maximumFractionDigits: 0,
                                                            }).format(client.totalSpent)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star
                                                        size={14}
                                                        className="text-yellow-500 fill-yellow-500"
                                                    />
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {client.averageRating.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                    {cols.status && (
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={cn(
                                                    "border-none px-3 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-wider shadow-sm",
                                                    client.status === "ativo"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-slate-100 text-slate-500"
                                                )}>
                                                {client.status === "ativo" ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </td>
                                    )}
                                    {cols.cadastro && (
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {format(
                                                        new Date(client.createdAt),
                                                        "dd/MM/yyyy"
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    Última:{" "}
                                                    {format(
                                                        new Date(client.lastTrip),
                                                        "dd/MM/yyyy"
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-48 rounded-xl p-2 shadow-lg">
                                                <DropdownMenuItem className="gap-2 cursor-pointer font-medium rounded-lg">
                                                    <Link
                                                        href={`${basePath}/${client.id}`}
                                                        className="flex items-center gap-2 w-full">
                                                        <Eye size={16} />
                                                        Ver Perfil
                                                    </Link>
                                                </DropdownMenuItem>
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
            {clients.map((client) => (
                <Card
                    key={client.id}
                    className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {client.name}
                                    </p>
                                    <p className="text-xs text-slate-400">{client.id}</p>
                                </div>
                            </div>
                            <Badge
                                className={cn(
                                    "border-none px-2 py-1 rounded-full font-bold uppercase text-[9px] tracking-wider",
                                    client.status === "ativo"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-slate-100 text-slate-500"
                                )}>
                                {client.status === "ativo" ? "Ativo" : "Inativo"}
                            </Badge>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Mail size={12} className="text-slate-400" />
                                    {client.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Phone size={12} className="text-slate-400" />
                                    {client.telefone}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <MapPin size={12} className="text-slate-400" />
                                    {client.address}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Car size={12} className="text-blue-500" />
                                        <span className="text-xs font-bold text-slate-700">
                                            {client.tripCount}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star
                                            size={12}
                                            className="text-yellow-500 fill-yellow-500"
                                        />
                                        <span className="text-xs font-bold text-slate-700">
                                            {client.averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-green-600">
                                    {new Intl.NumberFormat("pt-AO", {
                                        style: "currency",
                                        currency: "AOA",
                                        maximumFractionDigits: 0,
                                    }).format(client.totalSpent)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
