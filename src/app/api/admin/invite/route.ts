import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toCamelCase } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  let invited = null;

  if (type === "company") {
    const { data } = await supabaseAdmin.from("partners").select("*").eq("id", id).single();
    invited = data;
  } else {
    const { data } = await supabaseAdmin.from("users").select("*").eq("id", id).single();
    invited = data;
  }

  if (!invited || (invited.status !== "invited" && invited.status !== "pending")) {
    return NextResponse.json(
      { error: "Convite inválido ou já expirado." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    name: invited.name || invited.nome,
    email: invited.email,
    type,
  });
}

export async function POST(request: Request) {
  try {
    const { id, type, password } = await request.json();

    if (type === "company") {
      const { error } = await supabaseAdmin
        .from("partners")
        .update({
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("users")
        .update({
          password: password,
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao processar convite:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
