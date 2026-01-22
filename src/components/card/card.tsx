import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: "up" | "down"
    change?: string
    description?: string
    className?: string
    variant?: "default" | "primary" | "dark" | "light"
    iconBgColor?: string
    iconColor?: string
    textColor?: string
}

export function StatsCard({
    title,
    value,
    change,
    trend,
    icon: Icon,
    description,
    className,
    variant = "default",
    iconBgColor,
    iconColor,
    textColor
}: StatsCardProps) {
    const variants = {
        default: {
            bg: "bg-white",
            border: "border-[#F1F5F9]",
            iconBg: iconBgColor || "bg-[#F8FAFC]",
            iconColor: iconColor || "text-[#3B82F6]",
            textColor: textColor || "text-[#0F172A]",
            titleColor: "text-[#64748B]"
        },
        primary: {
            bg: "bg-[#0069B8]",
            border: "border-[#0069B8]",
            iconBg: iconBgColor || "bg-white/10",
            iconColor: iconColor || "text-white",
            textColor: textColor || "text-white",
            titleColor: "text-white"
        },
        dark: {
            bg: "bg-[#00335c]",
            border: "border-[#00335c]",
            iconBg: iconBgColor || "bg-white/5",
            iconColor: iconColor || "text-white",
            textColor: textColor || "text-white",
            titleColor: "text-white"
        },
        light: {
            bg: "bg-white",
            border: "border-slate-100",
            iconBg: iconBgColor || "bg-blue-50",
            iconColor: iconColor || "text-blue-600",
            textColor: textColor || "text-slate-900",
            titleColor: "text-slate-500"
        }
    }

    const style = variants[variant]

    return (
        <Card className={cn(
            "rounded-none border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md h-full",
            style.bg,
            style.border,
            className
        )}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("w-12 h-12 rounded-none flex items-center justify-center", style.iconBg)}>
                        <Icon className={cn("h-6 w-6", style.iconColor)} />
                    </div>
                    {change && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[11px] font-bold border",
                            trend === "up" ? "bg-[#F0FDF4] text-[#16A34A] border-emerald-100" : "bg-[#FEF2F2] text-[#DC2626] border-red-100"
                        )}>
                            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {change}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className={cn("text-[12px] font-bold tracking-wider mb-2", style.titleColor)}>{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <p className={cn("text-3xl font-bold tracking-tight tabular-nums", style.textColor)}>
                            {value}
                        </p>
                    </div>
                    {description && (
                        <p className={cn("text-[11px] font-medium mt-3", variant === "default" ? "text-[#94A3B8]" : "text-white/70")}>
                            {description}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Grid wrapper for multiple stats
interface StatsGridProps {
    children: React.ReactNode
    columns?: 2 | 3 | 4
    className?: string
}

export function StatsGrid({ children, columns = 3, className }: StatsGridProps) {
    const gridCols = {
        2: "md:grid-cols-2",
        3: "md:grid-cols-3",
        4: "md:grid-cols-4"
    }

    return (
        <div className={cn("grid grid-cols-1 gap-6", gridCols[columns], className)}>
            {children}
        </div>
    )
}
