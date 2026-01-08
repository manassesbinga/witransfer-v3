"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { loginAdminAction } from "../actions";

export default function AdminPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usando a Server Action com padrão Wrapper
      const result = await loginAdminAction({ email, password });

      if (result.success && result.data) {
        toast.success(`Bem-vindo, ${result.data.name}! Acesso autorizado.`);
        router.push("/admin");
      } else {
        toast.error(result.error || "Credenciais inválidas.");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Erro inesperado ao processar login.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden px-6">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="z-10 w-full max-w-md py-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white shadow-2xl overflow-hidden">
            <div className="flex justify-center mb-4 pt-6">
              <div className="w-12 h-12 bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-black text-xl">W</span>
              </div>
            </div>

            <Card className="border-none shadow-none rounded-none overflow-hidden">
              <CardHeader className="pt-1 px-8 pb-1 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 mx-auto">
                  <ShieldCheck className="w-3 h-3" />
                  Portal Administrativo
                </div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">
                  Login Portal
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1 text-sm">
                  Autenticação via base de dados interna.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-6 pt-2">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      E-mail Corporativo
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        placeholder="exemplo@witransfer.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-10 bg-slate-50 border-none rounded-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Senha de Acesso
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-10 bg-slate-50 border-none rounded-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-none bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98] group mt-1"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Acessar Painel
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <p className="text-center text-slate-400 text-[10px] mt-6">
          &copy; 2024 WiTransfer Global. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
