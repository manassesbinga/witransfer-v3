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
import { Plus, Download, Trash2, Search, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { deleteTransactionAction } from "@/actions/private/financial/actions"

interface TransactionsClientProps {
    initialTransactions: any[];
}

export default function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
    const router = useRouter()
    const [transactions, setTransactions] = useState<any[]>(initialTransactions)
    const [searchTerm, setSearchTerm] = useState("")

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja apagar?")) return;
        try {
            await deleteTransactionAction(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
            toast.success("Transação removida!");
            router.refresh();
        } catch (error) {
            toast.error("Erro ao apagar.");
        }
    };

    const filtered = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-100">
                <div className="flex-1 w-full max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por descrição ou categoria..."
                        className="pl-10 h-10 rounded-none border-slate-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="rounded-none h-10 border-slate-200 font-black text-[10px] tracking-widest flex-1 md:flex-none uppercase">
                        <Download className="w-4 h-4 mr-2" /> Exportar
                    </Button>
                    <Button
                        onClick={() => router.push("/finance/new")}
                        className="bg-[#0069B8] hover:opacity-90 text-white rounded-none h-10 px-6 font-black tracking-widest text-[10px] flex-1 md:flex-none uppercase"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 h-12 pl-6 uppercase">Data</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 uppercase">Tipo</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 uppercase">Categoria</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 uppercase">Descrição</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 text-right pr-6 uppercase">Valor</TableHead>
                            <TableHead className="font-black text-[10px] tracking-widest text-slate-400 text-center uppercase">Acções</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-black text-[10px] tracking-widest uppercase">
                                    Nenhuma movimentação encontrada
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((t) => (
                                <TableRow key={t.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                    <TableCell className="pl-6 text-[11px] font-bold text-slate-500">
                                        {new Date(t.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {t.type === "entrada" ? (
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                                                    <ArrowDownRight className="w-3 h-3 text-rose-600" />
                                                </div>
                                            )}
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                t.type === "entrada" ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {t.type}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="rounded-none border-slate-100 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                            {t.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 tracking-tighter uppercase">{t.description}</p>
                                            {t.isVirtual && <span className="text-[8px] font-black text-[#0069B8] opacity-50 uppercase">Lançamento Automático</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right pr-6 font-black text-[12px]",
                                        t.type === "entrada" ? "text-emerald-600" : "text-slate-900"
                                    )}>
                                        {t.type === "entrada" ? "+" : "-"} {Number(t.amount).toLocaleString()} AOA
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {!t.isVirtual && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleDelete(t.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
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
