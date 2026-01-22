"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { actionMiddleware } from "@/middlewares/actions/action-factory"
import { revalidatePath } from "next/cache"

export async function getBudgetRequestsAction() {
    return actionMiddleware("GetBudgetRequests", async () => {
        const { data, error } = await supabaseAdmin
            .from("budget_requests")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error
        return data || []
    }, {})
}

export async function updateBudgetStatusAction(id: string, status: string, quotedAmount?: number) {
    return actionMiddleware("UpdateBudgetStatus", async () => {
        const updateData: any = { status, updated_at: new Date().toISOString() }
        if (quotedAmount !== undefined) updateData.quoted_amount = quotedAmount

        const { error } = await supabaseAdmin
            .from("budget_requests")
            .update(updateData)
            .eq("id", id)

        if (error) throw error
        revalidatePath("/finance/budgets")
        return { success: true }
    }, { id, status, quotedAmount })
}
