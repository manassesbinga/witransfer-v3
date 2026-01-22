import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/mail";
import { toSnakeCase, toCamelCase } from "@/lib/utils";

export async function GET() {
  const { data: partners, error } = await supabaseAdmin.from("partners").select("*");
  if (error) {
    console.error("Erro ao listar parceiros:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(toCamelCase(partners));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, role, data } = body;

    if (action === "LIST") {
      const { data: partners, error } = await supabaseAdmin.from("partners").select("*");
      if (error) throw error;
      return NextResponse.json(toCamelCase(partners));
    }

    if (action === "SAVE") {
      const dbData = toSnakeCase(data);
      const newPartner = {
        ...dbData,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const { data: inserted, error } = await supabaseAdmin
        .from("partners")
        .insert([newPartner])
        .select()
        .single();

      if (error) throw error;

      if (data.email) {
        const inviteLink = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/login/invite?type=partner&id=${inserted.id}`;

        await sendEmail({
          to: data.email,
          subject: "Convite WiTransfer: Configure o acesso da sua conta de parceiro",
          template: "invitation",
          templateData: {
            type: "partner",
            name: data.name,
            inviteLink,
          },
        }).catch((err) =>
          console.error("Falha ao enviar e-mail de convite para empresa:", err),
        );
      }

      return NextResponse.json(toCamelCase(inserted));
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na operação de parceiros:", error);
    return NextResponse.json(
      { error: error.message || "Erro na operação de parceiros." },
      { status: 500 },
    );
  }
}
