import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toSnakeCase, toCamelCase } from "@/lib/utils";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, role, partnerId, data } = body;
        const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(role);

        if (action === "LIST") {
            const page = data?.page || 1;
            const limit = data?.limit || 1000;
            const offset = (page - 1) * limit;

            // Se for Parceiro, só vê clientes que já agendaram com ele
            if (!isSystemAdmin) {
                // Find customers who have bookings with this partner
                const { data: partnerBookings, error: bookingsError } = await supabaseAdmin
                    .from("bookings")
                    .select("client_id")
                    .eq("partner_id", partnerId);

                if (bookingsError) throw bookingsError;

                const clientIds = Array.from(new Set(partnerBookings?.map(b => b.client_id) || []));

                if (clientIds.length === 0) {
                    return NextResponse.json([]);
                }

                // In schema V5, clients are in 'users' table with role 'CLIENT'
                const { data: clients, error } = await supabaseAdmin
                    .from("users")
                    .select("*")
                    .eq("role", "CLIENT")
                    .in("id", clientIds)
                    .range(offset, offset + limit - 1)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                return NextResponse.json(toCamelCase(clients));
            }

            // Se for Admin, vê todos os clientes (users com role CLIENT)
            const { data: allClients, error } = await supabaseAdmin
                .from("users")
                .select("*")
                .eq("role", "CLIENT")
                .range(offset, offset + limit - 1)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return NextResponse.json(toCamelCase(allClients));
        }

        if (action === "SAVE") {
            if (role === "PARTNER") {
                return NextResponse.json({ error: "Parceiros não podem cadastrar clientes manualmente." }, { status: 403 });
            }
            // Implementation for SAVE...
        }

        if (action === "DELETE") {
            if (role === "PARTNER") {
                return NextResponse.json({ error: "Parceiros não podem remover clientes." }, { status: 403 });
            }
        }

        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });

    } catch (error: any) {
        console.error("Erro ao processar clientes:", error);
        return NextResponse.json({ error: error.message || "Erro ao processar clientes" }, { status: 500 });
    }
}
