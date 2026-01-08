"use client"

import { useState } from "react"
import { Car, Download, Eye, Edit, Ban, Trash2, List, LayoutGrid, Filter, X, Navigation, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

const viagens = [
  {
    id: 1,
    cliente: "João Silva",
    motorista: "Pedro Costa",
    origem: "Talatona",
    destino: "Aeroporto 4 de Fevereiro",
    valor: "8.500 Kz",
    data: "15/01/2024",
    hora: "14:30",
    status: "concluida",
    distancia: "12 km",
  },
  {
    id: 2,
    cliente: "Maria Santos",
    motorista: "Lucas Pereira",
    origem: "Miramar",
    destino: "Viana",
    valor: "15.000 Kz",
    data: "15/01/2024",
    hora: "13:45",
    status: "em_andamento",
    distancia: "22 km",
  },
  {
    id: 3,
    cliente: "Ana Ferreira",
    motorista: "André Santos",
    origem: "Benfica",
    destino: "Mutamba",
    valor: "6.200 Kz",
    data: "15/01/2024",
    hora: "12:20",
    status: "concluida",
    distancia: "8 km",
  },
  {
    id: 4,
    cliente: "Carlos Mendes",
    motorista: "Pedro Costa",
    origem: "Kilamba",
    destino: "Talatona",
    valor: "12.800 Kz",
    data: "15/01/2024",
    hora: "11:00",
    status: "cancelada",
    distancia: "18 km",
  },
  {
    id: 5,
    cliente: "Sofia Nunes",
    motorista: "Manuel Sousa",
    origem: "Maianga",
    destino: "Patriota",
    valor: "9.500 Kz",
    data: "14/01/2024",
    hora: "16:15",
    status: "concluida",
    distancia: "14 km",
  },
]

const driverLocations = [
  { id: 1, nome: "Pedro Costa", lat: -8.838333, lng: 13.234444, status: "online", viatura: "Toyota Corolla" },
  { id: 2, nome: "Lucas Pereira", lat: -8.815, lng: 13.23, status: "em_viagem", viatura: "Honda Civic" },
  { id: 3, nome: "Manuel Sousa", lat: -8.85, lng: 13.25, status: "online", viatura: "Hyundai Elantra" },
  { id: 4, nome: "André Santos", lat: -8.825, lng: 13.22, status: "em_viagem", viatura: "Kia Cerato" },
]

export function ViagensContent() {
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [sortKey, setSortKey] = useState("data")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [pageSize, setPageSize] = useState(10)
  const [pagina, setPagina] = useState(1)
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null)
  const [cols, setCols] = useState({
    motorista: true,
    origem: true,
    destino: true,
    valor: true,
    status: true,
  })

  const filteredViagens = viagens.filter((viagem) => {
    const matchSearch =
      viagem.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      viagem.motorista.toLowerCase().includes(busca.toLowerCase()) ||
      viagem.origem.toLowerCase().includes(busca.toLowerCase()) ||
      viagem.destino.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = statusFiltro ? viagem.status === statusFiltro : true
    return matchSearch && matchStatus
  })

  const stats = {
    total: viagens.length,
    concluidas: viagens.filter((v) => v.status === "concluida").length,
    emAndamento: viagens.filter((v) => v.status === "em_andamento").length,
    canceladas: viagens.filter((v) => v.status === "cancelada").length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "concluida":
        return <span className="text-green-600 font-medium">concluída</span>
      case "em_andamento":
        return <span className="text-blue-600 font-medium">em andamento</span>
      case "cancelada":
        return <span className="text-red-600 font-medium">cancelada</span>
      default:
        return <span className="text-gray-500">{status}</span>
    }
  }

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "em_viagem":
        return "bg-blue-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestão de Viagens</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Car size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-blue-100 text-sm">Viagens</p>
            </div>
          </div>
          <p className="text-blue-100">Total de Viagens</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Navigation size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.concluidas}</p>
              <p className="text-blue-100 text-sm">Concluídas</p>
            </div>
          </div>
          <p className="text-blue-100">Viagens Concluídas</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Car size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.emAndamento}</p>
              <p className="text-blue-100 text-sm">Em Andamento</p>
            </div>
          </div>
          <p className="text-blue-100">Viagens Ativas</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Ban size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.canceladas}</p>
              <p className="text-blue-100 text-sm">Canceladas</p>
            </div>
          </div>
          <p className="text-blue-100">Viagens Canceladas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Histórico de Viagens</h2>
            <p className="text-sm text-blue-600 mt-1">Gerencie e monitore todas as viagens</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download size={18} />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <div className="md:col-span-4 relative">
            <input
              type="text"
              placeholder="Buscar por ID, Cliente ou Motorista..."
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
              <option value="concluida">Concluída</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <input
              type="date"
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
            />
          </div>

          <div className="md:col-span-3">
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
              <option value="data">Data: Mais Recentes</option>
              <option value="valor">Ordenar: Valor</option>
              <option value="cliente">Ordenar: Cliente</option>
              <option value="motorista">Ordenar: Motorista</option>
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
                  Cliente
                </th>
                {cols.motorista && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Motorista
                  </th>
                )}
                {cols.origem && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Origem
                  </th>
                )}
                {cols.destino && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Destino
                  </th>
                )}
                {cols.valor && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Valor
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
              {filteredViagens.map((viagem) => (
                <tr key={viagem.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {viagem.cliente.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{viagem.cliente}</p>
                        <p className="text-xs text-gray-500">
                          {viagem.data} às {viagem.hora}
                        </p>
                      </div>
                    </div>
                  </td>
                  {cols.motorista && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {viagem.motorista.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{viagem.motorista}</span>
                      </div>
                    </td>
                  )}
                  {cols.origem && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-green-500" />
                        <span className="text-sm text-gray-600">{viagem.origem}</span>
                      </div>
                    </td>
                  )}
                  {cols.destino && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-red-500" />
                        <span className="text-sm text-gray-600">{viagem.destino}</span>
                      </div>
                    </td>
                  )}
                  {cols.valor && (
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{viagem.valor}</span>
                    </td>
                  )}
                  {cols.status && <td className="px-6 py-4">{getStatusBadge(viagem.status)}</td>}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Localização dos Motoristas</h2>
            <p className="text-sm text-blue-600 mt-1">Acompanhe em tempo real a posição dos motoristas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 relative h-[400px] bg-gray-100 rounded-xl overflow-hidden">
            <img src="/luanda-angola-street-map-satellite-view.jpg" alt="Mapa de Luanda" className="w-full h-full object-cover" />
            {/* Driver Markers */}
            {driverLocations.map((driver) => (
              <button
                key={driver.id}
                onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                  selectedDriver === driver.id ? "scale-125 z-20" : "z-10"
                }`}
                style={{
                  left: `${((driver.lng - 13.2) / 0.1) * 100}%`,
                  top: `${((driver.lat + 8.9) / 0.15) * 100}%`,
                }}
              >
                <div
                  className={`w-10 h-10 rounded-full ${getDriverStatusColor(driver.status)} flex items-center justify-center text-white font-bold shadow-lg border-2 border-white`}
                >
                  {driver.nome.charAt(0)}
                </div>
                {selectedDriver === driver.id && (
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-3 min-w-[180px] z-30">
                    <p className="font-semibold text-gray-900">{driver.nome}</p>
                    <p className="text-xs text-gray-500">{driver.viatura}</p>
                    <p className={`text-xs mt-1 ${driver.status === "online" ? "text-green-600" : "text-blue-600"}`}>
                      {driver.status === "online" ? "Disponível" : "Em viagem"}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Driver List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-4">Motoristas Ativos</h3>
            {driverLocations.map((driver) => (
              <button
                key={driver.id}
                onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedDriver === driver.id ? "bg-blue-50 border-blue-200 border" : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full ${getDriverStatusColor(driver.status)} flex items-center justify-center text-white font-bold`}
                >
                  {driver.nome.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{driver.nome}</p>
                  <p className="text-xs text-gray-500">{driver.viatura}</p>
                </div>
                <div
                  className={`ml-auto w-2 h-2 rounded-full ${driver.status === "online" ? "bg-green-500" : "bg-blue-500"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
