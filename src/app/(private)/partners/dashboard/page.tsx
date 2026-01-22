"use client"

import { useState, useEffect } from "react"
import {
    DollarSign,
    Car,
    Users,
    Activity,
    Database,
    Calendar,
    ChevronRight
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { getPartnerDashboardStatsAction } from "@/actions/private/partners/actions"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type KpiItem = {
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down';
    icon: any;
    description?: string;
    color: string;
    bgColor: string;
}

interface DashboardStats {
    revenue: { value: string; change: string; trend: 'up' | 'down' };
    trips: { value: string; change: string; trend: 'up' | 'down' };
    members: { value: string; change: string; trend: 'up' | 'down' };
    drivers?: { value: string; change: string; trend: 'up' | 'down' };
}

interface RecentOperation {
    id: string;
    type: string;
    status: string;
    value: string;
    date: string;
    time: string;
    vehicle: {
        brand: string;
        model: string;
        plate: string;
    } | null;
}

interface DashboardData {
    stats: DashboardStats;
    recentOperations: RecentOperation[];
}

function PartnerDashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64 rounded-none" />
                </div>
                <div className="flex flex-wrap gap-4">
                    <Skeleton className="h-[74px] w-40 rounded-none" />
                    <Skeleton className="h-[74px] w-40 rounded-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-slate-200/60 p-6 space-y-4 rounded-none h-[160px]">
                        <Skeleton className="w-11 h-11 rounded-none" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20 rounded-none" />
                            <Skeleton className="h-8 w-32 rounded-none" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200/60 rounded-none h-[400px]" />
        </div>
    )
}

export default function PartnerPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<DashboardData | null>(null)

    useEffect(() => {
        async function loadData() {
            const result = await getPartnerDashboardStatsAction()
            if (result.success && result.data) {
                setData(result.data as DashboardData)
            } else {
                toast.error("Erro ao carregar dados do parceiro.")
            }
            setLoading(false)
        }
        loadData()
    }, [])

    if (loading) return <PartnerDashboardSkeleton />

    const stats = data?.stats || {
        revenue: { value: "0 Kz", change: "0%", trend: "up" },
        trips: { value: "0", change: "0%", trend: "up" },
        members: { value: "0", change: "0%", trend: "up" }
    }


    const kpiItems: KpiItem[] = [
        {
            label: "Receita Total",
            value: stats.revenue.value,
            change: stats.revenue.change,
            trend: stats.revenue.trend,
            icon: DollarSign,
            description: "Ganhos confirmados",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            label: "Transfers & Viagens",
            value: stats.trips.value,
            change: stats.trips.change,
            trend: stats.trips.trend,
            icon: Car,
            description: "Execução operacional",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        },
        {
            label: "Equipa Ativa",
            value: stats.members.value,
            change: stats.members.change,
            trend: stats.members.trend,
            icon: Users,
            description: "Operadores online",
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
    ]
    const recentOperations = data?.recentOperations || []

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpiItems.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-none bg-white/80 backdrop-blur-sm overflow-hidden p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("w-11 h-11 rounded-none flex items-center justify-center shadow-sm", item.bgColor, item.color)}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                {item.change && (
                                    <div className={cn("text-[10px] font-black px-2 py-1 rounded-none",
                                        item.trend === 'up' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {item.trend === 'up' ? "+" : "-"}{item.change}
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{item.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">{item.value}</h3>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">{item.description}</p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="bg-white rounded-none border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-none bg-slate-900 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Últimas Operações (Reservas e Transfers)</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left bg-slate-50/30 border-b border-slate-100">
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">ID / DATA</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">VEÍCULO UTILIZADO</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">ESTADO</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">VALOR TOTAL</th>
                                    <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">DETALHES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentOperations.length > 0 ? (
                                    recentOperations.map((op: RecentOperation) => (
                                        <tr
                                            key={op.id}
                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/operations/${op.type === 'transfer' ? 'transfers' : 'bookings'}/${op.id}`)}
                                        >
                                            <td className="px-8 py-4">
                                                <p className="text-[11px] font-black text-slate-900 uppercase">#{op.id.slice(0, 8)}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">{op.date} ÀS {op.time}</p>
                                            </td>
                                            <td className="px-8 py-4">
                                                {op.vehicle ? (
                                                    <>
                                                        <p className="text-[11px] font-black text-slate-900 uppercase">{op.vehicle.brand} {op.vehicle.model}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{op.vehicle.plate || 'SEM MATRÍCULA'}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-[9px] text-slate-300 font-bold uppercase">NÃO ATRIBUÍDO</p>
                                                )}
                                            </td>
                                            <td className="px-8 py-4">
                                                <Badge className={cn(
                                                    "rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter border-none",
                                                    op.status === 'confirmed' || op.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                                                        op.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                                            "bg-slate-100 text-slate-500"
                                                )}>
                                                    {op.status === 'confirmed' ? 'CONFIRMADO' :
                                                        op.status === 'completed' ? 'CONCLUÍDO' :
                                                            op.status === 'pending' ? 'PENDENTE' : op.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-[11px] font-black text-slate-900 uppercase">{op.value}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                                                    <ChevronRight size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Activity className="w-8 h-8 text-slate-200 mb-4" />
                                                <p className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Nenhuma operação registada recentemente</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
