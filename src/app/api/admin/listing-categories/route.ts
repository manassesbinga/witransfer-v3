import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db-admin";

export async function POST(request: Request) {
  try {
    const { action, role, companyId, data } = await request.json();
    const db = getDB();

    if (action === "LIST") {
      return NextResponse.json(db.categories || []);
    }

    if (action === "SAVE") {
      if (role !== "SUPER_ADMIN")
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

      if (!db.categories) db.categories = [];

      const index = db.categories.findIndex((c: any) => c.id === data.id);
      if (index > -1) {
        db.categories[index] = { ...db.categories[index], ...data };
      } else {
        db.categories.push({ ...data, companyId: "system" });
      }

      saveDB(db);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro na operação de categorias." },
      { status: 500 },
    );
  }
}
