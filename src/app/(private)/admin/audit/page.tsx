"use client";

import {
  History,
  Search,
  Filter,
  Download,
  User,
  Building,
  Shield,
  Lock,
  Globe,
  Settings,
  MoreVertical,
  Calendar,
  Layers,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const auditLogs = [
  {
    id: 1,
    user: "Ricardo Santos",
    role: "Super Admin",
    company: "LogiTransp Brasil",
    action: "Criou novo usuário",
    target: "Mariana Costa",
    time: "Hoje, 15:30",
    ip: "192.168.1.45",
    type: "user",
  },
  {
    id: 2,
    user: "Admin WiTransfer",
    role: "Admin Global",
    company: "Plataforma",
    action: "Alterou limite de usuários",
    target: "Express Road S.A.",
    time: "Hoje, 14:20",
    ip: "10.0.0.8",
    type: "config",
  },
  {
    id: 3,
    user: "Carlos Pereira",
    role: "Motorista",
    company: "Swift Logistics",
    action: "Iniciou Viagem #9283",
    target: "Trecho SP -> RJ",
    time: "Hoje, 12:05",
    ip: "172.16.0.12",
    type: "activity",
  },
  {
    id: 4,
    user: "Beatriz Lima",
    role: "Gerenciador de Frota",
    company: "Global Cargo Ltd",
    action: "Atualizou Doc. Veículo",
    target: "ABC-1234",
    time: "Hoje, 10:45",
    ip: "192.168.1.102",
    type: "fleet",
  },
  {
    id: 5,
    user: "Beatriz Lima",
    role: "Gerenciador de Frota",
    company: "Global Cargo Ltd",
    action: "Alterou Regra de Acesso",
    target: "Velocidade Máxima",
    time: "Ontem, 22:15",
    ip: "192.168.1.102",
    type: "rule",
  },
  {
    id: 6,
    user: "Ricardo Santos",
    role: "Super Admin",
    company: "LogiTransp Brasil",
    action: "Deletou Role",
    target: "Assistente de Frota",
    time: "Ontem, 18:00",
    ip: "192.168.1.45",
    type: "role",
  },
];

export default function AuditPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Registro de Auditoria
          </h1>
          <p className="text-slate-500 mt-1">
            Acompanhe todas as ações e mudanças realizadas no ecossistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-11 border-slate-200 bg-white font-bold px-5"
          >
            <Filter className="w-4 h-4 mr-2" /> Filtrar por Data
          </Button>
          <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-black/5 bg-slate-900 text-white hover:bg-slate-800 transition-all">
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total de Logs",
            value: "14.284",
            icon: Layers,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Ações de Hoje",
            value: "342",
            icon: History,
            color: "text-orange-600 bg-orange-50",
          },
          {
            label: "Logins Únicos",
            value: "84",
            icon: User,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Exportações",
            value: "12",
            icon: FileText,
            color: "text-green-600 bg-green-50",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  item.color,
                )}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tabular-nums">
                  {item.value}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {item.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter & Table Card */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por usuário, empresa, ação ou IP..."
                className="pl-10 h-10 bg-slate-50 border-none rounded-xl text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-100 text-slate-500 border-none rounded-lg px-3 py-1 font-bold">
                TODAS AS EMPRESAS
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-slate-400"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100 h-14">
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] pl-8">
                  Usuário & Empresa
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Ação Realizada
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Alvo/Target
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Data & Hora
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  IP
                </TableHead>
                <TableHead className="text-right pr-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="border-slate-50 hover:bg-slate-50/30 transition-colors group h-16"
                >
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none">
                          {log.user}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          {log.company}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          log.type === "user" && "bg-blue-500",
                          log.type === "config" && "bg-orange-500",
                          log.type === "fleet" && "bg-purple-500",
                          log.type === "rule" && "bg-red-500",
                          log.type === "activity" && "bg-green-500",
                        )}
                      ></div>
                      <span className="text-sm font-semibold text-slate-700">
                        {log.action}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded-lg border-slate-100 bg-white text-slate-500 font-bold px-2 py-0 text-[11px]"
                    >
                      {log.target}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {log.time}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-400">
                    {log.ip}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <div className="p-8 border-t border-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-400 font-medium">
            Mostrando <span className="text-slate-900 font-bold">6</span> de{" "}
            <span className="text-slate-900 font-bold">14.284</span> eventos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled
              className="rounded-xl h-10 border-slate-200"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-10 bg-slate-900 text-white border-none px-4"
            >
              1
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-10 border-slate-200"
            >
              2
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-10 border-slate-200"
            >
              3
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-10 border-slate-200"
            >
              Próximo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
