/** @format */

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormularioCadastroMotorista from "@/components/motoristas/FormularioCadastroMotorista";

export default function NovoMotoristaPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/motoristas"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors group mb-4">
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Voltar para Motoristas</span>
        </Link>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/admin/motoristas"
            className="hover:text-teal-600 transition-colors">
            Motoristas
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Nova Viatura</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <FormularioCadastroMotorista
            onSucesso={() => router.push("/admin/motoristas")}
          />
        </div>
      </div>
    </div>
  );
}
