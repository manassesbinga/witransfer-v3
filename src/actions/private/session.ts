"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Utilitário exclusivo de servidor para recuperar a sessão administrativa.
 * Agora valida contra a base de dados para evitar sessões "fantasma" após resets.
 */
export async function getAdminSessionInternal() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;

  const session = await verifyToken(token);
  if (!session) return null;

  // Verificação de Segurança Real-Time: O utilizador ainda existe na DB?
  const { data: userExists } = await supabaseAdmin
    .from("users")
    .select("id, partner_id")
    .eq("id", session.id)
    .single();

  if (!userExists) {
    // Se o utilizador foi apagado da DB (por exemplo, via Seed/Truncate),
    // a sessão deve ser considerada inválida.
    return null;
  }

  // Se o utilizador mudou de parceiro na DB, atualizamos a sessão em memória
  return {
    ...session,
    partnerId: userExists.partner_id
  };
}
