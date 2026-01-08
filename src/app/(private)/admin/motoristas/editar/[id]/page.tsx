"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMotoristasAction } from "@/app/(private)/actions/motoristas/actions";
import { toast } from "sonner";
import Link from "next/link";
import FormularioCadastroMotorista from "@/components/motoristas/FormularioCadastroMotorista";
import { Motorista } from "@/types/motorista";

export default function EditarMotoristaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [motorista, setMotorista] = useState<Motorista | null>(null);

  useEffect(() => {
    const fetchMotorista = async () => {
      try {
        const result = await getMotoristasAction();
        if (result.success) {
          const found = result.data.find((m: any) => m.id === id);
          if (found) {
            setMotorista(found);
          } else {
            toast.error("Motorista não encontrado.");
            router.push("/admin/motoristas");
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchMotorista();
  }, [id, router]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-medium">Carregando dados do motorista...</p>
      </div>
    );
  }

  if (!motorista) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/motoristas">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ChevronLeft size={24} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Editar Motorista</h1>
          <p className="text-slate-500">Atualize as informações do condutor.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <FormularioCadastroMotorista 
          motoristaId={id}
          editar
          dadosIniciais={motorista}
          onSucesso={() => router.push("/admin/motoristas")} 
        />
      </div>
    </div>
  );
}
