/** @format */

"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Search, Eye, Mail, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface BudgetsClientProps {
    initialBudgets: any[];
}

export default function BudgetsClient({ initialBudgets }: BudgetsClientProps) {
    const [budgets] = useState<any[]>(initialBudgets)
    const [searchTerm, setSearchTerm] = useState("")

    const filtered = budgets.filter(b =>
        b.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-100">
                <div className="flex-1 w-full max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por cliente ou serviço..."
                        className="pl-10 h-10 rounded-none border-slate-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button
                    className="bg-primary hover:opacity-90 text-white rounded-none h-10 px-6 font-black tracking-widest text-[10px] w-full md:w-auto uppercase"
                >
                    <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
                </Button>
            </div>

            <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 h-12 pl-6 uppercase">Cliente</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 uppercase">Serviço</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 uppercase">Data Solicitação</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 uppercase">Status</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 text-right pr-6 uppercase">Valor Cotado</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 text-center uppercase">Acções</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-black text-[10px] tracking-widest uppercase">
                                    Nenhuma solicitação de orçamento
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((b) => (
                                <TableRow key={b.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-none bg-slate-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-900 tracking-tighter uppercase">{b.user_name}</p>
                                                <div className="flex gap-2 mt-0.5">
                                                    <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1"><Mail size={8} /> {b.user_email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="rounded-none border-slate-100 text-[9px] font-black tracking-widest text-[#0069B8] bg-blue-50/30 uppercase">
                                            {b.service_type || "Transfer"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[10px] font-bold text-slate-500">
                                        {new Date(b.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "rounded-none border-none text-[8px] font-black uppercase tracking-widest",
                                            b.status === "pending" ? "bg-amber-100 text-amber-700" :
                                                b.status === "quoted" ? "bg-blue-100 text-blue-700" :
                                                    b.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                                                        "bg-slate-100 text-slate-600"
                                        )}>
                                            {b.status === 'pending' ? 'Pendente' : b.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 font-black text-[12px] text-slate-900">
                                        {b.quoted_amount ? `${Number(b.quoted_amount).toLocaleString()} AOA` : "---"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-[#0069B8] hover:bg-blue-50">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
