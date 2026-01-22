import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toCamelCase } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { role, companyId } = await request.json();

    let query = supabaseAdmin.from("roles").select("*");

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      query = query.or(`company_id.eq.${companyId},company_id.is.null`);
    }

    const { data: roles, error } = await query;
    if (error) throw error;

    return NextResponse.json(toCamelCase(roles));
  } catch (error: any) {
    console.error("Erro ao buscar roles:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar roles." },
      { status: 500 },
    );
  }
}
