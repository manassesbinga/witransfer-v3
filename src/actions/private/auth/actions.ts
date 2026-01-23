"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";
import { unstable_cache, revalidateTag, unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

// 1. Define Cached User Fetcher
// 1. Define Fresh User Fetcher (NO CACHE)
const getCachedUserProfile = async (userId: string) => {
  console.log(`🔍 FETCH: Getting fresh user profile from DB for ${userId}`);

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select(`
      id,
      email,
      full_name,
      role,
      sub_role,
      partner_id,
      avatar_url,
      is_active,
      partners (
        status,
        is_verified,
        name,
        avatar_url,
        logo_url
      )
    `)
    .eq("id", userId)
    .single();

  if (error || !user) return null;

  // Handle Supabase potential array return for joined data
  const pRaw = user.partners as any;
  const p = Array.isArray(pRaw) ? pRaw[0] : pRaw;

  const partnerStatus = p ? p.status : "active";
  const isVerifiedStatus = p ? (p.is_verified === true) : false;
  const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(user.role);
  const isPrincipalPartner = false;
  const finalIsVerified = isSystemAdmin || isVerifiedStatus || isPrincipalPartner;

  console.log(`----------------------------------------------------------------`);
  console.log(`🔍 [AUTH] Verificando utilizador: ${user.email}`);
  console.log(`🏢 [AUTH] Dados do Parceiro encontrados: ${!!p}`);
  console.log(`✅ [AUTH] DB is_verified: ${p?.is_verified}`);
  console.log(`⭐ [AUTH] Role: ${user.role} | Admin? ${isSystemAdmin}`);
  console.log(`🚀 [AUTH] Final isVerified enviado: ${finalIsVerified}`);
  console.log(`----------------------------------------------------------------`);

  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    subRole: user.sub_role,
    partnerId: user.partner_id,
    avatarUrl: user.avatar_url || (p ? (p.avatar_url || p.logo_url) : null),
    partnerName: p ? p.name : null,
    partnerStatus: partnerStatus,
    isVerified: finalIsVerified,
    isPrincipal: isPrincipalPartner
  };
};

export async function loginAdminAction(credentials: any) {
  return actionMiddleware("loginAdmin", async () => {
    const result = await apiRequest("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      cache: "no-store",
    });

    if (!result.success)
      throw new Error(result.error || "Falha na autenticação");

    const { user, token } = result;
    const cookieStore = await cookies();

    cookieStore.set("admin_session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
    });
    cookieStore.set("admin_auth", "true", { path: "/", maxAge: 86400 });

    // Revalidate cache for this user immediately on login
    if (user && user.id) {
      revalidateTag(`user-profile-${user.id}`);
    }

    return user;
  }, credentials);
}

export async function getCurrentUserAction() {
  return actionMiddleware("getCurrentUser", async () => {
    noStore(); // Force the action to be dynamic and skip static generation/caching
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autenticado");

    // Fetch the profile (revalidate: 0 ensures it's fresh)
    const cachedUser = await getCachedUserProfile(session.id);

    return cachedUser || session;
  }, {});
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  cookieStore.delete("admin_session");
  redirect("/login");
}
