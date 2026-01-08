import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { PartnerSidebar } from "@/components/partner/partner-sidebar"
import { PartnerHeader } from "@/components/partner/partner-header"

export const metadata: Metadata = {
  title: "WiTransfer - Painel do Parceiro",
  description: "Sistema de Gestão para Parceiros WiTransfer",
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PartnerSidebar />
      <div className="flex-1 flex flex-col">
        <PartnerHeader />
        <Suspense fallback={null}>
          <main className="flex-1 p-6">{children}</main>
        </Suspense>
      </div>
    </div>
  )
}
