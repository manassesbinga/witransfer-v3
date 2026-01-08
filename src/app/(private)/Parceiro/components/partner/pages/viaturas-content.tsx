"use client"

import { useState } from "react"
import { Car, Download, Plus, Eye, Edit, Ban, Trash2, List, LayoutGrid, Filter, X, Wrench, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const viaturas = [
  {
    id: 1,
    modelo: "Toyota Corolla",
    marca: "Toyota",
    cor: "Branco",
    placa: "LD-45-78-AB",
    ano: 2022,
    motorista: "Pedro Costa",
    km: 45230,
    lugares: 5,
    arCondicionado: true,
    status: "ativa",
    dataCadastro: "10/05/2023",
  },
  {
    id: 2,
    modelo: "Honda Civic",
    marca: "Honda",
    cor: "Preto",
    placa: "LD-32-56-CD",
    ano: 2021,
    motorista: "Lucas Pereira",
    km: 62450,
    lugares: 5,
    arCondicionado: true,
    status: "ativa",
    dataCadastro: "22/06/2023",
  },
  {
    id: 3,
    modelo: "Hyundai Elantra",
    marca: "Hyundai",
    cor: "Cinza",
    placa: "LD-67-89-EF",
    ano: 2023,
    motorista: "Manuel Sousa",
    km: 28120,
    lugares: 5,
    arCondicionado: true,
    status: "manutencao",
    dataCadastro: "15/07/2023",
  },
  {
    id: 4,
    modelo: "Kia Cerato",
    marca: "Kia",
    cor: "Azul",
    placa: "LD-12-34-GH",
    ano: 2022,
    motorista: "André Santos",
    km: 51890,
    lugares: 5,
    arCondicionado: false,
    status: "ativa",
    dataCadastro: "03/08/2023",
  },
  {
    id: 5,
    modelo: "Nissan Sentra",
    marca: "Nissan",
    cor: "Prata",
    placa: "LD-89-01-IJ",
    ano: 2021,
    motorista: "",
    km: 78340,
    lugares: 5,
    arCondicionado: true,
    status: "inativa",
    dataCadastro: "18/09/2023",
  },
]

export function ViaturasContent() {
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("")
  const [minKm, setMinKm] = useState(0)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sortKey, setSortKey] = useState("modelo")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [pageSize, setPageSize] = useState(10)
  const [pagina, setPagina] = useState(1)
  const [cols, setCols] = useState({
    motorista: true,
    lugares: true,
    arCondicionado: true,
    status: true,
  })

  const filteredViaturas = viaturas.filter((viatura) => {
    const matchSearch =
      viatura.modelo.toLowerCase().includes(busca.toLowerCase()) ||
      viatura.placa.toLowerCase().includes(busca.toLowerCase()) ||
      viatura.motorista?.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = statusFiltro ? viatura.status === statusFiltro : true
    const matchKm = viatura.km >= minKm
    return matchSearch && matchStatus && matchKm
  })

  const stats = {
    total: viaturas.length,
    ativas: viaturas.filter((v) => v.status === "ativa").length,
    manutencao: viaturas.filter((v) => v.status === "manutencao").length,
    inativas: viaturas.filter((v) => v.status === "inativa").length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativa":
        return <span className="text-green-600 font-medium">Ativa</span>
      case "manutencao":
        return <span className="text-amber-600 font-medium">Manutenção</span>
      case "inativa":
        return <span className="text-gray-500 font-medium">Inativa</span>
      default:
        return <span className="text-gray-500">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestão de Viaturas</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Car size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-blue-100 text-sm">Viaturas</p>
            </div>
          </div>
          <p className="text-blue-100">Total de Frota</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Car size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.ativas}</p>
              <p className="text-blue-100 text-sm">Operacionais</p>
            </div>
          </div>
          <p className="text-blue-100">Viaturas Ativas</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Wrench size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.manutencao}</p>
              <p className="text-blue-100 text-sm">Em Serviço</p>
            </div>
          </div>
          <p className="text-blue-100">Manutenção</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Ban size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.inativas}</p>
              <p className="text-blue-100 text-sm">Paradas</p>
            </div>
          </div>
          <p className="text-blue-100">Viaturas Inativas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Frota de Veículos</h2>
            <p className="text-sm text-blue-600 mt-1">Gerencie todos os veículos da sua frota</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download size={18} />
              Exportar CSV
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
                  <Plus size={20} />
                  Nova Viatura
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Viatura</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input id="modelo" placeholder="Ex: Toyota Corolla" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="placa">Matrícula</Label>
                      <Input id="placa" placeholder="LD-XX-XX-XX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ano">Ano</Label>
                      <Input id="ano" type="number" placeholder="2024" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motorista">Motorista Atribuído</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um motorista" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pedro">Pedro Costa</SelectItem>
                        <SelectItem value="lucas">Lucas Pereira</SelectItem>
                        <SelectItem value="manuel">Manuel Sousa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Cadastrar Viatura</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <div className="md:col-span-4 relative">
            <input
              type="text"
              placeholder="Buscar por modelo, matrícula ou motorista..."
              className="pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm outline-none"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setPagina(1)
              }}
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFiltro}
              onChange={(e) => {
                setStatusFiltro(e.target.value)
                setPagina(1)
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none bg-white cursor-pointer h-[42px]"
            >
              <option value="">Todos Status</option>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
              <option value="manutencao">Manutenção</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <input
              type="number"
              min={0}
              value={minKm}
              onChange={(e) => {
                setMinKm(Number.parseInt(e.target.value || "0"))
                setPagina(1)
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
              placeholder="KM mínimo"
            />
          </div>

          <div className="md:col-span-2">
            <input
              type="date"
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
            />
          </div>

          <div className="md:col-span-2">
            <input
              type="date"
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
            />
          </div>
        </div>

        {/* Filters Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
            >
              <option value="modelo">Ordenar: Modelo</option>
              <option value="placa">Ordenar: Matrícula</option>
              <option value="ano">Ordenar: Ano</option>
              <option value="km">Ordenar: Quilometragem</option>
              <option value="status">Ordenar: Status</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number.parseInt(e.target.value, 10))
                setPagina(1)
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          <div className="md:col-span-5 flex items-center justify-end gap-2">
            <div className="relative group inline-block">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors h-[42px]">
                <Filter size={18} />
                Colunas
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 hidden group-hover:block z-10">
                {Object.entries(cols).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setCols({ ...cols, [key]: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "list" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
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
              {filteredViaturas.map((viatura) => (
                <tr key={viatura.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Car size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{viatura.placa}</p>
                        <p className="text-xs text-gray-500">{viatura.ano}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{viatura.modelo}</p>
                      <p className="text-sm text-gray-500">
                        {viatura.marca} • {viatura.cor}
                      </p>
                    </div>
                  </td>
                  {cols.motorista && (
                    <td className="px-6 py-4">
                      {viatura.motorista ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {viatura.motorista.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{viatura.motorista}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Não alocado</span>
                      )}
                    </td>
                  )}
                  {cols.lugares && (
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{viatura.lugares} lugares</span>
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
                  {cols.status && <td className="px-6 py-4">{getStatusBadge(viatura.status)}</td>}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Ban size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
