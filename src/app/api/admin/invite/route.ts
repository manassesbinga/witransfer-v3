import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  const db = getDB();
  let invited = null;

  if (type === "company") {
    invited = db.companies?.find((c: any) => c.id === id);
  } else {
    invited = db.users?.find((u: any) => u.id === id);
  }

  if (!invited || invited.status !== "invited") {
    return NextResponse.json(
      { error: "Convite inválido ou já expirado." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    name: invited.name,
    email: invited.email,
    type,
  });
}

export async function POST(request: Request) {
  try {
    const { id, type, password } = await request.json();
    const db = getDB();

    if (type === "company") {
      const index = db.companies.findIndex((c: any) => c.id === id);
      if (index === -1) throw new Error("Empresa não encontrada");

      db.companies[index].status = "active";
      db.companies[index].activatedAt = new Date().toISOString();

      // Se for empresa, geralmente o admin dela precisa de um usuário inicial
      // Mas para este fluxo simplificado, apenas ativamos
    } else {
      const index = db.users.findIndex((u: any) => u.id === id);
      if (index === -1) throw new Error("Usuário não encontrado");

      db.users[index].password = password;
      db.users[index].status = "active";
      db.users[index].activatedAt = new Date().toISOString();
    }

    saveDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
