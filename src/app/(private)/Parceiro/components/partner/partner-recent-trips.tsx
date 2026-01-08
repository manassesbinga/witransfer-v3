import { MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const trips = [
  {
    id: "VG-001",
    client: "Ana Ferreira",
    driver: "João Silva",
    origin: "Talatona, Luanda",
    destination: "Aeroporto 4 de Fevereiro",
    status: "completed",
    value: "8 500,00 Kz",
    time: "14:30",
  },
  {
    id: "VG-002",
    client: "Pedro Mendes",
    driver: "Maria Santos",
    origin: "Maianga, Luanda",
    destination: "Viana, Luanda",
    status: "in_progress",
    value: "12 000,00 Kz",
    time: "15:45",
  },
  {
    id: "VG-003",
    client: "Sofia Costa",
    driver: "Carlos Neto",
    origin: "Kilamba, Luanda",
    destination: "Morro Bento, Luanda",
    status: "completed",
    value: "6 800,00 Kz",
    time: "16:20",
  },
  {
    id: "VG-004",
    client: "Miguel Sousa",
    driver: "João Silva",
    origin: "Ingombota, Luanda",
    destination: "Cacuaco, Luanda",
    status: "pending",
    value: "15 000,00 Kz",
    time: "17:00",
  },
]

const statusMap = {
  completed: {
    label: "Concluída",
    variant: "default" as const,
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  in_progress: {
    label: "Em Curso",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  pending: {
    label: "Pendente",
    variant: "default" as const,
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
}

export function PartnerRecentTrips() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cliente</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Motorista</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Trajeto</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Valor</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => {
            const status = statusMap[trip.status as keyof typeof statusMap]
            return (
              <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">{trip.id}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-700">{trip.client}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-700">{trip.driver}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3 text-emerald-500" />
                      <span className="truncate max-w-[200px]">{trip.origin}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3 text-red-500" />
                      <span className="truncate max-w-[200px]">{trip.destination}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge className={status.className}>{status.label}</Badge>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-semibold text-gray-900">{trip.value}</span>
                  <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3" />
                    {trip.time}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
