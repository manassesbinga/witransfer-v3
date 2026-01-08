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
    const { email, firstName, lastName, phone, ...transferData } = body;

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

    // 3. Criar viagem/transfer
    const newTransfer = {
      id: `TRF-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      userId: user.id,
      ...transferData,
      customerEmail: email,
      customerName: `${firstName} ${lastName}`,
      status: "pending",
      type: "transfer",
      createdAt: new Date().toISOString(),
    };

    // Adicionar à lista de bookings (transfers são um tipo de booking)
    db.bookings.push(newTransfer);

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
            type: "transfer_confirmation",
            data: {
              transferId: newTransfer.id,
              customerName: `${firstName} ${lastName}`,
              transfer: newTransfer,
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
      transfer: newTransfer,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      userCreated,
      message: userCreated
        ? "Viagem criada e conta criada com sucesso!"
        : "Viagem criada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar viagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const db = getDb();

    if (userId) {
      // Retornar viagens de um usuário específico
      const userTransfers = db.bookings.filter(
        (b: any) => b.userId === userId && b.type === "transfer",
      );
      return NextResponse.json({ transfers: userTransfers });
    }

    // Retornar todas as viagens
    const allTransfers = db.bookings.filter((b: any) => b.type === "transfer");
    return NextResponse.json({ transfers: allTransfers });
  } catch (error) {
    console.error("Erro ao buscar viagens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
