/** @format */

"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Users,
  User,
  ShieldCheck,
  Settings,
  LogOut,
  Bell,
  Search,
  LayoutDashboard,
  Menu,
  X,
  History,
  Lock,
  Car,
  ChevronDown,
  ChevronRight,
  Tag,
  Briefcase,
  MapPin,
  FileText,
} from "lucide-react";
import { logoutAdminAction, getCurrentUserAction } from "./actions";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Definição da estrutura do menu com suporte a submenus
interface NavigationItem {
  label: string;
  icon: any;
  href?: string;
  roles: string[];
  children?: { label: string; icon: any; href: string; roles: string[] }[];
}

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    roles: ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"],
  },
  {
    label: "Empresas",
    icon: Building2,
    href: "/admin/companies",
    roles: ["SUPER_ADMIN"],
  },
  {
    label: "Gestão de Frota",
    icon: Car,
    roles: ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"],
    children: [
      {
        label: "Veículos",
        icon: Car,
        href: "/admin/viaturas",
        roles: ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"],
      },
      {
        label: "Rastreamento",
        icon: MapPin,
        href: "/admin/viaturas/rastreamento",
        roles: ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"],
      },
      {
        label: "Categorias",
        icon: Tag,
        href: "/admin/categories",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    label: "Operacional",
    icon: MapPin,
    roles: ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"],
    children: [
      {
        label: "Reservas / Aluguer",
        icon: Briefcase,
        href: "/admin/bookings",
        roles: ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"],
      },
      {
        label: "Viagens / Transfers",
        icon: MapPin,
        href: "/admin/transfers",
        roles: ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"],
      },
    ],
  },
  {
    label: "Motoristas",
    icon: Users,
    href: "/admin/motoristas",
    roles: ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"],
  },
  {
    label: "Clientes",
    icon: User,
    href: "/admin/clientes",
    roles: ["SUPER_ADMIN", "ADMIN", "GERENCIADOR"],
  },
  {
    label: "Equipe",
    icon: Users,
    href: "/admin/users",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "Configurações",
    icon: Settings,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      {
        label: "Roles & Funções",
        icon: ShieldCheck,
        href: "/admin/roles",
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Regras de Acesso",
        icon: Lock,
        href: "/admin/rules",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Relatórios",
        icon: BarChart3,
        href: "/admin/reports",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Auditoria",
        icon: History,
        href: "/admin/audit",
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Geral",
        icon: Settings,
        href: "/admin/settings",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
];

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getCurrentUserAction();
      if (result.success) {
        setUser(result.data);
      }
    };
    fetchUser();
  }, []);

  // Lógica para manter submenus abertos se estiverem ativos
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.children?.some((child) => pathname.startsWith(child.href))) {
        setOpenSubmenus((prev) =>
          prev.includes(item.label) ? prev : [...prev, item.label]
        );
      }
    });
  }, [pathname]);

  if (
    pathname === "/portal" ||
    pathname === "/admin/login" ||
    pathname === "/portal/invite"
  ) {
    return <>{children}</>;
  }

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const isAuthorized = (roles: string[]) => !user || roles.includes(user.role);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] admin-layout">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}>
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-slate-100 shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                WiTransfer
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navigation
            .filter((item) => isAuthorized(item.roles))
            .map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openSubmenus.includes(item.label);
              const isActive = item.href
                ? pathname === item.href
                : item.children?.some((c) => pathname.startsWith(c.href));

              return (
                <div key={item.label} className="space-y-1">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-slate-600 hover:bg-slate-50",
                        isActive &&
                          "bg-primary/5 text-primary font-bold shadow-sm shadow-primary/5"
                      )}>
                      <item.icon
                        className={cn(
                          "w-5 h-5 transition-colors shrink-0",
                          isActive
                            ? "text-primary"
                            : "text-slate-400 group-hover:text-primary"
                        )}
                      />
                      {isSidebarOpen && (
                        <span className="text-sm">{item.label}</span>
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-slate-600 hover:bg-slate-50",
                        isActive && "bg-slate-50/80 text-slate-900 font-bold"
                      )}>
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            "w-5 h-5 transition-colors shrink-0",
                            isActive
                              ? "text-primary"
                              : "text-slate-400 group-hover:text-primary"
                          )}
                        />
                        {isSidebarOpen && (
                          <span className="text-sm">{item.label}</span>
                        )}
                      </div>
                      {isSidebarOpen &&
                        (isOpen ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        ))}
                    </button>
                  )}

                  {/* Submenu */}
                  {hasChildren && isOpen && isSidebarOpen && (
                    <div className="ml-4 pl-4 border-l border-slate-100 space-y-1 mt-1 transition-all">
                      {item.children
                        ?.filter((c) => isAuthorized(c.roles))
                        .map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-slate-500 hover:text-primary hover:bg-slate-50 text-[13px]",
                                isChildActive &&
                                  "text-primary font-bold bg-primary/5"
                              )}>
                              <child.icon className="w-4 h-4 shrink-0" />
                              {child.label}
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
        </nav>

        {/* Footer User */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl bg-slate-50",
              !isSidebarOpen && "justify-center"
            )}>
            <Avatar className="w-9 h-9 border-2 border-white shadow-sm shrink-0">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  user?.email || "admin"
                }`}
              />
              <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] font-bold text-slate-800 truncate leading-none">
                  {user?.name || "Carregando..."}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-1 capitalize">
                  {user?.role?.toLowerCase().replace("_", " ")}
                </p>
              </div>
            )}
            {isSidebarOpen && (
              <button
                onClick={() => logoutAdminAction()}
                className="p-1.5 hover:bg-white hover:text-red-500 hover:shadow-sm rounded-lg transition-all text-slate-400 shrink-0">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          isSidebarOpen ? "pl-64" : "pl-20"
        )}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 min-w-[300px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Consultar sistema..."
                className="bg-transparent border-none focus:outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-50 rounded-full relative">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Status
              </p>
              <p className="text-xs text-green-500 flex items-center gap-1 justify-end font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
