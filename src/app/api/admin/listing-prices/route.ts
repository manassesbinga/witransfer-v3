import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toSnakeCase, toCamelCase } from "@/lib/utils";

export async function POST(request: Request) {
    try {
        const { action, role, data } = await request.json();

        // Security check
        const isAuthorized = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR", "PARTNER_ADMIN"].includes(role);
        if (!isAuthorized) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
        }

        if (action === "LIST_BY_CLASS") {
            const { classId, partnerId } = data;

            // 1. Buscar todos os serviços ativos (base para os preços)
            const { data: services, error: servicesError } = await supabaseAdmin
                .from("services")
                .select("id, name, billing_type, included_quantity")
                .eq("is_active", true);

            if (servicesError) throw servicesError;

            // 2. Buscar preços existentes (Sistema + Parceiro se aplicável)
            let pricesQuery = supabaseAdmin
                .from("service_class_prices")
                .select("*")
                .eq("vehicle_class_id", classId);

            if (partnerId) {
                // Filtra preços do sistema (null) OU do parceiro específico
                pricesQuery = pricesQuery.or(`partner_id.is.null,partner_id.eq.${partnerId}`);
            } else {
                // Se for admin geral, busca apenas preços do sistema (onde partner_id é null)
                pricesQuery = pricesQuery.is("partner_id", null);
            }

            const { data: prices, error: pricesError } = await pricesQuery;
            if (pricesError) throw pricesError;

            // 3. Combinar: Priorizar preço do parceiro, cair no sistema, ou usar 0
            const result = services.map(service => {
                const partnerPrice = partnerId ? prices.find(p => p.service_id === service.id && p.partner_id === partnerId) : null;
                const systemPrice = prices.find(p => p.service_id === service.id && p.partner_id === null);

                const priceEntry = partnerPrice || systemPrice;

                return {
                    serviceId: service.id,
                    serviceName: service.name,
                    billingType: service.billing_type,
                    includedQuantity: service.included_quantity || 0,
                    price: priceEntry ? Number(priceEntry.price) : 0,
                    minPrice: priceEntry ? Number(priceEntry.min_price) : 0,
                    extraPrice: priceEntry ? Number(priceEntry.extra_price) : 0,
                    priceId: priceEntry ? priceEntry.id : null,
                };
            });

            return NextResponse.json(toCamelCase(result));
        }

        if (action === "SAVE_BATCH") {
            const { classId, prices, partnerId } = data;
            console.log(`[SAVE_BATCH_DEBUG] Class: ${classId}, Partner: ${partnerId}, Items: ${prices?.length}`);

            if (!classId || !Array.isArray(prices) || prices.length === 0) {
                console.warn("[SAVE_BATCH_DEBUG] Invalid or empty data received.");
                return NextResponse.json({ success: true, message: "Nothing to save" });
            }

            // Preparar dados para inserção
            const upsertData = prices.map((p: any) => ({
                vehicle_class_id: classId,
                service_id: p.serviceId,
                price: Number(p.price || 0),
                min_price: Number(p.minPrice || 0),
                extra_price: Number(p.extraPrice || 0),
                partner_id: partnerId || null,
                created_at: new Date().toISOString()
            }));

            // Usar delete + insert para contornar limitações de ON CONFLICT com NULLs em Postgres
            // para o campo partner_id. É mais seguro.
            const deleteQuery = supabaseAdmin
                .from("service_class_prices")
                .delete()
                .eq("vehicle_class_id", classId);

            if (partnerId) {
                deleteQuery.eq("partner_id", partnerId);
            } else {
                deleteQuery.is("partner_id", null);
            }

            const { error: deleteError } = await deleteQuery;
            if (deleteError) {
                console.error("[SAVE_BATCH_DEBUG] Delete error:", deleteError);
                throw deleteError;
            }

            const { data: result, error: insertError } = await supabaseAdmin
                .from("service_class_prices")
                .insert(upsertData)
                .select();

            if (insertError) {
                console.error("[SAVE_BATCH_DEBUG] Insert error:", insertError);
                throw insertError;
            }

            console.log(`[SAVE_BATCH_DEBUG] Successfully saved ${result?.length} records.`);
            return NextResponse.json(toCamelCase(result));
        }

        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });

    } catch (error: any) {
        console.error("Erro na operação de preços:", error);
        return NextResponse.json(
            { error: error.message || "Erro na operação de preços." },
            { status: 500 },
        );
    }
}
