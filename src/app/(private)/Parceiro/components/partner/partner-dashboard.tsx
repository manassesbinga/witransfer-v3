"use client"

import { DollarSign, Car, Users, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnerStatsCard } from "./partner-stats-card"
import { PartnerWeeklyChart } from "./partner-weekly-chart"
import { PartnerTopDrivers } from "./partner-top-drivers"
import { PartnerRecentTrips } from "./partner-recent-trips"

export function PartnerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao painel do parceiro WiTransfer.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PartnerStatsCard
          title="Minha Receita"
          value="450 000,00 Kz"
          change="+8.2%"
          trend="up"
          icon={DollarSign}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          subtitle="Comparado ao mês anterior"
        />
        <PartnerStatsCard
          title="Minhas Viagens"
          value="287"
          change="+12.5%"
          trend="up"
          icon={Car}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          subtitle="Este mês"
        />
        <PartnerStatsCard
          title="Meus Motoristas"
          value="12"
          change="+2"
          trend="up"
          icon={Users}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          subtitle="Ativos"
        />
        <PartnerStatsCard
          title="Avaliação Média"
          value="4.7"
          change="+0.3"
          trend="up"
          icon={Star}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          subtitle="Dos clientes"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Receita Semanal</CardTitle>
            <button className="text-sm text-blue-600 hover:underline">Ver Relatório</button>
          </CardHeader>
          <CardContent>
            <PartnerWeeklyChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Meus Top Motoristas</CardTitle>
          </CardHeader>
          <CardContent>
            <PartnerTopDrivers />
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Viagens Recentes</CardTitle>
          <button className="text-sm text-blue-600 hover:underline">Ver Todas</button>
        </CardHeader>
        <CardContent>
          <PartnerRecentTrips />
        </CardContent>
      </Card>
    </div>
  )
}
