"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

export function LoginDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await apiRequest("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (data.success) {
        setStep("otp");
      } else {
        setErrorMessage("Erro ao enviar código. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setErrorMessage(error.message || "Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await apiRequest("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      if (data.success) {
        localStorage.setItem("is_auth", "true");
        localStorage.setItem("user_email", email);
        if (data.user?.fullName) {
          localStorage.setItem("user_name", data.user.fullName);
        }

        document.cookie = "is_auth=true; path=/; max-age=86400";

        setIsOpen(false);
        window.location.reload();
      } else {
        setErrorMessage(data.error || "Código inválido. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setErrorMessage(error.message || "Erro ao verificar código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Login</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-[#003580] p-6 text-white relative">
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black">
                WiTransfer Access
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-xs font-medium mt-1">
                Gerencie suas reservas com segurança
              </DialogDescription>
            </div>
          </div>
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>

        <div className="p-6 bg-white">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600 font-medium text-center animate-pulse">
              {errorMessage}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="login-email"
                  className="text-xs font-black text-gray-500 tracking-wider"
                >
                  Seu E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:ring-[#003580]"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                loading={loading}
                className="w-full h-11 bg-[#003580] hover:bg-[#002b66] font-black text-sm tracking-widest transition-all"
              >
                Enviar Código OTP
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyOTP}
              className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="space-y-2 text-center">
                <Label
                  htmlFor="otp"
                  className="text-xs font-black text-gray-500 tracking-wider"
                >
                  Código de Verificação
                </Label>
                <p className="text-[11px] text-gray-500">
                  Enviamos um código de 6 dígitos para <strong>{email}</strong>
                </p>
                <Input
                  id="otp"
                  type="text"
                  placeholder="0 0 0 0 0 0"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="h-14 text-center text-2xl font-black tracking-[0.5em] border-2 border-gray-100 focus:border-[#003580] bg-gray-50"
                  required
                />
              </div>
              <Button
                type="submit"
                loading={loading}
                disabled={otp.length < 6}
                className="w-full h-11 bg-[#008009] hover:bg-[#006607] font-black text-sm tracking-widest transition-all"
              >
                Verificar e Entrar
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-[10px] text-gray-400 font-bold hover:text-gray-600 transition-colors"
              >
                Alterar e-mail
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 text-[10px] text-gray-400 text-center tracking-tighter">
            WiTransfer Security System • Encrypted Session
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
