"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";
import { supabase } from "@/lib/supabase";

/**
 * Verifica se um email existe na base de dados do Supabase.
 */
export async function verifyEmail(email: string) {
  return createPublicAction(
    "VerifyEmail",
    async (emailStr: string) => {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", emailStr.toLowerCase());

      const exists = !!data && data.length > 0;

      return {
        exists,
        message: exists
          ? "Bem-vindo de volta!"
          : "Este e-mail ainda não está registrado.",
      };
    },
    email,
  );
}
