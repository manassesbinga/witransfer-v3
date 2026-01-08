"use server";

import { cookies } from "next/headers";

/**
 * Utilitário exclusivo de servidor para recuperar a sessão administrativa.
 * Sendo um arquivo "use server", ele pode ser usado por outras Server Actions.
 */
export async function getAdminSessionInternal() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}
