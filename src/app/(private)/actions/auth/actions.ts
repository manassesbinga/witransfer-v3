"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { actionMiddleware } from "@/middlewares/actions/action-wrapper";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";

export async function loginAdminAction(credentials: any) {
  return actionMiddleware("loginAdmin", async () => {
    const result = await apiRequest("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!result.success)
      throw new Error(result.error || "Falha na autenticação");

    const userData = result.user;
    const cookieStore = await cookies();

    cookieStore.set("admin_session", JSON.stringify(userData), {
      path: "/",
      maxAge: 86400,
    });
    cookieStore.set("admin_auth", "true", { path: "/", maxAge: 86400 });

    return userData;
  });
}

export async function getCurrentUserAction() {
  return actionMiddleware("getCurrentUser", async () => {
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autenticado");
    return session;
  });
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  cookieStore.delete("admin_session");
  redirect("/portal");
}
