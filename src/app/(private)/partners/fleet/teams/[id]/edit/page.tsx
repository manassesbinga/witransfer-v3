/** @format */

"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TeamMemberForm } from "@/components"
import { getDriverAction } from "@/actions/private/team/actions";
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditTeamMemberPage() {
    const params = useParams()
    const router = useRouter()
    const [member, setMember] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            getDriverAction(params.id as string).then(res => {
                const response = res as any;
                if (response.success && response.data) {
                    const data = response.data;

                    // Map backend data to form format
                    let role = data.subRole || data.sub_role || (data.role === "DRIVER" ? "motorista" : "manager");
                    if (role === "driver") role = "motorista";

                    const formData = {
                        ...data,
                        name: data.name || data.fullName,
                        nickName: data.nickname || data.nickName,
                        role,
                        telefone: data.phone || data.telefone,
                        telefoneAlternativo: data.phoneAlt || data.telefoneAlternativo,
                        fotoPerfil: data.avatarUrl || data.avatar_url || data.fotoPerfil,
                        nacionalidade: data.nationality || data.nacionalidade,
                        numeroDocumento: data.documentNumber || data.document_number,
                        address: data.addressStreet || data.address,
                        city: data.addressCity || data.city,
                        province: data.addressProvince || data.province,

                        // Driver specific
                        cartaConducao: data.licenseNumber || data.cartaConducao,
                        dataValidadeCarta: data.licenseExpiry || data.dataValidadeCarta,
                        dataEmissaoCarta: data.licenseDate || data.dataEmissaoCarta,
                        cartaProfissional: data.professionalLicense ?? data.cartaProfissional,
                        experienciaAnos: data.experienceYears ?? data.experienciaAnos,
                        idiomasFalados: data.languages || data.idiomasFalados || [],

                        vehicleId: data.vehicleId || (data.vehicles && data.vehicles[0]?.id) || "",
                        disponibilidade: data.isActive === false ? "Inactive" : "Active"
                    };
                    setMember(formData);
                }
                setLoading(false)
            })
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-10 w-48 rounded-none" />
                <Skeleton className="h-[600px] w-full rounded-none" />
            </div>
        )
    }

    if (!member) {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <div className="bg-red-50 border border-red-200 p-6 rounded-none">
                    <p className="text-red-800 font-bold">Membro não encontrado</p>
                    <Button onClick={() => router.back()} className="mt-4">
                        Voltar
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <TeamMemberForm
                isEdit
                memberId={params.id as string}
                initialData={member}
                onSuccess={() => router.push("/partners/fleet/teams")}
            />
        </div>
    )
}
