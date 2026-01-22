/** @format */

"use client"

import { PartnerForm } from "@/components"
import { registerPartnerAction as createPartnerActionReal } from "@/actions/private/partners/actions"
import { useRouter } from "next/navigation"

export default function NewPartnerPage() {
    const router = useRouter()

    const handleCreate = async (data: any) => {
        const result = await createPartnerActionReal(data)
        if (result.success) {
            router.push("/admin/dashboard")
            router.refresh()
        }
        return result
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Novo Parceiro</h1>
                <p className="text-slate-500 font-medium font-bold tracking-widest text-[10px]">Registe uma nova empresa ou parceiro individual na plataforma.</p>
            </div>

            <PartnerForm
                mode="create"
                onSubmit={handleCreate}
                onCancel={() => router.back()}
            />
        </div>
    )
}
