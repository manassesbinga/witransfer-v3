/** @format */

"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Phone,
  Mail,
  Car,
  TrendingUp,
  Loader2,
  List,
  LayoutGrid,
  Ban,
  CheckCircle,
  X,
  Download,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  getMotoristasAction,
  updateMotoristaAction,
  deleteMotoristaAction,
} from "../../actions";
import { formatarTelefone, formatarMoeda } from "@/lib/formatters";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GlobalLoading from "@/app/loading";

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<string>("");
  const [minNota, setMinNota] = useState<number>(0);
  const [sortKey, setSortKey] = useState<string>("nome");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [cols, setCols] = useState({
    contato: true,
    performance: true,
    status: true,
    inicio: true,
  });

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const fetchMotoristas = async () => {
    setLoading(true);
    try {
      const result = await getMotoristasAction();
      if (result.success) {
        setMotoristas(result.data);
      }
    } catch (error) {
      toast.error("Erro ao carregar motoristas");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const novoStatus = currentStatus === "suspenso" ? "offline" : "suspenso";
    try {
      const res = await updateMotoristaAction(id, { status: novoStatus });
      if (res.success) {
        toast.success(`Status atualizado para ${novoStatus}`);
        fetchMotoristas();
      }
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este motorista?")) return;
    try {
      const res = await deleteMotoristaAction(id);
      if (res.success) {
        toast.success("Motorista removido com sucesso");
        fetchMotoristas();
      }
    } catch (error) {
      toast.error("Erro ao remover motorista");
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "online":
      case "disponivel":
        return "success";
      case "ocupado":
        return "warning";
      case "suspenso":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filtrados = motoristas.filter((m) => {
    const matchBusca =
      !busca.trim() ||
      m.nome.toLowerCase().includes(busca.toLowerCase()) ||
      m.email.toLowerCase().includes(busca.toLowerCase()) ||
      m.telefone.includes(busca);

    const matchStatus = !status || m.status === status;
    const matchNota = (m.pontuacao || 0) >= minNota;

    return matchBusca && matchStatus && matchNota;
  });

  const ordenados = [...filtrados].sort((a, b) => {
    const av = a[sortKey] || "";
    const bv = b[sortKey] || "";
    let comp = 0;

    if (typeof av === "number" && typeof bv === "number") {
      comp = av - bv;
    } else {
      comp = String(av).localeCompare(String(bv), "pt");
    }

    return sortDir === "asc" ? comp : -comp;
  });

  const totalPaginas = Math.ceil(ordenados.length / pageSize);
  const itensPagina = ordenados.slice(
    (pagina - 1) * pageSize,
    pagina * pageSize
  );

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <GlobalLoading />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-none">
              <Users size={24} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {motoristas.length}
              </p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Total
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Motoristas Cadastrados</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-50 p-3 rounded-none">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {motoristas.filter((m) => m.status === "online").length}
              </p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Online
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Em Atividade</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-50 p-3 rounded-none">
              <CheckCircle size={24} className="text-indigo-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {motoristas.filter((m) => m.status === "disponivel").length}
              </p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Prontos
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Aguardando Viagem</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-rose-50 p-3 rounded-none">
              <Ban size={24} className="text-rose-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {motoristas.filter((m) => m.status === "suspenso").length}
              </p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Suspensos
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Restrição de Acesso</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Frota de Condutores
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie e monitore o desempenho da sua equipe
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const headers = [
                  "id",
                  "nome",
                  "email",
                  "telefone",
                  "status",
                  "dataInicio",
                  "pontuacao",
                  "numeroViagens",
                ];
                const rows = ordenados.map((m) =>
                  headers.map((h) => (m as any)[h] ?? "").join(",")
                );
                const csv = [headers.join(","), ...rows].join("\n");
                const blob = new Blob([csv], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "motoristas.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded-xl h-11 px-4 font-bold border-slate-100 hover:bg-slate-50">
              <Download size={18} className="mr-2" />
              Exportar
            </Button>
            <Link href="/admin/motoristas/novo">
              <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" /> Novo Motorista
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              className="pl-10 h-11 rounded-xl border-slate-100 focus:ring-primary/20"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="md:col-span-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPagina(1);
              }}
              className="w-full h-11 px-3 rounded-xl border border-slate-100 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
              <option value="">Status: Todos</option>
              <option value="online">Online</option>
              <option value="disponivel">Disponível</option>
              <option value="ocupado">Ocupado</option>
              <option value="suspenso">Suspenso</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Input
              type="number"
              min={0}
              max={5}
              step={0.1}
              placeholder="Score ≥"
              className="h-11 rounded-xl border-slate-100"
              value={minNota || ""}
              onChange={(e) => {
                setMinNota(parseFloat(e.target.value || "0"));
                setPagina(1);
              }}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              type="date"
              className="h-11 rounded-xl border-slate-100 text-slate-500 text-xs"
              placeholder="Início"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              type="date"
              className="h-11 rounded-xl border-slate-100 text-slate-500 text-xs"
              placeholder="Fim"
            />
          </div>
        </div>

        {/* Filters Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-100 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="nome">Ordenar: Nome</option>
              <option value="pontuacao">Ordenar: Score</option>
              <option value="numeroViagens">Ordenar: Viagens</option>
              <option value="dataInicio">Ordenar: Início</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="w-full h-11 px-3 rounded-xl border border-slate-100 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setPagina(1);
              }}
              className="w-full h-11 px-3 rounded-xl border border-slate-100 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value={10}>10 por pág.</option>
              <option value={25}>25 por pág.</option>
              <option value={50}>50 por pág.</option>
            </select>
          </div>

          <div className="md:col-span-5 flex items-center justify-end gap-2">
            <div className="relative group">
              <Button
                variant="outline"
                className="h-11 rounded-xl border-slate-100 font-bold">
                <Filter size={18} className="mr-2" /> Colunas
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover:block z-50">
                {[
                  { id: "contato", label: "Contato" },
                  { id: "performance", label: "Performance" },
                  { id: "status", label: "Status" },
                  { id: "inicio", label: "Início" },
                ].map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(cols as any)[col.id]}
                      onChange={(e) =>
                        setCols({ ...cols, [col.id]: e.target.checked })
                      }
                      className="rounded text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {col.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className={cn(
                "rounded-xl h-11 w-11",
                viewMode === "list"
                  ? "shadow-lg shadow-primary/20"
                  : "border-slate-100"
              )}
              onClick={() => setViewMode("list")}>
              <List size={20} />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className={cn(
                "rounded-xl h-11 w-11",
                viewMode === "grid"
                  ? "shadow-lg shadow-primary/20"
                  : "border-slate-100"
              )}
              onClick={() => setViewMode("grid")}>
              <LayoutGrid size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Motorista
                  </th>
                  {cols.contato && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Contato
                    </th>
                  )}
                  {cols.performance && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Performance
                    </th>
                  )}
                  {cols.status && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                  )}
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {itensPagina.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                          <AvatarImage src={m.fotoPerfil} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {m.nome.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900">{m.nome}</p>
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
                              {m.pontuacao.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp size={14} className="text-blue-500" />
                            <span className="text-sm font-bold text-slate-700">
                              {m.numeroViagens} vgs
                            </span>
                          </div>
                        </div>
                      </td>
                    )}
                    {cols.status && (
                      <td className="px-6 py-4">
                        <Badge
                          variant={getStatusVariant(m.status)}
                          className="rounded-lg px-2 py-0.5 uppercase text-[10px] font-black tracking-widest border-none">
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
                            className="rounded-xl opacity-0 group-hover:opacity-100">
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl border-slate-100 shadow-xl">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/motoristas/${m.id}`}
                              className="flex items-center gap-2 font-medium">
                              <Eye size={16} /> Ver perfil
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/motoristas/editar/${m.id}`}
                              className="flex items-center gap-2 font-medium">
                              <Edit size={16} /> Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 flex items-center gap-2 font-medium cursor-pointer"
                            onClick={() => handleStatusChange(m.id, m.status)}>
                            {m.status === "suspenso" ? (
                              <CheckCircle size={16} />
                            ) : (
                              <Ban size={16} />
                            )}
                            {m.status === "suspenso"
                              ? "Reativar"
                              : "Suspensório"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 font-bold flex items-center gap-2 cursor-pointer"
                            onClick={() => handleDelete(m.id)}>
                            <Trash2 size={16} /> Excluir
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {itensPagina.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Card className="border-none shadow-sm hover:shadow-md transition-all group rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between space-y-0">
                  <Badge
                    variant={getStatusVariant(m.status)}
                    className="rounded-lg px-2 py-0.5 uppercase text-[10px] font-black tracking-widest border-none">
                    {m.status}
                  </Badge>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star
                      size={12}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-xs font-black text-yellow-700">
                      {m.pontuacao.toFixed(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Avatar className="w-20 h-20 mx-auto border-4 border-slate-50 shadow-sm mb-4">
                    <AvatarImage src={m.fotoPerfil} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {m.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">
                    {m.nome}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium mb-4">
                    {m.viaturaModelo || "Sem viatura alocada"}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-6 text-left">
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Viagens
                      </p>
                      <p className="text-sm font-black text-slate-700">
                        {m.numeroViagens}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Ganhos
                      </p>
                      <p className="text-sm font-black text-slate-700">
                        {formatarMoeda(m.ganhoTotal)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-10 font-bold border-slate-100 hover:bg-slate-50"
                        asChild>
                        <Link href={`/admin/motoristas/${m.id}`}>
                          Ver perfil
                        </Link>
                      </Button>
                      <Button
                        className="flex-1 rounded-xl h-10 font-bold shadow-sm"
                        asChild>
                        <Link href={`/admin/motoristas/editar/${m.id}`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold h-9 rounded-lg"
                        onClick={() => handleStatusChange(m.id, m.status)}>
                        {m.status === "suspenso" ? "Reativar" : "Suspensório"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-red-700 hover:text-red-800 hover:bg-red-50 font-bold h-9 rounded-lg"
                        onClick={() => handleDelete(m.id)}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {itensPagina.length === 0 && (
        <div className="py-24 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Users size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Nenhum motorista encontrado
          </h2>
          <p className="text-slate-500">Tente ajustar sua busca ou filtros.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="rounded-xl font-bold">
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={pagina === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPagina(p)}
                className={cn(
                  "w-9 h-9 p-0 rounded-xl font-bold",
                  pagina === p ? "shadow-lg shadow-primary/20" : ""
                )}>
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="rounded-xl font-bold">
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
}
