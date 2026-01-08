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
  MapPin,
  TrendingUp,
  Calendar,
  Download,
  X,
  List,
  LayoutGrid,
  User,
  Car,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import GlobalLoading from "@/app/loading";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

// Mock data - em produção viria da API
const mockClientes = [
  {
    id: "CLI-001",
    nome: "Ana Silva Santos",
    email: "ana.silva@email.com",
    telefone: "+244 923 456 789",
    dataCadastro: "2024-01-15",
    totalViagens: 23,
    totalGasto: 450000,
    status: "ativo",
    ultimaViagem: "2024-12-20",
    avaliacaoMedia: 4.8,
    endereco: "Talatona, Luanda",
    preferencias: ["carro conforto", "pagamento mpsi"],
  },
  {
    id: "CLI-002",
    nome: "Carlos Manuel",
    email: "carlos.m@email.com",
    telefone: "+244 912 345 678",
    dataCadastro: "2024-02-20",
    totalViagens: 15,
    totalGasto: 280000,
    status: "ativo",
    ultimaViagem: "2024-12-18",
    avaliacaoMedia: 4.5,
    endereco: "Kilamba Kiaxi, Luanda",
    preferencias: ["van", "pagamento multicaixa"],
  },
  {
    id: "CLI-003",
    nome: "Maria João",
    email: "maria.joao@email.com",
    telefone: "+244 934 567 890",
    dataCadastro: "2024-03-10",
    totalViagens: 8,
    totalGasto: 120000,
    status: "inativo",
    ultimaViagem: "2024-10-15",
    avaliacaoMedia: 4.2,
    endereco: "Samba, Luanda",
    preferencias: ["carro economico", "pagamento dinheiro"],
  },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState(mockClientes);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("nome");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [cols, setCols] = useState({
    contato: true,
    estatisticas: true,
    status: true,
    cadastro: true,
  });

  const filtrados = clientes.filter((c) => {
    const matchBusca =
      !busca.trim() ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.email.toLowerCase().includes(busca.toLowerCase()) ||
      c.telefone.includes(busca) ||
      c.id.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = !status || c.status === status;

    return matchBusca && matchStatus;
  });

  const ordenados = [...filtrados].sort((a, b) => {
    const av = (a as any)[sortKey] || "";
    const bv = (b as any)[sortKey] || "";
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

  const stats = {
    total: clientes.length,
    ativos: clientes.filter((c) => c.status === "ativo").length,
    inativos: clientes.filter((c) => c.status === "inativo").length,
    receitaTotal: clientes.reduce((sum, c) => sum + c.totalGasto, 0),
    viagensTotal: clientes.reduce((sum, c) => sum + c.totalViagens, 0),
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ativo":
        return "success";
      case "inativo":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <GlobalLoading />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-none">
              <Users size={24} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">{stats.total}</p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Total
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Clientes Cadastrados</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-50 p-3 rounded-none">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {stats.ativos}
              </p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Ativos
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Em Atividade</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-50 p-3 rounded-none">
              <Car size={24} className="text-amber-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {stats.viagensTotal}
              </p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Viagens
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Total Realizadas</p>
        </div>
        /{" "}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Gestão de Clientes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie e monitore o cadastro de clientes
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
                  "dataCadastro",
                  "totalViagens",
                  "totalGasto",
                ];
                const rows = ordenados.map((c) =>
                  headers.map((h) => (c as any)[h] ?? "").join(",")
                );
                const csv = [headers.join(","), ...rows].join("\n");
                const blob = new Blob([csv], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "clientes.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded-xl h-11 px-4 font-bold border-slate-100 hover:bg-slate-50">
              <Download size={18} className="mr-2" />
              Exportar
            </Button>
            <Link href="/admin/clientes/novo">
              <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" /> Novo Cliente
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, email, telefone ou ID..."
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
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <Input
              type="date"
              className="h-11 rounded-xl border-slate-100 text-slate-500 text-xs"
              placeholder="Data Início"
            />
          </div>

          <div className="md:col-span-3">
            <Input
              type="date"
              className="h-11 rounded-xl border-slate-100 text-slate-500 text-xs"
              placeholder="Data Fim"
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
              <option value="totalViagens">Ordenar: Viagens</option>
              <option value="totalGasto">Ordenar: Gasto</option>
              <option value="dataCadastro">Ordenar: Cadastro</option>
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
                  { id: "estatisticas", label: "Estatísticas" },
                  { id: "status", label: "Status" },
                  { id: "cadastro", label: "Cadastro" },
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
                    Cliente
                  </th>
                  {cols.contato && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Contato
                    </th>
                  )}
                  {cols.estatisticas && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Estatísticas
                    </th>
                  )}
                  {cols.status && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                  )}
                  {cols.cadastro && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Cadastro
                    </th>
                  )}
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {itensPagina.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-24 text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 opacity-30" />
                        <p className="text-lg font-medium">
                          Nenhum cliente encontrado
                        </p>
                        <p className="text-sm opacity-70">
                          Tente ajustar os filtros ou busca
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  itensPagina.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {cliente.nome}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              ID: {cliente.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      {cols.contato && (
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Mail size={12} className="text-slate-400" />
                              {cliente.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Phone size={12} className="text-slate-400" />
                              {cliente.telefone}
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
                                  {cliente.totalViagens}
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
                                  }).format(cliente.totalGasto)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star
                                size={14}
                                className="text-yellow-500 fill-yellow-500"
                              />
                              <span className="text-sm font-bold text-slate-700">
                                {cliente.avaliacaoMedia.toFixed(1)}
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
                              cliente.status === "ativo"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            )}>
                            {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                      )}
                      {cols.cadastro && (
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Calendar size={12} className="text-slate-400" />
                              {format(
                                new Date(cliente.dataCadastro),
                                "dd/MM/yyyy"
                              )}
                            </div>
                            <div className="text-xs text-slate-400">
                              Última:{" "}
                              {format(
                                new Date(cliente.ultimaViagem),
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
                                href={`/admin/clientes/${cliente.id}`}
                                className="flex items-center gap-2 w-full">
                                <Eye size={16} />
                                Ver Perfil
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer font-medium rounded-lg">
                              <Edit size={16} />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer font-medium text-red-600 rounded-lg">
                              <Trash2 size={16} />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itensPagina.map((cliente) => (
            <Card
              key={cliente.id}
              className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {cliente.nome}
                      </p>
                      <p className="text-xs text-slate-400">{cliente.id}</p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "border-none px-2 py-1 rounded-full font-bold uppercase text-[9px] tracking-wider",
                      cliente.status === "ativo"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    )}>
                    {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail size={12} className="text-slate-400" />
                      {cliente.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone size={12} className="text-slate-400" />
                      {cliente.telefone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin size={12} className="text-slate-400" />
                      {cliente.endereco}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Car size={12} className="text-blue-500" />
                        <span className="text-xs font-bold text-slate-700">
                          {cliente.totalViagens}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star
                          size={12}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          {cliente.avaliacaoMedia.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-green-600">
                      {new Intl.NumberFormat("pt-AO", {
                        style: "currency",
                        currency: "AOA",
                        maximumFractionDigits: 0,
                      }).format(cliente.totalGasto)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Mostrando {(pagina - 1) * pageSize + 1} a{" "}
            {Math.min(pagina * pageSize, ordenados.length)} de{" "}
            {ordenados.length} resultados
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina(pagina - 1)}
              disabled={pagina === 1}
              className="rounded-lg">
              Anterior
            </Button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={pagina === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPagina(p)}
                className={cn(
                  "rounded-lg",
                  pagina === p && "shadow-lg shadow-primary/20"
                )}>
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina(pagina + 1)}
              disabled={pagina === totalPaginas}
              className="rounded-lg">
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
