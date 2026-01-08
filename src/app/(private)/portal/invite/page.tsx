"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
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
import { apiRequest } from "@/lib/api";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  const [loading, setLoading] = useState(true);
  const [invitedData, setInvitedData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateInvite = async () => {
      if (!id || !type) {
        setError("Link de convite inválido ou malformado.");
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest(
          `/api/admin/invite?id=${id}&type=${type}`,
        );
        setInvitedData(data);
      } catch (err: any) {
        setError(err.message || "Este convite não existe ou já foi utilizado.");
      } finally {
        setLoading(false);
      }
    };
    validateInvite();
  }, [id, type]);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest("/api/admin/invite", {
        method: "POST",
        body: JSON.stringify({ id, type, password }),
      });
      setSuccess(true);
      toast.success("Acesso configurado com sucesso!");
      setTimeout(() => router.push("/portal"), 3000);
    } catch (err: any) {
      toast.error(err.message || "Erro ao configurar acesso.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Validando seu convite...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center px-4 max-w-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Convite Expirado
        </h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <Button
          onClick={() => router.push("/portal")}
          variant="outline"
          className="w-full"
        >
          Voltar para Login
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center px-4">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">
          Tudo Pronto!
        </h2>
        <p className="text-slate-500 mb-8">
          Seu acesso foi configurado. Você será redirecionado para o login em
          instantes.
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="z-10 w-full max-w-md py-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white shadow-2xl overflow-hidden rounded-none">
          <div className="flex justify-center mb-4 pt-8">
            <div className="w-14 h-14 bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-2xl">W</span>
            </div>
          </div>

          <Card className="border-none shadow-none rounded-none overflow-hidden text-center">
            <CardHeader className="pt-2 px-8 pb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3 mx-auto">
                <ShieldCheck className="w-3 h-3" />
                Configuração de {type === "company" ? "Empresa" : "Usuário"}
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                Ativar seu Acesso
              </CardTitle>
              <CardDescription className="text-slate-500 mt-2 text-sm">
                Olá <strong>{invitedData.name}</strong>, defina sua senha para
                começar a utilizar a plataforma.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-10 pt-6">
              <form onSubmit={handleComplete} className="space-y-5 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Senha de Acesso
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 bg-slate-50 border-none rounded-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Confirmar Senha
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="password"
                      placeholder="Repita sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 h-12 bg-slate-50 border-none rounded-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-12 rounded-none bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98] mt-4"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Ativar Minha Conta"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      <Suspense
        fallback={<Loader2 className="w-10 h-10 animate-spin text-primary" />}
      >
        <InviteContent />
      </Suspense>
    </div>
  );
}
