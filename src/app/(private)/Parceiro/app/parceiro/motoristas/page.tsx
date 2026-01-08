import { Suspense } from "react"
import { MotoristasContent } from "@/components/partner/pages/motoristas-content"

export default function MotoristasPage() {
  return (
    <Suspense fallback={null}>
      <MotoristasContent />
    </Suspense>
  )
}
