"use client"

import { useEffect, useState } from "react"
import { PartnerForm } from "@/components"
import { getCurrentUserAction } from "@/actions/private/auth/actions"
import { getServiceTypesAction, savePartnerProfileAction, getPartnerProfileAction } from "@/actions/private/partners/actions"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function PartnerProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [partnerData, setPartnerData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const res = await getPartnerProfileAction()

                if (res.success) {
                    setUser(res.data)
                    setPartnerData(res.data)
                }
            } catch (error) {
                console.error("Erro ao carregar perfil:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleSaveProfile = async (data: any) => {
        try {
            const result = await savePartnerProfileAction(data)
            if (result.success) {
                toast.success("Perfil atualizado com sucesso! Os dados passarão por verificação.")
            } else {
                toast.error(result.error || "Ocorreu um erro ao atualizar o perfil")
            }
        } catch (error) {
            toast.error("Erro ao salvar alterações")
        }
    }



    if (loading) {
        return (
            <div className="container mx-auto py-6 space-y-8 animate-pulse">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64 rounded-none" />
                    <Skeleton className="h-4 w-full max-w-md rounded-none" />
                </div>
                <div className="bg-white border border-slate-200 p-8 space-y-6 rounded-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-32 rounded-none" />
                                <Skeleton className="h-12 w-full rounded-none" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32 rounded-none" />
                        <Skeleton className="h-32 w-full rounded-none" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6">
            <PartnerForm
                mode="edit"
                isProfile={true}
                initialData={partnerData}
                onSubmit={handleSaveProfile}
            />
        </div>
    )
}
