"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Eye, Edit, Trash2, Building2, UserCheck, Shield, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PartnerForm } from "@/components"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// Mock data
const parceiros = [
    {
        id: 1,
        nome: "TransLuanda Express",
        tipo: "empresa",
        email: "contato@transluanda.ao",
        telefone: "+244 923 456 789",
        status: "ativo",
        verificado: true,
        servicos: ["transfer", "aluguer"],
    },
    {
        id: 2,
        nome: "João Manuel",
        tipo: "individual",
        email: "joao@email.com",
        telefone: "+244 912 345 678",
        status: "pendente",
        verificado: false,
        servicos: ["transfer"],
    },
]

export default function PartnersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editingPartner, setEditingPartner] = useState<any>(null)

    const stats = [
        { label: "Total de Parceiros", value: "24", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Ativos", value: "18", icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
        { label: "Verificados", value: "15", icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Pendentes", value: "6", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
    ]

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Parceiros</h1>
                    <p className="text-gray-500 mt-1">Gerencie todos os parceiros da plataforma</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingPartner(null)
                        setShowForm(true)
                    }}
                    className="rounded-xl bg-primary text-white shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Parceiro
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6 rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold tracking-widest text-gray-400">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <Card className="p-4 rounded-2xl border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar parceiros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl border-gray-200"
                    />
                </div>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 tracking-widest">
                                    Parceiro
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 tracking-widest">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 tracking-widest">
                                    Contato
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 tracking-widest">
                                    Serviços
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 tracking-widest">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 tracking-widest">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {parceiros.map((parceiro) => (
                                <tr key={parceiro.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{parceiro.nome}</p>
                                                {parceiro.verificado && (
                                                    <Badge variant="outline" className="mt-1 text-[9px] bg-green-50 text-green-600 border-green-200">
                                                        Verificado
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="capitalize">
                                            {parceiro.tipo}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="text-gray-900">{parceiro.email}</p>
                                            <p className="text-gray-500 text-xs">{parceiro.telefone}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {parceiro.servicos.map((servico) => (
                                                <Badge key={servico} variant="secondary" className="text-[9px]">
                                                    {servico}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            className={
                                                parceiro.status === "ativo"
                                                    ? "bg-green-50 text-green-600"
                                                    : parceiro.status === "pendente"
                                                        ? "bg-amber-50 text-amber-600"
                                                        : "bg-gray-50 text-gray-600"
                                            }
                                        >
                                            {parceiro.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => {
                                                    setEditingPartner(parceiro)
                                                    setShowForm(true)
                                                }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Dialog com Formulário */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <PartnerForm
                        mode={editingPartner ? "edit" : "create"}
                        initialData={editingPartner}
                        onSubmit={async (data) => {
                            setShowForm(false)
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
