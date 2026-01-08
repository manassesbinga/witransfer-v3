import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PartnerStatsCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: LucideIcon
  iconBg: string
  iconColor: string
  subtitle: string
}

export function PartnerStatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
  subtitle,
}: PartnerStatsCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn("p-3 rounded-xl", iconBg)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <span
            className={cn(
              "text-sm font-medium flex items-center gap-1",
              trend === "up" ? "text-emerald-600" : "text-red-600",
            )}
          >
            {change}
            <span className="text-lg">{trend === "up" ? "↗" : "↘"}</span>
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}
