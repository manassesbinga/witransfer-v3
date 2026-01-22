"use server";

import { revalidatePath } from "next/cache";
import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

import type { TeamMemberFormData } from "@/types";

export async function getTeamMembersAction(page: number = 1, limit: number = 50) {
    return actionMiddleware("getTeamMembers", async () => {
        const session = await getAdminSessionInternal();
        console.log("[DEBUG_ACTION] Session data:", { role: session?.role, partnerId: session?.partnerId });

        if (!session) {
            console.error("[DEBUG_ACTION] No session found");
            throw new Error("Não autorizado");
        }

        const response = await apiRequest("/api/admin/drivers", {
            method: "POST",
            body: JSON.stringify({
                action: "LIST",
                role: session.role,
                partnerId: session.partnerId,
                data: { page, limit }
            }),
            cache: "no-store",
            next: { tags: ["team"], revalidate: 0 } as any,
        });

        const isArray = Array.isArray(response);
        console.log(`[DEBUG_ACTION] API Content: ${isArray ? "Array(" + response.length + ")" : "Object"}`);

        if (!isArray) {
            console.log("[DEBUG_ACTION] Possible Error Object:", JSON.stringify(response).substring(0, 100));
        }

        console.log("[DEBUG_ACTION] Team Members Data:", JSON.stringify(response).substring(0, 500) + "...");
        return response;
    }, {});
}

export const getDriversAction = getTeamMembersAction;

export async function getTeamMemberAction(id: string) {
    return actionMiddleware("getTeamMember", async () => {
        const session = await getAdminSessionInternal();
        if (!session) throw new Error("Não autorizado");

        const response = await apiRequest("/api/admin/drivers", {
            method: "POST",
            body: JSON.stringify({
                action: "LIST",
                role: session.role,
                partnerId: session.partnerId,
            }),
            cache: "no-store",
        });

        // A API retorna um array diretamente
        if (Array.isArray(response)) {
            const member = response.find((d: any) => d.id === id);
            if (!member) throw new Error("Membro não encontrado");
            console.log("[DEBUG_ACTION] Single Member Data Found:", JSON.stringify(member));
            return member;
        }

        throw new Error("Resposta inválida da API");
    }, { id });
}

export const getDriverAction = getTeamMemberAction;

// Aliases for compatibility during transition
export const getMotoristasAction = getTeamMembersAction;

export async function createTeamMemberAction(data: TeamMemberFormData) {
    return actionMiddleware("createTeamMember", async () => {
        const session = await getAdminSessionInternal();
        if (!session) throw new Error("Não autorizado");

        const result = await apiRequest("/api/admin/drivers", {
            method: "POST",
            body: JSON.stringify({
                action: "CREATE",
                role: session.role,
                partnerId: session.partnerId,
                data,
            }),
        });

        if (result.error) throw new Error(result.error);

        revalidatePath("/partners/fleet/teams");
        return result;
    }, data);
}

export const createDriverAction = createTeamMemberAction;
export const createMotoristaAction = createTeamMemberAction;

export async function updateTeamMemberAction(id: string, data: Partial<TeamMemberFormData>) {
    return actionMiddleware("updateTeamMember", async () => {
        const session = await getAdminSessionInternal();
        if (!session) throw new Error("Não autorizado");

        const result = await apiRequest("/api/admin/drivers", {
            method: "POST",
            body: JSON.stringify({
                action: "UPDATE",
                role: session.role,
                partnerId: session.partnerId,
                id,
                data,
            }),
        });

        if (result.error) throw new Error(result.error);

        revalidatePath("/partners/fleet/teams");
        return result;
    }, { id, data });
}

export const updateDriverAction = updateTeamMemberAction;
export const updateMotoristaAction = updateTeamMemberAction;

export async function deleteTeamMemberAction(id: string) {
    return actionMiddleware("deleteTeamMember", async () => {
        const session = await getAdminSessionInternal();
        if (!session) throw new Error("Não autorizado");

        const result = await apiRequest("/api/admin/drivers", {
            method: "POST",
            body: JSON.stringify({
                action: "DELETE",
                role: session.role,
                partnerId: session.partnerId,
                id,
            }),
        });

        if (result.error) throw new Error(result.error);

        revalidatePath("/partners/fleet/teams");
        return { success: true };
    }, id);
}

export const deleteDriverAction = deleteTeamMemberAction;
export const deleteMotoristaAction = deleteTeamMemberAction;
