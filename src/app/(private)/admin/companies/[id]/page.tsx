"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  Lock,
  Settings,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Power,
  Trash2,
  Shield,
  History,
  Info,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// --- Components for Tabs ---

function UsersTab() {
  const users = [
    {
      id: 1,
      name: "Ricardo Santos",
      email: "ricardo@logitransp.com.br",
      role: "Super Admin",
      status: "active",
      lastAccess: "Há 10 min",
      avatar: "RS",
    },
    {
      id: 2,
      name: "Ana Oliveira",
      email: "ana.o@logitransp.com.br",
      role: "Gerenciador de Operações",
      status: "active",
      lastAccess: "Há 2 horas",
      avatar: "AO",
    },
    {
      id: 3,
      name: "Carlos Pereira",
      email: "carlos.p@logitransp.com.br",
      role: "Motorista",
      status: "inactive",
      lastAccess: "Há 3 dias",
      avatar: "CP",
    },
    {
      id: 4,
      name: "Beatriz Lima",
      email: "beatriz@logitransp.com.br",
      role: "Gerenciador de Frota",
      status: "active",
      lastAccess: "Há 45 min",
      avatar: "BL",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Usuários da Empresa
          </h3>
          <p className="text-sm text-slate-500">
            Gerencie quem tem acesso e quais suas permissões.
          </p>
        </div>
        <Button className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-white flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-10 h-10 bg-slate-50/50 border-none rounded-xl"
            />
          </div>
          <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold">
            Utilizado: 4 / 100
          </div>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/30">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-xs uppercase font-bold text-slate-400">
                Usuário
              </TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-400">
                Função
              </TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-400">
                Status
              </TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-400">
                Último Acesso
              </TableHead>
              <TableHead className="text-right text-xs uppercase font-bold text-slate-400">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 leading-tight">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="rounded-md px-2 py-0 border-slate-200 font-medium text-slate-600"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        user.status === "active"
                          ? "bg-green-500"
                          : "bg-slate-300",
                      )}
                    ></div>
                    <span className="text-sm font-medium text-slate-600">
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {user.lastAccess}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function RolesTab() {
  const roles = [
    {
      name: "Super Admin",
      color: "bg-red-500",
      users: 1,
      permissions: ["all"],
      desc: "Acesso total a todas as funcionalidades.",
    },
    {
      name: "Gerenciador Operacional",
      color: "bg-blue-500",
      users: 2,
      permissions: ["view", "create", "manage_trips"],
      desc: "Gerencia viagens e motoristas.",
    },
    {
      name: "Gerenciador de Frota",
      color: "bg-purple-500",
      users: 1,
      permissions: ["view", "manage_vehicles"],
      desc: "Responsável pela manutenção e frota.",
    },
    {
      name: "Motorista",
      color: "bg-orange-500",
      users: 8,
      permissions: ["view_own", "update_status"],
      desc: "Acesso limitado às suas próprias viagens.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Funções/Roles
          </h3>
          <p className="text-sm text-slate-500">
            Defina o que cada grupo de usuários pode ver e fazer.
          </p>
        </div>
        <Button className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Criar Função
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card
            key={role.name}
            className="border-none shadow-sm hover:shadow-md transition-all group rounded-2xl"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn("w-3 h-3 rounded-full shadow-sm", role.color)}
                ></div>
                <CardTitle className="text-base font-bold">
                  {role.name}
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-500 border-none"
              >
                {role.users} usuários
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4 text-sm leading-relaxed">
                {role.desc}
              </CardDescription>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((p) => (
                  <span
                    key={p}
                    className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold"
                  >
                    {p.toUpperCase()}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500 hover:text-primary"
                >
                  Ver Detalhes
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RulesTab() {
  const rules = [
    {
      title: "Bloqueio por Inatividade",
      condition: "Sem login > 30 dias",
      action: "block_access",
      status: "active",
      icon: AlertCircle,
      color: "text-red-600 bg-red-50",
    },
    {
      title: "Limite de Pickups",
      condition: "Viagens pendentes > 3",
      action: "restrict_view",
      status: "active",
      icon: Info,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Aprovação Financeira",
      condition: "Solicitação > R$ 1.000",
      action: "require_approval",
      status: "inactive",
      icon: Shield,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Regras de Acesso
          </h3>
          <p className="text-sm text-slate-500">
            Regras de negócio customizadas que controlam o comportamento do
            sistema.
          </p>
        </div>
        <Button className="rounded-xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nova Regra
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card
            key={rule.title}
            className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl group"
          >
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    rule.color,
                  )}
                >
                  <rule.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{rule.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Se:</span>{" "}
                    {rule.condition}
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="font-medium text-slate-700">Ação:</span>{" "}
                    <code className="bg-slate-100 px-1 rounded text-primary">
                      {rule.action}
                    </code>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      rule.status === "active"
                        ? "bg-green-500"
                        : "bg-slate-300",
                    )}
                  ></div>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {rule.status === "active" ? "Ativa" : "Pausada"}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:bg-slate-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ConfigTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" /> Informações Gerais
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">
              Nome da Empresa
            </label>
            <Input
              defaultValue="LogiTransp Brasil"
              className="h-10 rounded-xl bg-white border-slate-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">
              CNPJ (Fixo)
            </label>
            <Input
              defaultValue="12.345.678/0001-90"
              readOnly
              className="h-10 rounded-xl bg-slate-50 border-slate-100 text-slate-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">
              Email Administrativo
            </label>
            <Input
              defaultValue="financeiro@logitransp.com.br"
              className="h-10 rounded-xl bg-white border-slate-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">
              Telefone
            </label>
            <Input
              defaultValue="(11) 98765-4321"
              className="h-10 rounded-xl bg-white border-slate-200"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Limites de Conta
        </h3>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Limite de Usuários Ativos
            </span>
            <span className="text-sm font-bold text-primary">4 / 100</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-[4%] transition-all"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2 italic">
            A empresa atingiu 4% do limite contratado.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full h-11 rounded-xl border-dashed border-2 hover:bg-slate-50 text-slate-500 font-semibold border-slate-200"
        >
          Aumentar Limite de Usuários
        </Button>
      </section>

      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 px-6 rounded-xl font-bold border-slate-200"
          >
            Desativar Empresa
          </Button>
          <Button
            variant="ghost"
            className="h-11 px-6 rounded-xl font-bold text-red-600 hover:bg-red-50"
          >
            Excluir Tudo
          </Button>
        </div>
        <Button className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function CompanyDetailsPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/companies"
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Gerenciar Empresa
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/admin/companies"
              className="hover:text-primary transition-colors"
            >
              Empresas
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-800">
              LogiTransp Brasil
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary to-primary/80 h-32 relative">
            <div className="absolute -bottom-6 left-8 p-1 bg-white rounded-2xl shadow-xl">
              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center font-black text-2xl text-slate-400">
                LT
              </div>
            </div>
            <div className="absolute bottom-4 right-8 flex items-center gap-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1">
                ID: #92834
              </Badge>
              <Badge className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border border-green-400/30 backdrop-blur-md px-3 py-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>{" "}
                Ativo
              </Badge>
            </div>
          </div>
          <div className="pt-10 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                LogiTransp Brasil
              </h1>
              <div className="flex items-center gap-4 text-slate-500 text-sm">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> logransp@contato.com.br
                </span>
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Desde Março, 2024
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-xl h-11 border-slate-200 hover:bg-slate-50 font-bold"
              >
                Relatórios
              </Button>
              <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10">
                <Power className="w-4 h-4 mr-2" /> Alterar Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs
        defaultValue="users"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 inline-flex">
          <TabsList className="bg-transparent border-none p-0 gap-1 h-10">
            {[
              { id: "users", label: "Usuários", icon: Users },
              { id: "roles", label: "Funções", icon: ShieldCheck },
              { id: "rules", label: "Regras", icon: Lock },
              { id: "audit", label: "Auditoria", icon: History },
              { id: "config", label: "Configuração", icon: Settings },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm",
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-500 hover:bg-slate-50",
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
        <TabsContent value="rules">
          <RulesTab />
        </TabsContent>
        <TabsContent value="audit">
          <div className="animate-in fade-in duration-500 text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200/60">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-800">
              Histórico de Atividades
            </h4>
            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
              Visualize todas as alterações realizadas por esta empresa nos
              últimos 90 dias.
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-xl border-slate-200 font-bold"
            >
              Carregar Logs
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="config">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
