"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Building,
  Loader2,
  Mail,
  Shield,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  getUsersAction,
  saveUserAction,
  getCompaniesAction,
  getRolesAction,
  getCurrentUserAction,
} from "../../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function GlobalUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyId: "",
    role: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, companiesRes, rolesRes, userRes] = await Promise.all([
        getUsersAction(),
        getCompaniesAction(),
        getRolesAction(),
        getCurrentUserAction(),
      ]);

      if (usersRes.success) setUsers(usersRes.data);
      if (companiesRes.success) setCompanies(companiesRes.data);
      if (rolesRes.success) setRoles(rolesRes.data);
      if (userRes.success) setCurrentUser(userRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
      toast.error("Erro ao carregar dados dos usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveUserAction({
        ...formData,
        companyId:
          currentUser?.role === "SUPER_ADMIN"
            ? formData.companyId
            : currentUser?.companyId,
      });

      if (result.success) {
        toast.success(
          "Usuário convidado com sucesso! O convite foi enviado por e-mail.",
        );
        setIsCreateModalOpen(false);
        setFormData({ name: "", email: "", companyId: "", role: "" });
        fetchData(); // Refresh list
      } else {
        toast.error(result.error || "Erro ao criar usuário.");
      }
    } catch (error) {
      toast.error("Erro inesperado ao salvar usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-medium">Carregando usuários da plataforma...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-slate-500 mt-1">
            Administração de contas e níveis de acesso.
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 bg-primary text-white">
              <Plus className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateUser}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">
                  Convidar Usuário
                </DialogTitle>
                <DialogDescription>
                  Envie um convite por e-mail para um novo utilizador. Ele
                  poderá configurar sua própria senha.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Nome Completo
                  </label>
                  <Input
                    placeholder="Ex: João Silva"
                    className="h-11 rounded-xl"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    E-mail Corporativo
                  </label>
                  <Input
                    type="email"
                    placeholder="email@empresa.com"
                    className="h-11 rounded-xl"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isSaving}
                  />
                </div>

                {currentUser?.role === "SUPER_ADMIN" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Empresa Destino
                    </label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, companyId: v })
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Nível de Acesso (Role)
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => setFormData({ ...formData, role: v })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id || r.name} value={r.name}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary text-white font-bold"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-10 h-10 bg-slate-50 border-none rounded-xl"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14">
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] pl-8">
                  Usuário
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Empresa / Cargo
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Status
                </TableHead>
                <TableHead className="text-right pr-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-slate-400 font-medium"
                  >
                    Nenhum usuário encontrado na base de dados.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-slate-50 hover:bg-slate-50/30 h-16 transition-colors group"
                  >
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase overflow-hidden">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-slate-300" />
                          <span className="text-xs font-medium text-slate-600">
                            {user.companyId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-primary/40" />
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            user.status === "active"
                              ? "bg-green-500 shadow-sm shadow-green-200"
                              : user.status === "invited"
                                ? "bg-amber-400 animate-pulse"
                                : "bg-slate-300",
                          )}
                        ></div>
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-tighter",
                            user.status === "active"
                              ? "text-green-600"
                              : user.status === "invited"
                                ? "text-amber-500"
                                : "text-slate-400",
                          )}
                        >
                          {user.status === "invited"
                            ? "Aguardando Cadastro"
                            : user.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 rounded-lg hover:bg-slate-100"
                      >
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
