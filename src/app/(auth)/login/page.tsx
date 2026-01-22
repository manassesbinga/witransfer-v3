"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
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
import { loginAdminAction } from "@/actions/private/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginAdminAction({ email, password });

      if (result.success && result.data) {
        const userRole = result.data.role;
        const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(userRole);

        toast.success(`Sessão iniciada como ${result.data.name}`);
        setLoading(false);

        if (isAdmin) {
          router.push("/admin/dashboard");
        } else {
          router.push("/partners/dashboard");
        }
      } else {
        toast.error(result.error || "Credenciais inválidas.");
        setPassword("");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Login detail error:", error);
      toast.error(error.message || "Erro inesperado ao processar login.");
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white shadow-xl border border-slate-100">
            <div className="flex flex-col items-center pt-8 pb-2">
              <div className="w-12 h-12 bg-primary flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Bem-vindo de volta
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Insira suas credenciais para continuar
              </p>
            </div>

            <div className="p-8 pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 bg-white border-slate-200 rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Senha
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 bg-white border-slate-200 rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-none bg-primary text-white font-bold hover:bg-primary/90 transition-all mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-slate-400 text-xs mt-8">
          &copy; 2024 WiTransfer Global
        </p>
      </div>
    </div>
  );
}
