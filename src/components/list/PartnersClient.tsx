/** @format */

"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Building2,
    UserCheck,
    Shield,
    Activity,
    Loader2,
    Mail,
    Eye,
    Check,
    DollarSign,
    ArrowUpRight,
    FileText as FileIcon,
    Download,
    ExternalLink
} from "lucide-react";
import DocumentVerificationModal from "@/components/modal/DocumentVerificationModal";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    approvePartnerAction,
} from "@/actions/private/partners/actions";

interface PartnersClientProps {
    initialPartners: any[];
    initialPendingRequests: any[];
    initialStats: any;
}

import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { getPartnersAction } from "@/actions/private/partners/actions";

export default function PartnersClient({
    initialPartners,
    initialPendingRequests,
    initialStats
}: PartnersClientProps) {
    const router = useRouter();

    const {
        data: partners,
        loading,
        hasMore,
        loadMore
    } = usePaginatedQuery<any>({
        fetchAction: getPartnersAction,
        key: "partners-list",
        initialData: initialPartners,
        limit: 50,
        tags: ["partners"]
    });

    const [pendingRequests] = useState<any[]>(initialPendingRequests);
    const [stats] = useState<any>(initialStats);
    const [searchTerm, setSearchTerm] = useState("");
    const [isApproving, setIsApproving] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);

    const handleViewDocs = (partner: any) => {
        setSelectedDoc({
            id: partner.id,
            document_url: partner.document_url,
            document_name: "Documento de Identificação / Registro",
            document_type: partner.type === 'empresa' ? 'Alvará Mercantil / NIF' : 'Identificação Pessoal',
            uploaded_at: partner.created_at || new Date().toISOString(),
            partner: {
                nome: partner.name || partner.legal_name
            }
        });
        setIsDocModalOpen(true);
    };

    const handleApprove = async (id: string) => {
        setIsApproving(id);
        try {
            const result = await approvePartnerAction(id);
            if (result.success) {
                toast.success("Parceiro aprovado e ativado!");
                router.refresh(); // Triggers server-side re-fetch
            } else {
                toast.error(result.error || "Erro ao aprovar parceiro.");
            }
        } catch (error) {
            toast.error("Erro inesperado na aprovação.");
        } finally {
            setIsApproving(null);
        }
    };

    const filteredPartners = (partners || []).filter(
        (p) => {
            const search = searchTerm.toLowerCase();
            const name = (p.name || "").toLowerCase();
            const email = (p.email || "").toLowerCase();
            const admin = (p.adminName || "").toLowerCase();
            return name.includes(search) || email.includes(search) || admin.includes(search);
        }
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div />
                <Button
                    onClick={() => router.push("/admin/partners/new")}
                    className="rounded-none h-11 px-6 font-black text-[10px] tracking-widest shadow-lg shadow-primary/20 bg-primary text-white"
                >
                    <Plus className="w-4 h-4 mr-2" /> Novo Parceiro
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border border-slate-200/60 shadow-none rounded-none bg-white hover:border-blue-200 transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-11 h-11 rounded-none flex items-center justify-center bg-blue-50 text-blue-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tabular-nums tracking-tight">
                                    {stats?.partners_total || partners.length}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 mt-1 tracking-widest">
                                    Total de Parceiros
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border border-slate-200/60 shadow-none rounded-none bg-white hover:border-blue-200 transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-11 h-11 rounded-none flex items-center justify-center shadow-sm bg-green-50 text-green-600">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tabular-nums tracking-tight">
                                    {stats?.motoristas || 0}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 mt-1 tracking-widest">
                                    Total de Motoristas
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border border-slate-200/60 shadow-none rounded-none bg-white hover:border-blue-200 transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-11 h-11 rounded-none flex items-center justify-center shadow-sm bg-purple-50 text-purple-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tabular-nums tracking-tight">
                                    {stats?.cars || 0}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 mt-1 tracking-widest">
                                    Total de Veículos
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card
                        className="border-none shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 rounded-none bg-primary text-white overflow-hidden group cursor-pointer"
                        onClick={() => router.push("/admin/finance")}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-11 h-11 rounded-none flex items-center justify-center shadow-sm bg-white/20 text-white">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Financeiro</h3>
                                <p className="text-[10px] font-black text-white/60 mt-1 tracking-widest">
                                    Visão Global de Facturação
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        <h2 className="text-sm font-black tracking-[0.2em] text-amber-600">
                            Solicitações de Verificação Pendentes ({pendingRequests.length})
                        </h2>
                    </div>

                    <Card className="border border-slate-100 shadow-none rounded-none overflow-hidden bg-white">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-amber-50/50">
                                    <TableRow className="border-amber-100 h-14">
                                        <TableHead className="font-bold text-amber-800 tracking-widest text-[10px] pl-8">
                                            Parceiro / Candidato
                                        </TableHead>
                                        <TableHead className="font-bold text-amber-800 tracking-widest text-[10px] hidden md:table-cell">
                                            Responsável
                                        </TableHead>
                                        <TableHead className="font-bold text-amber-800 tracking-widest text-[10px] hidden lg:table-cell">
                                            Modelo de Ganhos
                                        </TableHead>
                                        <TableHead className="font-bold text-amber-800 tracking-widest text-[10px]">
                                            Docs
                                        </TableHead>
                                        <TableHead className="text-right pr-8">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingRequests.map((req) => (
                                        <TableRow key={req.id} className="border-amber-50 hover:bg-amber-50/30 h-16 transition-colors group">
                                            <TableCell className="pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-none bg-amber-100 flex items-center justify-center shadow-sm">
                                                        <Building2 className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 leading-none">
                                                            {req.name || req.legal_name || "N/A"}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {req.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {req.manager_name || "N/A"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 capitalize font-bold border-none text-[10px]">
                                                        {req.remuneration_type || "percentual"}
                                                    </Badge>
                                                    <span className="font-black text-slate-900 text-xs">
                                                        {req.remuneration_value || "15"}{req.remuneration_type === "fixo" ? " Kz" : "%"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant={req.document_url ? "outline" : "ghost"}
                                                    size="sm"
                                                    className={cn(
                                                        "font-black text-[9px] tracking-widest gap-2 rounded-none h-9 px-2 md:px-4 transition-all duration-200",
                                                        req.document_url
                                                            ? "text-primary hover:text-primary hover:bg-primary/5 border-primary/20"
                                                            : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                                    )}
                                                    onClick={() => handleViewDocs(req)}
                                                >
                                                    <FileIcon className="w-4 h-4" />
                                                    <span className="hidden sm:inline">{req.document_url ? "VER" : "PEDIR"}</span>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={(e) => { e.stopPropagation(); handleApprove(req.id); }}
                                                        disabled={isApproving === req.id}
                                                        size="sm"
                                                        className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] tracking-widest gap-2 border-none shadow-sm h-9 px-4"
                                                    >
                                                        {isApproving === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                        Aprovar
                                                    </Button>
                                                    <Link href={`/admin/dashboard/${req.id}`}>
                                                        <Button variant="outline" size="sm" className="rounded-none border-slate-200 text-slate-500 h-9 px-4 font-black text-[9px] tracking-widest">
                                                            Detalhes
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            )}

            {/* Parceiros Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                    <h2 className="text-sm font-black tracking-[0.2em] text-slate-600">
                        Parceiros Registados no Sistema ({partners.length})
                    </h2>
                </div>


                {/* Table */}
                <Card className="border border-slate-100 shadow-none rounded-none overflow-hidden bg-white">
                    <div className="p-8 pb-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nome, email ou administrador..."
                                className="pl-10 h-10 bg-slate-50 border-none rounded-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100 h-14">
                                    <TableHead className="font-bold text-slate-400 tracking-widest text-[10px] pl-8">
                                        Parceiro
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-400 tracking-widest text-[10px] hidden lg:table-cell">
                                        Administrador
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-400 tracking-widest text-[10px] hidden md:table-cell">
                                        Recursos
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-400 tracking-widest text-[10px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-400 tracking-widest text-[10px]">
                                        Docs
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-400 tracking-widest text-[10px] hidden xl:table-cell">
                                        Criação
                                    </TableHead>
                                    <TableHead className="text-right pr-8"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPartners.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-12 text-slate-400 font-medium"
                                        >
                                            Nenhum parceiro encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPartners.map((partner) => (
                                        <TableRow
                                            key={partner.id}
                                            className="border-slate-50 hover:bg-slate-50/30 h-16 transition-colors group"
                                        >
                                            <TableCell className="pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center shadow-sm">
                                                        <Building2 className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 leading-none">
                                                            {partner.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {partner.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-3 h-3 text-primary/40" />
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {partner.adminName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-xs">
                                                        <span className="font-bold text-slate-700">
                                                            {partner.vehicleCount}
                                                        </span>
                                                        <span className="text-slate-400 ml-1">v</span>
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="font-bold text-slate-700">
                                                            {partner.memberCount}
                                                        </span>
                                                        <span className="text-slate-400 ml-1">
                                                            m
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "border-none px-2 py-1 rounded-none font-black uppercase text-[8px] md:text-[9px] tracking-widest",
                                                        partner.status === "active"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-slate-100 text-slate-500"
                                                    )}
                                                >
                                                    {partner.status === "active" ? "Ativo" : "Off"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant={partner.document_url ? "outline" : "ghost"}
                                                    size="sm"
                                                    className={cn(
                                                        "font-black text-[9px] tracking-widest gap-2 rounded-none h-9 px-2 md:px-4 transition-all duration-200",
                                                        partner.document_url
                                                            ? "text-primary hover:text-primary hover:bg-primary/5 border-primary/20"
                                                            : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                                    )}
                                                    onClick={() => handleViewDocs(partner)}
                                                >
                                                    <FileIcon className="w-4 h-4" />
                                                    <span className="hidden sm:inline">{partner.document_url ? "VER" : "N/A"}</span>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="hidden xl:table-cell">
                                                <span className="text-xs text-slate-500">
                                                    {new Date(partner.createdAt).toLocaleDateString(
                                                        "pt-BR"
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 rounded-none hover:bg-slate-100"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48 rounded-none p-2 shadow-lg border-slate-100"
                                                    >
                                                        <Link href={`/admin/dashboard/${partner.id}`}>
                                                            <DropdownMenuItem className="gap-2 cursor-pointer font-medium rounded-lg">
                                                                <Eye size={16} />
                                                                Ver Detalhes
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        <DropdownMenuItem className="gap-2 cursor-pointer font-medium rounded-lg">
                                                            <Mail size={16} />
                                                            Reenviar Credenciais
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
                </Card>
            </div>

            {/* Document Preview Modal */}
            <DocumentVerificationModal
                document={selectedDoc}
                isOpen={isDocModalOpen}
                onClose={() => {
                    setIsDocModalOpen(false);
                    setSelectedDoc(null);
                }}
            />
        </div>
    );
}
