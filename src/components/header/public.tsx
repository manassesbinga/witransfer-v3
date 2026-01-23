"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Car,
  Navigation,
  Menu,
  User,
  LogOut,
  History as HistoryIcon,
  Users
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSearch } from "@/context/search-context";
import { LoginDialog } from "../modal/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ transparent }: { transparent?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const [navLoading, setNavLoading] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { setData: setSearchData } = useSearch();

  useEffect(() => {
    const auth = localStorage.getItem("is_auth") === "true";
    setIsAuthenticated(auth);

    // Sincronizar cookie se estiver autenticado no localStorage mas não no cookie
    if (auth && !document.cookie.includes("is_auth=true")) {
      document.cookie = "is_auth=true; path=/; max-age=86400";
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // small delay to show spinner and ensure UX feedback
    await new Promise((r) => setTimeout(r, 250));
    localStorage.removeItem("is_auth");
    localStorage.removeItem("user_email");
    // Limpar cookie do Middleware
    document.cookie = "is_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsAuthenticated(false);
    setIsLoggingOut(false);
    window.location.reload();
  };

  const isSearch =
    pathname.startsWith("/search") || pathname.startsWith("/booking");
  const isHomeNav =
    pathname === "/" ||
    pathname.startsWith("/search") ||
    pathname === "/history" ||
    pathname.startsWith("/register");

  // Clear nav loading indicator whenever navigation completes (URL changes)
  useEffect(() => {
    setNavLoading(null);
  }, [pathname, searchParams]);

  const NavItem = ({
    href,
    icon: Icon,
    label,
    active, // optional override
    targetType,
  }: {
    href: string;
    icon: LucideIcon;
    label: string;
    active?: boolean;
    targetType?: "rental" | "transfer";
  }) => {
    let finalHref = href;

    if (pathname === "/") {
      if (targetType === "transfer") finalHref = "/?type=transfer";
      else if (targetType === "rental") finalHref = "/";
    } else if (pathname.startsWith("/search") && targetType) {
      finalHref = targetType === "transfer" ? "/search/transfer" : "/search/rental";
    }

    const isLoading = navLoading === finalHref;

    // Compute active state more reliably: prefer explicit prop, otherwise compare pathname
    const computedActive = typeof active === "boolean"
      ? active
      : pathname === finalHref || pathname.startsWith(finalHref);

    return (
      <Link
        href={finalHref}
        onClick={() => {
          if (!computedActive) setNavLoading(finalHref);
          if (pathname.startsWith("/search") && !finalHref.startsWith("/search")) {
            setSearchData({
              pickup: "Aeroporto Internacional Quatro de Fevereiro, Luanda, Angola",
              dropoff: "",
              from: undefined,
              to: undefined,
              time1: "12:00",
              time2: "12:00",
              type: "rental",
              passengers: "1",
              luggage: "1",
            });
          }
        }}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-full transition-all whitespace-nowrap",
          computedActive
            ? "bg-white/15 ring-1 ring-white/30 text-white"
            : "text-white/80 hover:text-white hover:bg-white/5",
        )}
      >
        <Icon className={cn("h-4 w-4", computedActive ? "text-white" : "text-white/70")} />
        <span className="text-sm font-bold tracking-tight">{label}</span>
        {isLoading && (
          <span className="ml-2 animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "w-full z-50 transition-all duration-300",
        transparent
          ? "absolute top-0 left-0 right-0 bg-transparent pb-40"
          : "relative bg-[#003580] pb-3",
      )}
    >
      <div className="container mx-auto pt-5 pb-1 px-4 relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href={isSearch ? "#" : "/"}
            className={cn(
              "flex items-center gap-2 transition-transform",
              !isSearch && "hover:scale-105 active:scale-95",
            )}
          >
            <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <img
                src="/logo.png"
                alt="WiTransfer Logo"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                WiTransfer
              </span>
              {!isSearch && (
                <span className="text-[10px] font-bold text-blue-200 tracking-widest mt-0.5">
                  Unique Experience
                </span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-white text-[#003580] hover:bg-gray-100 font-bold px-5 h-9 flex items-center gap-2 transition-all active:scale-95">
                    <User className="h-4 w-4" />
                    <span>Minha Conta</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2 shadow-2xl border-none"
                >
                  <DropdownMenuLabel className="text-[10px] font-black text-gray-400 px-2 py-1">
                    Gestão de Conta
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-50" />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-md py-3 focus:bg-blue-50 group"
                    asChild
                  >
                    <Link href="/history" className="flex items-center">
                      <HistoryIcon className="mr-2 h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      <span className="font-bold text-gray-700 group-hover:text-blue-700">
                        Minhas Viagens
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-50" />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-md py-3 text-red-600 focus:text-red-700 focus:bg-red-50 group"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4 text-red-400 group-hover:text-red-600" />
                      <span className="font-black text-[11px]">
                        Sair da Conta
                      </span>
                      {isLoggingOut && (
                        <span className="ml-2 animate-spin h-3 w-3 border-2 border-red-400 rounded-full" />
                      )}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginDialog
                trigger={
                  <Button className="bg-white text-[#003580] hover:bg-gray-100 font-bold px-5 h-9 transition-all active:scale-95 shadow-sm">
                    Gerenciar Reserva
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {isHomeNav && (
          <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
            <NavItem
              href="/"
              icon={Car}
              label="Aluguel"
              active={
                (pathname === "/" && searchParams.get("type") !== "transfer") ||
                (pathname.startsWith("/search") &&
                  !pathname.includes("/transfer"))
              }
              targetType="rental"
            />
            <NavItem
              href="/search/transfer"
              icon={Navigation}
              label="Viagens"
              active={
                (pathname === "/" && searchParams.get("type") === "transfer") ||
                pathname.includes("/search/transfer")
              }
              targetType="transfer"
            />
            {isAuthenticated && (
              <NavItem
                href="/history"
                icon={HistoryIcon}
                label="Minhas Reservas"
                active={pathname === "/history"}
              />
            )}
            <NavItem
              href="/register"
              icon={Users}
              label="Central de Parceiros"
              active={pathname.startsWith("/register") || pathname.startsWith("/console")}
            />
          </nav>
        )}
      </div>
    </header>
  );
}
