import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toSnakeCase, toCamelCase } from "@/lib/utils";

// Note: Ensure the 'service_categories' table exists in Supabase. 
// If it doesn't, we can use 'categories' with a type check or create the table.
export async function POST(request: Request) {
    try {
        const { action, role, partnerId, data } = await request.json();
        const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(role);

        if (action === "LIST") {
            const page = data?.page || 1;
            const limit = data?.limit || 50;
            const offset = (page - 1) * limit;

            const { data: services, error } = await supabaseAdmin
                .from("services")
                .select("*")
                .order("name")
                .range(offset, offset + limit - 1);

            if (error) throw error;
            return NextResponse.json(toCamelCase(services));
        }

        if (action === "SAVE") {
            // 1. Determine if global or partner-specific
            const targetPartnerId = data.partnerId || null;

            // 2. Permission Check: 
            // - System admins can save anything.
            // - Partners can ONLY save if they are creating/editing THEIR own item (targetPartnerId matches their own).
            // - Partners CANNOT create/edit global items (targetPartnerId is null).
            if (!isSystemAdmin) {
                if (!partnerId) {
                    return NextResponse.json({ error: "Parceiro não identificado" }, { status: 403 });
                }
                if (targetPartnerId !== partnerId) {
                    return NextResponse.json({ error: "Não autorizado a gerenciar serviços de outros parceiros ou globais" }, { status: 403 });
                }
            }

            const dbData = toSnakeCase(data);
            const { data: upserted, error } = await supabaseAdmin
                .from("services")
                .upsert([{ ...dbData, partner_id: dbData.partner_id || null }])
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json(toCamelCase(upserted));
        }

        if (action === "DELETE") {
            if (!data.id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

            // Check permission
            const { data: existing } = await supabaseAdmin
                .from("services")
                .select("partner_id")
                .eq("id", data.id)
                .single();

            if (!existing) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });

            if (existing.partner_id === null && !isSystemAdmin) {
                return NextResponse.json({ error: "Apenas administradores podem eliminar serviços globais" }, { status: 403 });
            }
            if (existing.partner_id !== null && !isSystemAdmin && existing.partner_id !== partnerId) {
                return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
            }

            const { error } = await supabaseAdmin
                .from("services")
                .delete()
                .eq("id", data.id);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    } catch (error: any) {
        console.error("Erro na operação de categorias de serviço:", error);
        return NextResponse.json(
            { error: error.message || "Erro na operação de categorias de serviço." },
            { status: 500 },
        );
    }
}
