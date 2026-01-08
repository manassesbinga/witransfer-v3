import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db-admin";
import { sendEmail } from "@/lib/mail";

export async function GET() {
  console.log("[API] Companies GET called");
  const db = getDB();
  return NextResponse.json(db.companies || []);
}

export async function POST(request: Request) {
  console.log("[API] Companies Operation Started (POST)");
  try {
    const body = await request.json();
    const { action, role, data } = body;
    console.log(`[API] Action: ${action}, Role: ${role}`);

    const db = getDB();

    if (action === "LIST") {
      return NextResponse.json(db.companies || []);
    }

    if (action === "SAVE") {
      const newCompany = {
        ...data,
        id: `comp_${Date.now()}`,
        status: "invited",
        createdAt: new Date().toISOString(),
      };

      if (!db.companies) db.companies = [];
      db.companies.push(newCompany);
      saveDB(db);

      if (data.email) {
        const inviteLink = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/portal/invite?type=company&id=${newCompany.id}`;

        await sendEmail({
          to: data.email,
          subject: "Convite WiTransfer: Configure o acesso da sua empresa",
          template: "invitation",
          templateData: {
            type: "company",
            name: data.name,
            inviteLink,
          },
        }).catch((err) =>
          console.error("Falha ao enviar e-mail de convite para empresa:", err),
        );
      }

      return NextResponse.json(newCompany);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro na operação de empresas:", error);
    return NextResponse.json(
      { error: "Erro na operação de empresas." },
      { status: 500 },
    );
  }
}
