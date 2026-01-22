import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Booking, User } from "@/types";

export async function POST(request: Request) {
  try {
    const body: Partial<Booking> & { firstName?: string; lastName?: string; phone?: string; email?: string; customer?: any } = await request.json();

    // Suportar tanto campos no topo quanto dentro de um objeto 'customer'
    const customer = body.customer || { email: "", name: "", phone: "" };
    // Handle potential legacy customer structure or flat structure
    const customerEmail = (customer as any).email || body.email;
    const email = customerEmail?.toLowerCase();

    // Extract name parts
    const firstName = body.firstName || (customer as any).firstName || (customer.name ? customer.name.split(" ")[0] : "");
    const lastName = body.lastName || (customer as any).lastName || (customer.name ? customer.name.split(" ").slice(1).join(" ") : "");
    const phone = body.phone || customer.phone;

    const bookingData = { ...body };
    delete (bookingData as any).customer; // Evitar duplicidade se colunas forem dinâmicas

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

    // 3. Criar reserva
    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert([{
        user_id: currentUser.id,
        ...bookingData,
        customer_email: email,
        customer_name: `${firstName} ${lastName}`,
        status: "pending",
        type: "rental", // Default para bookings/route.ts parece ser rental
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 4. Enviar email de confirmação
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
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    // Buscar usuário pelo email
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json([]);
    }

    // Buscar reservas do usuário
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Atualizar status para cancelado em vez de deletar fisicamente (boa prática)
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
