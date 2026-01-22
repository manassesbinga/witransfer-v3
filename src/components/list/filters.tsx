import { Search, X, Filter, Download, List, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ClientsFiltersProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    status: string
    onStatusChange: (value: string) => void
    sortKey: string
    onSortKeyChange: (value: string) => void
    sortDir: "asc" | "desc"
    onSortDirChange: (value: "asc" | "desc") => void
    pageSize: number
    onPageSizeChange: (value: number) => void
    viewMode: "grid" | "list"
    onViewModeChange: (value: "grid" | "list") => void
    cols: {
        contato?: boolean
        estatisticas?: boolean
        status?: boolean
        cadastro?: boolean
    }
    onColsChange: (cols: any) => void
    onExport: () => void
}

export function ClientsFilters({
    searchQuery,
    onSearchChange,
    status,
    onStatusChange,
    sortKey,
    onSortKeyChange,
    sortDir,
    onSortDirChange,
    pageSize,
    onPageSizeChange,
    viewMode,
    onViewModeChange,
    cols,
    onColsChange,
    onExport
}: ClientsFiltersProps) {
    return (
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
                        onClick={onExport}
                        className="rounded-xl h-11 px-4 font-bold border-slate-100 hover:bg-slate-50">
                        <Download size={18} className="mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Filters Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                <div className="md:col-span-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome, email, telefone ou ID..."
                        className="pl-10 h-11 rounded-xl border-slate-100 focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="md:col-span-2">
                    <select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
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
                        onChange={(e) => onSortKeyChange(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-100 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="name">Ordenar: Nome</option>
                        <option value="tripCount">Ordenar: Viagens</option>
                        <option value="totalSpent">Ordenar: Gasto</option>
                        <option value="createdAt">Ordenar: Cadastro</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <select
                        value={sortDir}
                        onChange={(e) => onSortDirChange(e.target.value as any)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-100 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="asc">Ascendente</option>
                        <option value="desc">Descendente</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
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
                                            onColsChange({ ...cols, [col.id]: e.target.checked })
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
                        onClick={() => onViewModeChange("list")}>
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
                        onClick={() => onViewModeChange("grid")}>
                        <LayoutGrid size={20} />
                    </Button>
                </div>
            </div>
        </div>
    )
}
