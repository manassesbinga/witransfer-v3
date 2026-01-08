"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Plus,
  AlertCircle,
  Trash2,
  Edit,
  Copy,
  Building,
  Loader2,
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getRolesAction } from "../../actions";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await getRolesAction();
        if (result.success) {
          setRoles(result.data);
        }
      } catch (error) {
        console.error("Erro ao carregar roles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-medium">Carregando matriz de permissões...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Gestão de Roles
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os modelos de funções e permissões para empresas parceiras.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Novo Template
          </Button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {roles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Nenhum modelo de função encontrado no banco de dados.
          </div>
        ) : (
          roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-all group rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full ring-4 ring-slate-50",
                        role.color || "bg-slate-400",
                      )}
                    ></div>
                    <CardTitle className="text-xl font-black text-slate-900">
                      {role.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-lg bg-slate-50 border-slate-100 text-slate-500 font-bold px-3 py-1 uppercase tracking-widest text-[10px]"
                  >
                    {role.type || "Standard"}
                  </Badge>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <CardDescription className="text-slate-500 text-sm leading-relaxed mb-6">
                    {role.description}
                  </CardDescription>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                      <span>Permissões Associadas</span>
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {role.permissions?.length || 0}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions?.map((p: string) => (
                        <span
                          key={p}
                          className="text-[11px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg"
                        >
                          {p.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Building className="w-4 h-4" />
                      {role.companyId === "system"
                        ? "Padrão Global"
                        : "Personalizado"}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
