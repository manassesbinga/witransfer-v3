import { NextResponse } from "next/server";
import { getDB } from "@/lib/db-admin";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const db = getDB();

    const user = db.users?.find(
      (u: any) => u.email === email && u.password === password,
    );

    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }

    const isAdmin = ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"].includes(user.role);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Privilégios insuficientes." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 },
    );
  }
}
