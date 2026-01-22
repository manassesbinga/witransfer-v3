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

      // 1. Buscar as classes com paginação
      const { data: categories, error } = await supabaseAdmin
        .from("vehicle_classes")
        .select("*")
        .order("name")
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // 2. Buscar preços das classes detalhados por serviço
      const { data: prices } = await supabaseAdmin
        .from("service_class_prices")
        .select(`
            vehicle_class_id, 
            price,
            services (
                name
            )
        `)
        .or(`partner_id.is.null,partner_id.eq.${partnerId || "null"}`);

      const result = categories.map(cat => {
        const catPrices = prices?.filter(p => p.vehicle_class_id === cat.id) || [];

        // Mapeia os preços normalizando os nomes
        const servicePrices: Record<string, number> = {};
        catPrices.forEach((p: any) => {
          const rawName = p.services?.name || "";
          const price = Number(p.price || 0);

          const lowerName = rawName.toLowerCase();
          if (lowerName.includes("transfer") || lowerName.includes("viagem")) {
            servicePrices["Transfer"] = price;
          } else if (lowerName.includes("aluguer") || lowerName.includes("rent") || lowerName.includes("reserva")) {
            servicePrices["Aluguer"] = price;
          } else {
            servicePrices[rawName] = price;
          }
        });

        return {
          ...cat,
          servicePrices
        };
      });

      return NextResponse.json(toCamelCase(result));
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
          return NextResponse.json({ error: "Não autorizado a gerenciar categorias de outros parceiros ou globais" }, { status: 403 });
        }
      }

      // 2. Prepare data
      const dbData = {
        name: data.name,
        description: data.description || null,
        icon: data.icon || "car",
        partner_id: data.partnerId || null
      };

      let result;
      if (data.id) {
        // UPDATE
        const { data: updated, error } = await supabaseAdmin
          .from("vehicle_classes")
          .update(dbData)
          .eq("id", data.id)
          .select()
          .single();
        if (error) throw error;
        result = updated;
      } else {
        // INSERT
        const { data: inserted, error } = await supabaseAdmin
          .from("vehicle_classes")
          .insert([dbData])
          .select()
          .single();
        if (error) throw error;
        result = inserted;
      }

      return NextResponse.json(toCamelCase(result));
    }

    if (action === "DELETE") {
      if (!data.id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

      // Check permission
      const { data: existing } = await supabaseAdmin
        .from("vehicle_classes")
        .select("partner_id")
        .eq("id", data.id)
        .single();

      if (!existing) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });

      // Global items: only admin. Partner items: owner or admin.
      if (existing.partner_id === null && !isSystemAdmin) {
        return NextResponse.json({ error: "Apenas administradores podem eliminar itens globais" }, { status: 403 });
      }
      if (existing.partner_id !== null && !isSystemAdmin && existing.partner_id !== partnerId) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }

      const { error } = await supabaseAdmin
        .from("vehicle_classes")
        .delete()
        .eq("id", data.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na operação de categorias:", error);
    return NextResponse.json(
      { error: error.message || "Erro na operação de categorias." },
      { status: 500 },
    );
  }
}
