"use client";

import {
  Settings,
  Shield,
  Bell,
  Globe,
  Mail,
  Lock,
  Database,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Configurações do Sistema
        </h1>
        <p className="text-slate-500 mt-1">
          Ajustes globais da plataforma e preferências administrativas.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  Segurança & Acesso
                </CardTitle>
                <CardDescription>
                  Gerencie políticas de senha e autenticação.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Autenticação de Dois Fatores (2FA)
                </p>
                <p className="text-xs text-slate-500">
                  Exigir 2FA para todos os Super Admins de empresas.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Expiração de Senha
                </p>
                <p className="text-xs text-slate-500">
                  Forçar troca de senha a cada 90 dias.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  Notificações do Sistema
                </CardTitle>
                <CardDescription>
                  Alertas automáticos para administradores.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Alertas de Novas Empresas
                </p>
                <p className="text-xs text-slate-500">
                  Receber email quando uma nova empresa for cadastrada.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Relatórios Semanais
                </p>
                <p className="text-xs text-slate-500">
                  Enviar resumo de performance todos os domingos.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            className="rounded-xl h-11 px-8 border-slate-200 font-bold"
          >
            Cancelar
          </Button>
          <Button className="rounded-xl h-11 px-8 font-bold bg-primary text-white shadow-lg shadow-primary/20">
            Salvar Preferências
          </Button>
        </div>
      </div>
    </div>
  );
}
