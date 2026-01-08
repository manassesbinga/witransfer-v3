import { Suspense } from "react"
import { ViaturasContent } from "@/components/partner/pages/viaturas-content"

export default function ViaturasPage() {
  return (
    <Suspense fallback={null}>
      <ViaturasContent />
    </Suspense>
  )
}
