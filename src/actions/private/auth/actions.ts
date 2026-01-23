"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { actionMiddleware } from "@/middlewares/actions/action-factory";
import { apiRequest } from "@/lib/api";
import { getAdminSessionInternal } from "../session";
import { unstable_cache, revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

// 1. Define Cached User Fetcher
const getCachedUserProfile = async (userId: string) => {
  return await unstable_cache(
    async () => {
      console.log(`🔍 CACHE MISS: Creating cache for user ${userId}`);

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

      const p = user.partners as any;
      const partnerStatus = p ? p.status : "active";
      const isVerifiedStatus = p ? p.is_verified : false;
      const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(user.role);
      const isPrincipalPartner = false;

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
        isVerified: isSystemAdmin || isVerifiedStatus || isPrincipalPartner,
        isPrincipal: isPrincipalPartner
      };
    },
    [`user-profile-${userId}`],
    {
      tags: [`user-profile-${userId}`],
      revalidate: 3600
    }
  )();
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
    const session = await getAdminSessionInternal();
    if (!session) throw new Error("Não autenticado");

    // Instead of returning just the session (token payload), 
    // fetch the full cached profile which is guaranteed to have the avatar/name logic
    const cachedUser = await getCachedUserProfile(session.id);

    return cachedUser || session; // Fallback to session if cache fails
  }, {});
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  cookieStore.delete("admin_session");
  redirect("/login");
}
