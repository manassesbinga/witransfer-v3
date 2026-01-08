/** @format */

"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Activity,
  Calendar,
  Car,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getDashboardStatsAction } from "../actions";
import GlobalLoading from "@/app/loading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Usando Server Action com padrão Wrapper
        const result = await getDashboardStatsAction();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Erro ao carregar stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <GlobalLoading />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-red-500">Erro ao carregar dados do painel.</div>
    );
  }

  const statCards = [
    {
      label: "Veículos",
      value: stats.cars,
      icon: Car,
      color: "blue",
      show: true,
    },
    {
      label: "Motoristas",
      value: stats.motoristas || 0,
      icon: Users,
      color: "green",
      show: true,
    },
    {
      label: "Viagens Hoje",
      value: stats.todayTrips || 0,
      icon: Calendar,
      color: "purple",
      show: true,
    },
    {
      label: "Receita Total",
      value: new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0,
      }).format(stats.revenue || 0),
      icon: DollarSign,
      color: "yellow",
      show: true,
    },
  ].filter((s) => s.show);

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Painel Administrativo
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {stats.isSuperAdmin
              ? "Resumo global do ecossistema WiTransfer."
              : "Gestão da sua frota e equipe."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "rounded-xl h-11 border-slate-200 bg-white shadow-sm justify-start text-left font-normal",
                  !selectedDate && "text-slate-400"
                )}>
                <Calendar className="w-4 h-4 mr-2" />
                {selectedDate
                  ? format(selectedDate, "PPP", { locale: ptBR })
                  : "Escolha uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPI Cards */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Indicadores-Chave
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <Card className="border border-slate-200/60 shadow-xs hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shadow-sm",
                        stat.color === "blue" && "bg-blue-50 text-blue-600",
                        stat.color === "green" && "bg-green-50 text-green-600",
                        stat.color === "purple" &&
                          "bg-purple-50 text-purple-600",
                        stat.color === "yellow" &&
                          "bg-yellow-50 text-yellow-600",
                        stat.color === "rose" && "bg-rose-50 text-rose-600",
                        stat.color === "indigo" &&
                          "bg-indigo-50 text-indigo-600"
                      )}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gráficos por Área */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Veículos */}
        <section>
          <Card className="border border-slate-200/60 shadow-xs hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="w-5 h-5 text-blue-600" />
                Frota
              </CardTitle>
              <CardDescription className="text-sm">
                Status e distribuição dos veículos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Ativos",
                          value: stats.vehicleStatus?.active || 0,
                        },
                        {
                          name: "Manutenção",
                          value: stats.vehicleStatus?.maintenance || 0,
                        },
                        {
                          name: "Inativos",
                          value: stats.vehicleStatus?.inactive || 0,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value">
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#6b7280" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bookings */}
        <section>
          <Card className="border border-slate-200/60 shadow-xs hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
                Reservas
              </CardTitle>
              <CardDescription className="text-sm">
                Bookings por tipo (Aluguel vs Transfer)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Aluguel", value: stats.bookings?.rental || 0 },
                      {
                        name: "Transfer",
                        value: stats.bookings?.transfer || 0,
                      },
                    ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b" }} />
                    <YAxis tick={{ fill: "#64748b" }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Financeiro */}
        <section>
          <Card className="border border-slate-200/60 shadow-xs hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financeiro
              </CardTitle>
              <CardDescription className="text-sm">
                Receita total
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between p-6 rounded-xl bg-green-50 border border-green-200">
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                    Receita Total
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {new Intl.NumberFormat("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                      maximumFractionDigits: 0,
                    }).format(stats.revenue || 0)}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Atividades Recentes */}
        <section>
          <Card className="border border-slate-200/60 shadow-xs hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-slate-600" />
                Atividades Recentes
              </CardTitle>
              <CardDescription className="text-sm">
                Últimas reservas e atualizações
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {(() => {
                  const filtered = selectedDate
                    ? (stats.recentActivity || []).filter((act: any) => {
                        const actDate = new Date(act.createdAt)
                          .toISOString()
                          .slice(0, 10);
                        const sel = selectedDate.toISOString().slice(0, 10);
                        return actDate === sel;
                      })
                    : stats.recentActivity || [];
                  return filtered.length ? (
                    filtered.map((act: any) => (
                      <div
                        key={act.id}
                        className="flex gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors border border-slate-200/60">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {act.type === "rental" ? "Aluguel" : "Transfer"} •{" "}
                            {act.userName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {act.carName} •{" "}
                            {new Date(act.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                          <Badge
                            variant={
                              act.status === "confirmed"
                                ? "success"
                                : act.status === "canceled"
                                ? "destructive"
                                : "default"
                            }
                            className="text-[10px] mt-1">
                            {act.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 py-12">
                      <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">
                        {selectedDate
                          ? "Nenhuma atividade neste dia"
                          : "Nenhuma atividade recente"}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
