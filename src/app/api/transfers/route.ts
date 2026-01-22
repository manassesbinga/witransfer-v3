import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // 1. Verificar se o usuário já existe
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    let currentUser = user;
    let userCreated = false;

    if (!user) {
      // 2. Criar usuário se não existir
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          phone,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (createError) throw createError;
      currentUser = newUser;
      userCreated = true;
    }

    // 3. Criar viagem/transfer
    const { data: newTransfer, error: transferError } = await supabase
      .from("bookings")
      .insert([{
        user_id: currentUser.id,
        ...transferData,
        customer_email: email,
        customer_name: `${firstName} ${lastName}`,
        status: "pending",
        type: "transfer",
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (transferError) throw transferError;

    // 4. Enviar email de confirmação
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
    }

    return NextResponse.json({
      success: true,
      transfer: newTransfer,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
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

    let query = supabase
      .from("bookings")
      .select("*")
      .eq("type", "transfer");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: transfers, error } = await query;

    if (error) throw error;

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error("Erro ao buscar viagens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
