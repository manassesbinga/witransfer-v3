export const dynamic = "force-dynamic";
import { PartnerForm } from "@/components"
import { registerPartnerAction } from "@/actions"
import type { PartnerFormData } from "@/types"

export default async function CadastroParceiroPage() {
    async function handleSubmit(data: PartnerFormData) {
        "use server"
        const result = await registerPartnerAction(data)
        if (!result.success) {
            throw new Error(result.error || "Falha ao registrar parceiro")
        }
        return result
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <PartnerForm
                    mode="create"
                    isPublic={true}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    )
}
