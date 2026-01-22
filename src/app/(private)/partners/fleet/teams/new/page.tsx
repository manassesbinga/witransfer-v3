/** @format */

"use client"

import { TeamMemberForm } from "@/components"
import { useRouter } from "next/navigation"

export default function NewTeamMemberPage() {
    const router = useRouter()

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <TeamMemberForm
                onSuccess={() => {
                    router.push("/partners/fleet/teams")
                    router.refresh()
                }}
            />
        </div>
    )
}
