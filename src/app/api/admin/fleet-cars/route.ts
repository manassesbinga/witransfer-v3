import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toSnakeCase, toCamelCase } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, role, partnerId, data } = body;
    const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(role);

    if (action === "LIST") {
      let query = supabaseAdmin
        .from("vehicles")
        .select(`
          *,
          partners(name)
        `);

      if (!isSystemAdmin) {
        query = query.eq("partner_id", partnerId);
      }

      const { data: vehicles, error } = await query;
      if (error) throw error;

      return NextResponse.json(mapToFrontend(vehicles));
    }

    if (action === "SAVE") {
      const isNew = !data.id;
      const dbData = toSnakeCase(data);

      // Map image to image_url
      if (dbData.image && !dbData.image_url) {
        dbData.image_url = dbData.image;
        delete dbData.image;
      }

      if (data.category) dbData.vehicle_class_id = data.category;
      if (data.memberId) dbData.current_driver_id = data.memberId;

      const booleanFields = ["has_ac", "has_abs", "has_airbags", "has_lsd", "has_eb"];
      booleanFields.forEach(f => {
        const camelKey = toCamelCase(f);
        if (data[camelKey] !== undefined) dbData[f] = data[camelKey];
      });

      if (data.luggageCapacity !== undefined) dbData.luggage_big = data.luggageCapacity;
      if (data.smallLuggageCapacity !== undefined) dbData.luggage_small = data.smallLuggageCapacity;

      // Ensure services is saved (it's a column in vehicles table now)
      // dbData.services = data.services || []; // toSnakeCase already handles this but let's be safe

      const dateFields = ["last_service", "next_service", "insurance_expiry", "inspection_last", "inspection_expiry"];
      dateFields.forEach(field => {
        if (dbData[field] === "") dbData[field] = null;
      });

      // CLEAN UP properties that don't exist in the DB
      delete dbData.image; // Already mapped to image_url
      delete dbData.category; // Already mapped to vehicle_class_id
      delete dbData.member_id; // mapped to current_driver_id
      delete dbData.memberId;
      delete dbData.has_a_c;
      delete dbData.has_a_b_s;
      delete dbData.has_air_bags;
      delete dbData.has_l_s_d;
      delete dbData.has_e_b;
      delete dbData.luggage_capacity;
      delete dbData.small_luggage_capacity;

      if (isNew) {
        const { data: inserted, error } = await supabaseAdmin
          .from("vehicles")
          .insert([{
            ...dbData,
            partner_id: isSystemAdmin ? dbData.partner_id || null : partnerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(mapToFrontend([inserted])[0]);
      } else {
        const { data: updated, error: updateError } = await supabaseAdmin
          .from("vehicles")
          .update({ ...dbData, updated_at: new Date().toISOString() })
          .eq("id", data.id)
          .select()
          .single();
        if (updateError) throw updateError;
        return NextResponse.json(mapToFrontend([updated])[0]);
      }
    }

    if (action === "DELETE") {
      const { carId } = body;

      // 1. Role Check
      const isAllowedRole = ["SUPER_ADMIN", "ADMIN", "GERENCIADOR", "PARTNER_ADMIN"].includes(role);
      if (!isAllowedRole) {
        return NextResponse.json({ error: "Acesso negado. Apenas administradores podem eliminar veículos." }, { status: 403 });
      }

      // 2. Booking Association Check
      const { count, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .select("*", { count: 'exact', head: true })
        .eq("vehicle_id", carId);

      if (bookingError) throw bookingError;

      if (count && count > 0) {
        return NextResponse.json({
          error: "Não é possível eliminar este veículo porque existem reservas (alugueres ou viagens) associadas a ele."
        }, { status: 400 });
      }

      // 3. Check ownership for Partner Admin
      if (!isSystemAdmin) {
        const { data: vehicle } = await supabaseAdmin
          .from("vehicles")
          .select("partner_id")
          .eq("id", carId)
          .single();

        if (vehicle?.partner_id !== partnerId) {
          return NextResponse.json({ error: "Acesso negado. Este veículo não pertence à sua empresa." }, { status: 403 });
        }
      }

      const { error } = await supabaseAdmin.from("vehicles").delete().eq("id", carId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na operação de viaturas:", error);
    console.error("Detalhes do erro:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: "Erro na operação de viaturas.",
        details: error.message || error.details || "Erro desconhecido",
        code: error.code
      },
      { status: 500 },
    );
  }
}

// Helper to map DB record to Frontend preferred keys
function mapToFrontend(data: any[]) {
  return data.map(v => {
    const camel = toCamelCase(v);
    const servicesArray = Array.isArray(v.services) ? v.services : (Array.isArray(camel.services) ? camel.services : []);

    return {
      ...camel,
      image: v.image_url,
      category: v.vehicle_class_id,
      luggageCapacity: v.luggage_big,
      smallLuggageCapacity: v.luggage_small,
      memberId: v.current_driver_id,
      partnerName: v.partners?.name,
      services: servicesArray,
      // Correct casing for acronyms
      hasAC: v.has_ac,
      hasABS: v.has_abs,
      hasLSD: v.has_lsd,
      hasEB: v.has_eb
    };
  });
}
