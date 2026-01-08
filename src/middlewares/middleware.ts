import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isClientAuth = request.cookies.get("is_auth")?.value === "true";
  const isAdminAuth = request.cookies.get("admin_auth")?.value === "true";
  const { pathname } = request.nextUrl;

  /**
   * REGRA 1: ÁREA ADMINISTRATIVA
   * Proteção total para qualquer rota /admin
   */
  if (pathname.startsWith("/admin")) {
    if (!isAdminAuth) {
      // Se não estiver logado como ADMIN, vai para o portal de login administrativo
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  /**
   * REGRA 2: LOGIN DO PORTAL
   * Se já estiver logado como ADMIN, não precisa ver a tela de login do portal
   */
  if (pathname === "/portal" && isAdminAuth) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  /**
   * REGRA 3: ÁREA PÚBLICA / CLIENTE
   * Redirecionamentos automáticos apenas para a experiência do cliente (is_auth)
   */
  if (pathname === "/" && isClientAuth) {
    // Exemplo: se o cliente logado for para a home, ele pode ser enviado para a pesquisa
    return NextResponse.redirect(new URL("/search/rental", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/portal", "/history/:path*"],
};
