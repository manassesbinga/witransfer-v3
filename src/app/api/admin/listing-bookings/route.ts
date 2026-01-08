import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db-admin";

export async function POST(request: Request) {
  try {
    const { action, role, companyId, data } = await request.json();
    const db = getDB();

    if (action === "LIST") {
      let bookings = db.bookings || [];

      // Filtro por empresa
      if (role !== "SUPER_ADMIN") {
        bookings = bookings.filter((b: any) => b.companyId === companyId);
      }

      // Se quisermos filtrar por tipo (aluguer vs viagem)
      const type = data?.type;
      if (type) {
        bookings = bookings.filter((b: any) => b.type === type);
      }

      return NextResponse.json(bookings);
    }

    if (action === "UPDATE_STATUS") {
      const { id, status } = data;
      const index = db.bookings.findIndex((b: any) => b.id === id);

      if (index === -1)
        return NextResponse.json(
          { error: "Reserva não encontrada" },
          { status: 404 },
        );

      // Validação de acesso
      if (
        role !== "SUPER_ADMIN" &&
        db.bookings[index].companyId !== companyId
      ) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      db.bookings[index].status = status;
      db.bookings[index].updatedAt = new Date().toISOString();
      saveDB(db);

      return NextResponse.json(db.bookings[index]);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de reservas:", error);
    return NextResponse.json(
      { error: "Erro na operação de reservas." },
      { status: 500 },
    );
  }
}
