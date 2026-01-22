"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";

// Helper to generate a 16-character ID
function generateShortId() {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

/**
 * Cria um draft ID para uso com sessionStorage
 * Não salva no banco de dados - tudo fica no navegador
 */
export async function createDraftAction(data: any) {
    return createPublicAction(
        "CreateDraft",
        async (payload: any) => {
            // Gera apenas um ID único
            // O cliente (navegador) é responsável por salvar no sessionStorage
            const draftId = `draft_${Date.now()}_${generateShortId()}`;

            return {
                id: draftId,
                data: payload // Retorna os dados para o cliente salvar
            };
        },
        data,
    );
}

/**
 * Retorna null - o cliente deve buscar do sessionStorage
 * Esta função existe apenas para manter compatibilidade com o código existente
 */
export async function getDraftAction(id: string) {
    return createPublicAction(
        "GetDraft",
        async (draftId: string) => {
            // Não faz nada no servidor
            // O cliente deve buscar do sessionStorage
            return null;
        },
        id,
    );
}
