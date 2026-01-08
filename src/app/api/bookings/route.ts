import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");

function getDb() {
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
}

function saveDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, ...bookingData } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 },
      );
    }

    const db = getDb();

    // 1. Verificar se o usuário já existe
    let user = db.users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase(),
    );
    let userCreated = false;

    if (!user) {
      // 2. Criar usuário se não existir
      user = {
        id: `USR-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        email,
        firstName,
        lastName,
        phone,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      userCreated = true;
    }

    // 3. Criar reserva
    const newBooking = {
      id: `BKG-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      userId: user.id,
      ...bookingData,
      customerEmail: email,
      customerName: `${firstName} ${lastName}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    db.bookings.push(newBooking);

    // 4. Salvar no DB
    saveDb(db);

    // 5. Enviar email de confirmação
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            type: "booking_confirmation",
            data: {
              bookingId: newBooking.id,
              customerName: `${firstName} ${lastName}`,
              booking: newBooking,
              userCreated,
            },
          }),
        },
      );
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
      // Não falhar a reserva se o email falhar
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      userCreated,
      message: userCreated
        ? "Reserva criada e conta criada com sucesso!"
        : "Reserva criada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
