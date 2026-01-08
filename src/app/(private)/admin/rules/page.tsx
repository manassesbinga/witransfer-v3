"use client";

import {
  Lock,
  Plus,
  Search,
  Filter,
  PlayCircle,
  PauseCircle,
  Trash2,
  Edit,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Clock,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const globalRules = [
  {
    id: 1,
    name: "Trava de Segurança Noturna",
    condition: "Hora_atual > 22:00",
    action: "block_pickup",
    target: "Motoristas",
    status: "active",
    description: "Impede o início de novas viagens em horários de alto risco.",
    priority: 10,
    icon: Clock,
    color: "bg-blue-600",
  },
  {
    id: 2,
    name: "Limite Geográfico SP",
    condition: "Destino == 'SP-Capital'",
    action: "trigger_alert",
    target: "Gerenciadores",
    status: "active",
    description:
      "Notifica quando uma viagem entra em área restrita de São Paulo.",
    priority: 5,
    icon: MapPin,
    color: "bg-orange-500",
  },
  {
    id: 3,
    name: "Bloqueio por Documentação",
    condition: "Documento == 'Vencido'",
    action: "auto_disable",
    target: "Todos",
    status: "active",
    description: "Desabilita o acesso imediatamente caso a CNH expire.",
    priority: 1,
    icon: ShieldCheck,
    color: "bg-red-600",
  },
];

export default function RulesPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Regras de Negócio
          </h1>
          <p className="text-slate-500 mt-1">
            Configure o motor de regras global que rege o comportamento da
            plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-11 border-slate-200 bg-white font-bold px-5"
          >
            Testar Regras
          </Button>
          <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Criar Regra
          </Button>
        </div>
      </div>

      {/* Rules Engine Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-none px-3 py-1 font-black text-[10px] uppercase">
                Online
              </Badge>
            </div>
            <h3 className="text-2xl font-black tabular-nums">0.04s</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Tempo de Processamento
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white p-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Terminal className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Ativas
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tabular-nums">
              142
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              Instâncias Executadas Hoje
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white p-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Nível de Risco
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900">Mínimo</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              Anomalias Detectadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {globalRules.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group">
              <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center shadow-lg shadow-black/5",
                    rule.color,
                  )}
                >
                  <rule.icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-black text-slate-900">
                      {rule.name}
                    </h4>
                    <Badge
                      variant="outline"
                      className="rounded-lg text-[10px] font-bold uppercase px-2 py-0.5 border-slate-100 text-slate-400"
                    >
                      P{rule.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-1">
                    {rule.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        SE:
                      </span>
                      <code className="text-xs font-bold text-slate-700">
                        {rule.condition}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                        AÇÃO:
                      </span>
                      <code className="text-xs font-black text-primary">
                        {rule.action}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        TARGET:
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {rule.target}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 border-l border-slate-50 pl-6 h-full">
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          rule.status === "active"
                            ? "bg-green-500"
                            : "bg-slate-300",
                        )}
                      ></div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                        {rule.status === "active" ? "Ativa" : "Pausada"}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">
                      Última execução: Hoje, 14:20
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 border border-slate-100 rounded-xl hover:bg-slate-50"
                    >
                      <Edit className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 border border-slate-100 rounded-xl hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Engine Logs Link */}
      <div className="pt-8 flex justify-center">
        <Button
          variant="ghost"
          className="rounded-2xl font-black text-slate-400 hover:text-primary transition-all group"
        >
          <Terminal className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
          Acessar Console do Motor de Regras
        </Button>
      </div>
    </div>
  );
}
