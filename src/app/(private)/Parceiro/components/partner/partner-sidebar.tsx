"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Car, MapPin, DollarSign, BarChart3, Bell, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/parceiro" },
  { icon: Users, label: "Clientes", href: "/parceiro/clientes" },
  { icon: UserCircle, label: "Motoristas", href: "/parceiro/motoristas" },
  { icon: Car, label: "Viaturas", href: "/parceiro/viaturas" },
  { icon: MapPin, label: "Viagens", href: "/parceiro/viagens" },
  { icon: DollarSign, label: "Financeiro", href: "/parceiro/financeiro" },
  { icon: BarChart3, label: "Relatórios", href: "/parceiro/relatorios" },
  { icon: Bell, label: "Notificações", href: "/parceiro/notificacoes" },
]

export function PartnerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 sticky top-0 h-screen bg-gradient-to-b from-primary-700 to-primary-800 text-white border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold">witransfer</h1>
        <p className="text-xs text-blue-100 mt-1">Painel do Parceiro</p>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200",
                    isActive 
                      ? "bg-white text-[#0156c7] font-semibold shadow-sm" 
                      : "text-blue-100 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-[#0156c7]" : "text-blue-100")} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-blue-200 text-center">
          <p>v1.0.0</p>
          <p>© 2024 witransfer</p>
        </div>
      </div>
    </aside>
  )
}
