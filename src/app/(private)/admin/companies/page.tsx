/** @format */

"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Building2,
  UserCheck,
  Shield,
  Activity,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Mail,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCompaniesAction, saveCompanyAction } from "../../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import GlobalLoading from "@/app/loading";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "", // Para envio do convite
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const result = await getCompaniesAction();
      if (result.success) {
        setCompanies(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Preencha o nome e o e-mail da empresa.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveCompanyAction(formData);
      if (result.success) {
        toast.success("Empresa cadastrada e convite enviado!");
        setIsCreateModalOpen(false);
        setFormData({ name: "", email: "" });
        fetchCompanies();
      } else {
        toast.error(result.error || "Erro ao salvar empresa.");
      }
    } catch (error) {
      toast.error("Erro ao processar cadastro.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <GlobalLoading />
      </div>
    );
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Empresas Parceiras
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie as organizações transportadoras integradas à plataforma.
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 h-11 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateCompany}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">
                  Cadastrar Empresa
                </DialogTitle>
                <DialogDescription>
                  Registre uma nova empresa parceira. Um convite de configuração
                  será enviado ao e-mail informado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Nome da Organização
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Ex: LogiTransp Angola"
                      className="h-11 rounded-xl pl-10"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    E-mail de Contato/Admin
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="admin@empresa.com"
                      className="h-11 rounded-xl pl-10"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary text-white font-bold"
                  disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Convite de Empresa
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total de Empresas",
            value: companies.length,
            icon: Building2,
            color: "blue",
          },
          {
            label: "Status Sistema",
            value: "Online",
            icon: Activity,
            color: "green",
          },
          { label: "Segurança", value: "Ativa", icon: Shield, color: "purple" },
          {
            label: "Usuários",
            value: "Dinâmico",
            icon: UserCheck,
            color: "orange",
          },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold mt-1 text-slate-900">
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      stat.color === "blue" && "bg-blue-50 text-blue-600",
                      stat.color === "green" && "bg-green-50 text-green-600",
                      stat.color === "purple" && "bg-purple-50 text-purple-600",
                      stat.color === "orange" && "bg-orange-50 text-orange-600"
                    )}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="bg-white border-b border-slate-50 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Listagem de Empresas
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Pesquisar por nome..."
                  className="pl-10 h-10 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-semibold text-slate-600 h-12 pl-6">
                  Empresa
                </TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">
                  Data Cadastro
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-600 h-12 pr-6">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-slate-400">
                    Nenhuma empresa encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="hover:bg-slate-50/40 border-slate-50 group transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                            {company.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {company.isPrincipal
                              ? "Unidade Principal"
                              : "Parceiro Integrado"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "border-none px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider",
                          company.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : company.status === "invited"
                            ? "bg-amber-100 text-amber-700 animate-pulse"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                        )}>
                        {company.status === "invited"
                          ? "Pendente Convite"
                          : company.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {company.createdAt
                        ? new Date(company.createdAt).toLocaleDateString(
                            "pt-BR"
                          )
                        : "Manual"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 rounded-lg hover:bg-slate-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
