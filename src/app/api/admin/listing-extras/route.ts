import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toSnakeCase, toCamelCase } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { action, role, partnerId, data } = await request.json();
    const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(role);

    if (action === "LIST") {
      const page = data?.page || 1;
      const limit = data?.limit || 50;
      const offset = (page - 1) * limit;

      if (isSystemAdmin) {
        const { data: extras, error } = await supabaseAdmin
          .from("extras")
          .select("*")
          .order("name")
          .range(offset, offset + limit - 1);
        if (error) throw error;
        return NextResponse.json(toCamelCase(extras));
      }

      // For partner users: return extras belonging to the partner OR extras linked to partner's vehicles
      if (!partnerId) return NextResponse.json([]);

      // Get vehicles for partner to collect vehicle IDs and any extras arrays
      const { data: vehicles } = await supabaseAdmin
        .from("vehicles")
        .select("id,extras")
        .eq("partner_id", partnerId);

      const vehicleExtrasIds = ((vehicles || []).flatMap((v: any) => Array.isArray(v.extras) ? v.extras : []) as string[]).filter(Boolean);

      // Build OR conditions: global extras OR partner's own extras OR extras in vehicle arrays
      const ors: string[] = [];
      ors.push("partner_id.is.null");  // Global extras (visible to all)
      ors.push(`partner_id.eq.${partnerId}`);  // Partner's own extras
      if (vehicleExtrasIds.length > 0) ors.push(`id.in.(${vehicleExtrasIds.join(",")})`);  // Extras in vehicles
      const orQuery = ors.join(",");
      const { data: extras, error } = await supabaseAdmin
        .from("extras")
        .select("*")
        .or(orQuery)
        .order("name")
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return NextResponse.json(toCamelCase(extras));
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
          return NextResponse.json({ error: "Não autorizado a gerenciar extras de outros parceiros ou globais" }, { status: 403 });
        }
      }

      const dbData = toSnakeCase(data);

      // No vehicle_id column anymore - extras are catalog items
      // Partners can only create extras with their own partner_id

      const { data: upserted, error } = await supabaseAdmin
        .from("extras")
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
        .from("extras")
        .select("partner_id")
        .eq("id", data.id)
        .single();

      if (!existing) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });

      // Global items (partner_id = null): only admin can delete
      if (existing.partner_id === null && !isSystemAdmin) {
        return NextResponse.json({ error: "Apenas administradores podem eliminar itens globais" }, { status: 403 });
      }

      if (existing.partner_id !== null && !isSystemAdmin && existing.partner_id !== partnerId) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }

      const { error } = await supabaseAdmin
        .from("extras")
        .delete()
        .eq("id", data.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na operação de extras:", error);
    return NextResponse.json(
      { error: error.message || "Erro na operação de extras." },
      { status: 500 },
    );
  }
}
