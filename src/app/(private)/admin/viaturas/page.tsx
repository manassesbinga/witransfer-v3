/** @format */

"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  Eye,
  Car,
  TrendingUp,
  AlertTriangle,
  Settings,
  Filter,
  LayoutGrid,
  List,
  Gauge,
  Users,
  Fuel,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusViatura, Viatura } from "../../../../types/viatura";
import { getCarsAction } from "../../actions/cars/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import GlobalLoading from "@/app/loading";

const Viaturas = () => {
  const router = useRouter();
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusViatura | "">("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [minKm, setMinKm] = useState<number>(0);
  const [sortKey, setSortKey] = useState<keyof Viatura>("modelo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [cols, setCols] = useState({
    motorista: true,
    lugares: true,
    arCondicionado: true,
    status: true,
  });

  const fetchViaturas = async () => {
    setLoading(true);
    try {
      const result = await getCarsAction();
      if (result.success) {
        // Mapear dados do backend para o formato da UI se necessário
        const data = result.data.map((item: any) => ({
          ...item,
          // Fallbacks para campos que podem ter nomes diferentes no backend
          modelo: item.modelo || item.name || "Sem modelo",
          marca: item.marca,
          matricula: item.matricula || `ID-${item.id.slice(0, 4)}`,
          status: item.status || "ativa",
          kilometragem: item.kilometragem || item.quilometragemAtual || 0,
        }));
        setViaturas(data);
      }
    } catch (error) {
      toast.error("Erro ao carregar frota");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchViaturas();
  }, []);

  // Filter viaturas
  const viaturasFiltradas = viaturas.filter((viatura) => {
    const matchesSearch =
      viatura.matricula.toLowerCase().includes(busca.toLowerCase()) ||
      viatura.modelo.toLowerCase().includes(busca.toLowerCase()) ||
      viatura.motoristanome?.toLowerCase().includes(busca.toLowerCase());

    const matchesStatus = statusFiltro ? viatura.status === statusFiltro : true;
    const matchesKm = viatura.kilometragem >= minKm;

    return matchesSearch && matchesStatus && matchesKm;
  });

  // Sort
  const viaturasOrdenadas = React.useMemo(() => {
    const arr = [...viaturasFiltradas];
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
  }, [viaturasFiltradas, sortKey, sortDir]);

  // Statistics
  const stats = {
    total: viaturas.length,
    ativas: viaturas.filter((v) => v.status === "ativa").length,
    manutencao: viaturas.filter((v) => v.status === "manutencao").length,
    inativas: viaturas.filter((v) => v.status === "inativa").length,
  };

  // Pagination
  const itensPorPagina = pageSize;
  const totalPaginas = Math.ceil(viaturasOrdenadas.length / itensPorPagina);
  const dadosPagina = viaturasOrdenadas.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta viatura?")) {
      console.log("Deleting viatura with id:", id);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "ativa":
        return "success";
      case "inativa":
        return "destructive";
      case "manutencao":
        return "warning";
      case "inspecao":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards - COR ÚNICA AZUL SUAVE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-none">
              <Car size={24} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">{stats.total}</p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Viaturas
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Total de Frota</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-50 p-3 rounded-none">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {stats.ativas}
              </p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Operacionais
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Viaturas Ativas</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-50 p-3 rounded-none">
              <Settings size={24} className="text-amber-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {stats.manutencao}
              </p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Em Serviço
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Manutenção</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-none p-6 text-slate-900 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-rose-50 p-3 rounded-none">
              <AlertTriangle size={24} className="text-rose-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight">
                {stats.inativas}
              </p>
              <p className="text-slate-500 text-xs uppercase font-medium tracking-wider">
                Paradas
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Viaturas Inativas</p>
        </div>
      </div>

      {/* Header & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Frota de Veículos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie todos os veículos da sua frota
            </p>
          </div>
          <Button
            onClick={() => router.push("/admin/viaturas/novo")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
            <Plus size={20} />
            Nova Viatura
          </Button>
        </div>

        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              className="pl-4 pr-10 py-2.5 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 w-full text-sm"
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

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFiltro}
              onChange={(e) => {
                setStatusFiltro(e.target.value as StatusViatura | "");
                setPagina(1);
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none bg-white cursor-pointer h-[42px]">
              <option value="">Todos Status</option>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
              <option value="manutencao">Manutenção</option>
              <option value="inspecao">Inspeção</option>
            </select>
          </div>

          {/* Min KM */}
          <div className="md:col-span-2">
            <input
              type="number"
              min={0}
              value={minKm}
              onChange={(e) => {
                setMinKm(parseInt(e.target.value || "0"));
                setPagina(1);
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
              placeholder="KM mínimo"
            />
          </div>

          {/* Data campos vazios por agora */}
          <div className="md:col-span-2">
            <input
              type="date"
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
              placeholder="Data início"
            />
          </div>

          <div className="md:col-span-2">
            <input
              type="date"
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
              placeholder="Data fim"
            />
          </div>
        </div>

        {/* Filters Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortKey as string}
              onChange={(e) => setSortKey(e.target.value as keyof Viatura)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]">
              <option value="modelo">Ordenar: Modelo</option>
              <option value="matricula">Ordenar: Matrícula</option>
              <option value="ano">Ordenar: Ano</option>
              <option value="kilometragem">Ordenar: Quilometragem</option>
              <option value="status">Ordenar: Status</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div className="md:col-span-2">
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]">
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          {/* Page Size */}
          <div className="md:col-span-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPagina(1);
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]">
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          {/* View Mode + Columns */}
          <div className="md:col-span-5 flex items-center justify-end gap-2">
            <div className="relative group inline-block">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors h-[42px]">
                <Filter size={18} />
                Colunas
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 hidden group-hover:block z-10">
                <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cols.motorista}
                    onChange={(e) =>
                      setCols({ ...cols, motorista: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Motorista
                </label>
                <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cols.lugares}
                    onChange={(e) =>
                      setCols({ ...cols, lugares: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Lugares
                </label>
                <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cols.arCondicionado}
                    onChange={(e) =>
                      setCols({ ...cols, arCondicionado: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Ar-condicionado
                </label>
                <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cols.status}
                    onChange={(e) =>
                      setCols({ ...cols, status: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Status
                </label>
              </div>
            </div>

            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Lista">
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Grade">
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Matrícula
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Veículo
                  </th>
                  {cols.motorista && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Motorista
                    </th>
                  )}
                  {cols.lugares && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lugares
                    </th>
                  )}
                  {cols.arCondicionado && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ar-condicionado
                    </th>
                  )}
                  {cols.status && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  )}
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dadosPagina.map((viatura) => (
                  <tr
                    key={viatura.id}
                    className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-xl">
                          <Car size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {viatura.matricula}
                          </p>
                          <p className="text-xs text-gray-500">{viatura.ano}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {viatura.modelo}
                        </p>
                        <p className="text-sm text-gray-500">
                          {viatura.marca} • {viatura.cor}
                        </p>
                      </div>
                    </td>
                    {cols.motorista && (
                      <td className="px-6 py-4">
                        {viatura.motoristanome ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {viatura.motoristanome.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {viatura.motoristanome}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Não alocado
                          </span>
                        )}
                      </td>
                    )}
                    {cols.lugares && (
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {viatura.lugares} lugares
                        </span>
                      </td>
                    )}
                    {cols.arCondicionado && (
                      <td className="px-6 py-4">
                        {viatura.arCondicionado ? (
                          <span className="inline-flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-1" /> Sim
                          </span>
                        ) : (
                          <span className="text-gray-500">Não</span>
                        )}
                      </td>
                    )}
                    {cols.status && (
                      <td className="px-6 py-4">
                        <Badge variant={getBadgeVariant(viatura.status) as any}>
                          {viatura.status.charAt(0).toUpperCase() +
                            viatura.status.slice(1)}
                        </Badge>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/viaturas/${viatura.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalhes">
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() =>
                            router.push(`/admin/viaturas/${viatura.id}`)
                          }
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Editar">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(viatura.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {dadosPagina.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center">
                      <Car size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        Nenhuma viatura encontrada
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Tente ajustar os filtros de busca
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {dadosPagina.map((viatura) => (
            <div
              key={viatura.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-48 from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                <Car
                  size={64}
                  className="text-gray-300 group-hover:scale-110 transition-transform duration-300"
                />

                <div className="absolute top-3 right-3">
                  <Badge
                    variant={getBadgeVariant(viatura.status) as any}
                    className="shadow-lg">
                    {viatura.status.charAt(0).toUpperCase() +
                      viatura.status.slice(1)}
                  </Badge>
                </div>

                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
                  <p className="text-xs text-gray-500">Matrícula</p>
                  <p className="font-bold text-gray-900">{viatura.matricula}</p>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {viatura.modelo}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {viatura.marca} • {viatura.ano} • {viatura.cor}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="bg-blue-50 p-1.5 rounded-lg">
                      <Users size={14} className="text-blue-600" />
                    </div>
                    <span className="text-gray-700">
                      {viatura.lugares} lugares
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="bg-blue-50 p-1.5 rounded-lg">
                      <Fuel size={14} className="text-blue-600" />
                    </div>
                    <span className="text-gray-700">
                      {viatura.tipoCombustivel || "Gasolina"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="bg-blue-50 p-1.5 rounded-lg">
                      <Gauge size={14} className="text-blue-600" />
                    </div>
                    <span className="text-gray-700">
                      {viatura.kilometragem.toLocaleString()} km
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`${
                        viatura.arCondicionado ? "bg-blue-50" : "bg-gray-50"
                      } p-1.5 rounded-lg`}>
                      <Check
                        size={14}
                        className={
                          viatura.arCondicionado
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      />
                    </div>
                    <span className="text-gray-700">
                      {viatura.arCondicionado ? "Com AC" : "Sem AC"}
                    </span>
                  </div>
                </div>

                {viatura.motoristanome && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
                    <p className="text-xs text-blue-700 mb-1">
                      Motorista Responsável
                    </p>
                    <p className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                        {viatura.motoristanome.charAt(0)}
                      </div>
                      {viatura.motoristanome}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/admin/viaturas/${viatura.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Eye size={16} />
                    Ver Detalhes
                  </Link>
                  <button
                    onClick={() => handleDelete(viatura.id)}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {dadosPagina.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Car size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                Nenhuma viatura encontrada
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {viaturasOrdenadas.length > 0 && totalPaginas > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}>
            Anterior
          </Button>
          <div className="flex items-center px-4 font-medium text-sm">
            Página {pagina} de {totalPaginas}
          </div>
          <Button
            variant="outline"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina((p) => p + 1)}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
};

export default Viaturas;
