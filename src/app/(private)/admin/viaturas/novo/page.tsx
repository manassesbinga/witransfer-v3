/** @format */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
// MainLayout removido para usar o layout privado global
import FormularioCadastroViatura from "@/components/viaturas/FormularioCadastroViatura";
import Link from "next/link";

const NovaViatura = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back Button */}
      <div className="mb-6">
        <Link
          href="/admin/viaturas"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors group mb-4">
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Voltar para Viaturas</span>
        </Link>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/admin/viaturas"
            className="hover:text-teal-600 transition-colors">
            Viaturas
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Nova Viatura</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <FormularioCadastroViatura
              onSucesso={() => {
                router.push("/admin/viaturas");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaViatura;
