import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  let session = token ? await verifyToken(token) : null;

  // Verificação de Segurança Crítica: O utilizador ainda existe na DB?
  if (session) {
    const { data: userExists } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", (session as any).id)
      .single();

    if (!userExists) {
      // Se o utilizador sumiu da DB (ex: após Seed), limpamos o cookie e mandamos para login
      console.log(`🛡️ MIDDLEWARE: Sessão ghost detectada para ID ${session.id}. Redirecionando para /login...`);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("admin_session");
      response.cookies.delete("admin_auth");
      return response;
    }
  }

  const isAdminAuth = !!session;

  const { pathname } = request.nextUrl;

  const isPartnerRole = session && ["PARTNER_ADMIN", "PARTNER_STAFF", "DRIVER"].includes(session.role);
  const isSystemAdmin = session && ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(session.role);
  const isPartnerPending = session?.partnerStatus === "pending" && !session?.isPrincipal;

  /**
   * REGRA 1: ÁREA ADMINISTRATIVA (/admin)
   */
  if (pathname.startsWith("/admin")) {
    if (!isAdminAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Proteção extra: apenas ADMIN/SUPER_ADMIN podem acessar /admin/*
    if (isPartnerRole && !isSystemAdmin) {
      return NextResponse.redirect(new URL("/partners/dashboard", request.url));
    }
  }

  /**
   * REGRA 2: ÁREA DE PARCEIROS (/partners)
   */
  if (pathname.startsWith("/partners")) {
    if (!isAdminAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // BLOQUEIO FINANCEIRO PARA PARCEIROS EM ANÁLISE
    if (pathname.includes("/finance") && isPartnerPending && !isSystemAdmin) {
      return NextResponse.redirect(new URL("/partners/dashboard?error=pending_verification", request.url));
    }
  }

  /**
   * LOGIC: REWRITE AND PROTECT COMMON PATHS
   */
  const commonPaths = ["/fleet", "/operations", "/finance", "/categories/extras"];

  // 1. Rewrite prefixed requests to internal common paths
  const prefixMatch = pathname.match(/^\/(admin|partners)(\/.*)$/);
  if (prefixMatch) {
    const prefix = prefixMatch[1];
    const suffix = prefixMatch[2];
    // Don't rewrite if it's /fleet/teams (partner-specific)
    if (suffix.startsWith("/fleet/teams")) {
      return NextResponse.next();
    }
    if (commonPaths.some((path) => suffix.startsWith(path))) {
      return NextResponse.rewrite(new URL(suffix, request.url));
    }
  }

  // 2. Block direct access to common paths
  if (commonPaths.some((path) => pathname.startsWith(path)) && !pathname.startsWith("/admin") && !pathname.startsWith("/partners")) {
    if (isAdminAuth) {
      const prefix = isPartnerRole ? "partners" : "admin";
      return NextResponse.redirect(new URL(`/${prefix}${pathname}`, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /**
   * REGRA 3: LOGIN DO PORTAL
   */
  if (pathname === "/login" && isAdminAuth) {
    const prefix = isPartnerRole ? "partners/dashboard" : "admin/dashboard";
    return NextResponse.redirect(new URL(`/${prefix}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/partners/:path*", "/login", "/fleet/:path*", "/operations/:path*", "/finance/:path*"],
};
