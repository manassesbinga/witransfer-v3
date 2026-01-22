"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";
import { supabase } from "@/lib/supabase";

export async function getUserByEmail(email: string) {
  return createPublicAction(
    "GetUserByEmail",
    async (emailStr: string) => {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", emailStr.toLowerCase())
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is 'no rows returned'
        throw error;
      }

      return {
        data: user || null,
        exists: !!user,
      };
    },
    email,
  );
}

export async function createUser(userData: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  return createPublicAction(
    "CreateUser",
    async (data: any) => {
      // 1. Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", data.email.toLowerCase())
        .single();

      if (existingUser) {
        throw new Error("Usuário já existe com este email");
      }

      // 2. Criar novo usuário
      const newUser = {
        email: data.email.toLowerCase(),
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
        created_at: new Date().toISOString(),
        role: 'CLIENT'
      };

      const { data: insertedUser, error } = await supabase
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (error) throw error;

      return {
        data: insertedUser,
        message: "Usuário criado com sucesso",
      };
    },
    userData,
  );
}

export async function getUserBookings(userId: string) {
  return createPublicAction(
    "GetUserBookings",
    async (id: string) => {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", id);

      if (error) throw error;
      return bookings;
    },
    userId,
  );
}
