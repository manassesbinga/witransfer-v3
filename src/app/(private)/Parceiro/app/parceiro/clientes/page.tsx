import { Suspense } from "react"
import { ClientesContent } from "@/components/partner/pages/clientes-content"

export default function ClientesPage() {
  return (
    <Suspense fallback={null}>
      <ClientesContent />
    </Suspense>
  )
}
