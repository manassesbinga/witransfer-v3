import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const drivers = [
  {
    id: 1,
    name: "João Silva",
    trips: 45,
    rating: 4.9,
    earnings: "185 000,00 Kz",
    initials: "JS",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Maria Santos",
    trips: 38,
    rating: 4.8,
    earnings: "152 000,00 Kz",
    initials: "MS",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    name: "Carlos Neto",
    trips: 32,
    rating: 4.7,
    earnings: "128 000,00 Kz",
    initials: "CN",
    color: "bg-purple-500",
  },
]

export function PartnerTopDrivers() {
  return (
    <div className="space-y-4">
      {drivers.map((driver, index) => (
        <div key={driver.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="w-6 h-6 flex items-center justify-center text-sm font-semibold text-gray-400">
            {index + 1}
          </span>
          <Avatar className={driver.color}>
            <AvatarFallback className="text-white text-sm">{driver.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{driver.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{driver.trips} viagens</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {driver.rating}
              </span>
            </div>
          </div>
          <span className="font-semibold text-gray-900 text-sm">{driver.earnings}</span>
        </div>
      ))}
    </div>
  )
}
