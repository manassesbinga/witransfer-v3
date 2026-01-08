import { Suspense } from "react"
import { ViagensContent } from "@/components/partner/pages/viagens-content"

export default function ViagensPage() {
  return (
    <Suspense fallback={null}>
      <ViagensContent />
    </Suspense>
  )
}
