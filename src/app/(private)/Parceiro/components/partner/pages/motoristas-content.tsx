"use client"

import { useState } from "react"
import { Users, Download, Plus, Eye, Edit, Ban, Trash2, Star, List, LayoutGrid, Filter, X, Car } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const motoristas = [
  {
    id: 1,
    nome: "Pedro Costa",
    email: "pedro@email.com",
    telefone: "+244 923 111222",
    viagens: 145,
    avaliacao: 4.9,
    status: "online",
    dataCadastro: "10/05/2023",
  },
  {
    id: 2,
    nome: "Lucas Pereira",
    email: "lucas@email.com",
    telefone: "+244 912 222333",
    viagens: 132,
    avaliacao: 4.8,
    status: "online",
    dataCadastro: "22/06/2023",
  },
  {
    id: 3,
    nome: "Manuel Sousa",
    email: "manuel@email.com",
    telefone: "+244 934 333444",
    viagens: 98,
    avaliacao: 4.7,
    status: "offline",
    dataCadastro: "15/07/2023",
  },
  {
    id: 4,
    nome: "André Santos",
    email: "andre@email.com",
    telefone: "+244 945 444555",
    viagens: 87,
    avaliacao: 4.6,
    status: "em_viagem",
    dataCadastro: "03/08/2023",
  },
  {
    id: 5,
    nome: "Ricardo Neto",
    email: "ricardo@email.com",
    telefone: "+244 956 555666",
    viagens: 76,
    avaliacao: 4.5,
    status: "suspenso",
    dataCadastro: "18/09/2023",
  },
]

export function MotoristasContent() {
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sortKey, setSortKey] = useState("nome")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [pageSize, setPageSize] = useState(10)
  const [pagina, setPagina] = useState(1)
  const [cols, setCols] = useState({
    email: true,
    telefone: true,
    viagens: true,
    status: true,
    dataCadastro: true,
  })

  const filteredMotoristas = motoristas.filter((motorista) => {
    const matchSearch =
      motorista.nome.toLowerCase().includes(busca.toLowerCase()) ||
      motorista.email.toLowerCase().includes(busca.toLowerCase()) ||
      motorista.telefone.includes(busca)
    const matchStatus = statusFiltro ? motorista.status === statusFiltro : true
    return matchSearch && matchStatus
  })

  const stats = {
    total: motoristas.length,
    online: motoristas.filter((m) => m.status === "online").length,
    emViagem: motoristas.filter((m) => m.status === "em_viagem").length,
    suspensos: motoristas.filter((m) => m.status === "suspenso").length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <span className="text-green-600 font-medium">online</span>
      case "offline":
        return <span className="text-gray-500 font-medium">offline</span>
      case "em_viagem":
        return <span className="text-blue-600 font-medium">em viagem</span>
      case "suspenso":
        return <span className="text-red-600 font-medium">suspenso</span>
      default:
        return <span className="text-gray-500">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestão de Motoristas</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Users size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-blue-100 text-sm">Motoristas</p>
            </div>
          </div>
          <p className="text-blue-100">Total de Motoristas</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Users size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.online}</p>
              <p className="text-blue-100 text-sm">Online</p>
            </div>
          </div>
          <p className="text-blue-100">Motoristas Online</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Car size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.emViagem}</p>
              <p className="text-blue-100 text-sm">Em Viagem</p>
            </div>
          </div>
          <p className="text-blue-100">Motoristas Ocupados</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <Ban size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.suspensos}</p>
              <p className="text-blue-100 text-sm">Suspensos</p>
            </div>
          </div>
          <p className="text-blue-100">Motoristas Suspensos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Base de Motoristas</h2>
            <p className="text-sm text-blue-600 mt-1">Gerencie todos os motoristas cadastrados</p>
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
                  Novo Motorista
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Motorista</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" placeholder="Nome do motorista" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="+244 9XX XXX XXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carta">Número da Carta de Condução</Label>
                    <Input id="carta" placeholder="Número da carta" />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Cadastrar Motorista</Button>
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
              placeholder="Buscar por nome, email ou telefone..."
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
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="em_viagem">Em Viagem</option>
              <option value="suspenso">Suspenso</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <input
              type="number"
              min={0}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-[42px]"
              placeholder="0"
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
              <option value="nome">Ordenar: Nome</option>
              <option value="viagens">Ordenar: Viagens</option>
              <option value="dataCadastro">Ordenar: Data Cadastro</option>
              <option value="avaliacao">Ordenar: Avaliação</option>
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
                  Motorista
                </th>
                {cols.email && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                )}
                {cols.telefone && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Telefone
                  </th>
                )}
                {cols.viagens && (
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Viagens
                  </th>
                )}
                {cols.status && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                )}
                {cols.dataCadastro && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Data Cadastro
                  </th>
                )}
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMotoristas.map((motorista) => (
                <tr key={motorista.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {motorista.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{motorista.nome}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <span>{motorista.avaliacao}</span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </td>
                  {cols.email && <td className="px-6 py-4 text-gray-600">{motorista.email}</td>}
                  {cols.telefone && <td className="px-6 py-4 text-gray-600">{motorista.telefone}</td>}
                  {cols.viagens && (
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-8 w-12 bg-gray-100 rounded-full text-gray-900 font-medium">
                        {motorista.viagens}
                      </span>
                    </td>
                  )}
                  {cols.status && <td className="px-6 py-4">{getStatusBadge(motorista.status)}</td>}
                  {cols.dataCadastro && <td className="px-6 py-4 text-gray-600">{motorista.dataCadastro}</td>}
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
