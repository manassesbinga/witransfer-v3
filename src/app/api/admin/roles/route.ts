import { NextResponse } from "next/server";
import { getDB } from "@/lib/db-admin";

export async function POST(request: Request) {
  try {
    const { role, companyId } = await request.json();
    const db = getDB();

    let roles = db.roles || [];

    if (role !== "SUPER_ADMIN") {
      roles = roles.filter(
        (r: any) => r.companyId === companyId || r.companyId === "system",
      );
    }

    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar roles." },
      { status: 500 },
    );
  }
}
