import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db-admin";

export async function POST(request: Request) {
  try {
    const { action, role, companyId, data } = await request.json();
    const db = getDB();

    if (action === "LIST") {
      return NextResponse.json(db.extras || []);
    }

    if (action === "SAVE") {
      if (role !== "SUPER_ADMIN")
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

      if (!db.extras) db.extras = [];

      const newExtra = {
        ...data,
        id: data.id || `extra_${Date.now()}`,
        companyId: "system",
      };

      const index = db.extras.findIndex((e: any) => e.id === newExtra.id);
      if (index > -1) {
        db.extras[index] = newExtra;
      } else {
        db.extras.push(newExtra);
      }

      saveDB(db);
      return NextResponse.json(newExtra);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro na operação de extras." },
      { status: 500 },
    );
  }
}
