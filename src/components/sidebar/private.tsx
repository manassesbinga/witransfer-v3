"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { NavigationItem, User } from "@/types"
import { toast } from "sonner"

interface AppSidebarProps {
    navigation: NavigationItem[]
    user: User | null
    isSidebarOpen: boolean
    openSubmenus: string[]
    onToggleSubmenu: (label: string) => void
    onLogout: () => void
    isPartnerRoute?: boolean
}

export function AppSidebar({
    navigation,
    user,
    isSidebarOpen,
    openSubmenus,
    onToggleSubmenu,
    onLogout,
    isPartnerRoute = false
}: AppSidebarProps) {
    const pathname = usePathname()

    const isAuthorized = (item: NavigationItem) => {
        const { roles, forbiddenSubRoles } = item;

        // 1. Check Role Permission
        let roleAllowed = true;
        if (roles && roles.length > 0) {
            if (!user || !user.role) {
                roleAllowed = false;
            } else {
                roleAllowed = roles.includes(user.role) || roles.includes(user.role.toUpperCase());
            }
        }

        if (!roleAllowed) return false;

        // 2. Check Sub-Role Restrictions
        if (forbiddenSubRoles && forbiddenSubRoles.length > 0 && user?.subRole) {
            if (forbiddenSubRoles.includes(user.subRole)) {
                return false;
            }
        }

        return true;
    }

    const handleLinkClick = (e: React.MouseEvent, href: string | undefined) => {
        if (!href) return;

        // Bloquear acesso financeiro para parceiros não verificados
        if (isPartnerRoute && href.includes("/finance") && user && !user.isVerified) {
            e.preventDefault();
            toast.error("Acesso restrito. Verifique sua conta para acessar o financeiro.");
        }
    }

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col rounded-none",
                isSidebarOpen ? "w-64" : "w-20"
            )}
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-slate-100 shrink-0">
                <Link href={isPartnerRoute ? "/partners/dashboard" : "/admin/dashboard"} className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <span className="text-primary font-black text-2xl">W</span>
                    </div>
                    {isSidebarOpen && (
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-primary leading-none">
                                WiTransfer
                            </span>
                            {isPartnerRoute && (
                                <span className="text-[10px] font-bold text-primary leading-tight mt-0.5">
                                    {user?.name || "Parceiro"}
                                </span>
                            )}
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
                {navigation
                    .filter((item) => isAuthorized(item))
                    .map((item) => {
                        const hasChildren = item.children && item.children.length > 0
                        const isOpen = openSubmenus.includes(item.label)

                        const isActive = item.href
                            ? (pathname === item.href || pathname.startsWith(`${item.href}/`))
                            : item.children?.some((c) => c.href && (pathname === c.href || pathname.startsWith(`${c.href}/`)))

                        return (
                            <div key={item.label} className="space-y-1">
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        onClick={(e) => handleLinkClick(e, item.href)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-none transition-all duration-200 group text-slate-600 hover:bg-slate-50",
                                            isActive &&
                                            "bg-blue-50 text-blue-600 font-bold border-r-2 border-blue-600"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "w-5 h-5 transition-colors shrink-0",
                                                isActive
                                                    ? "text-blue-600"
                                                    : "text-slate-400 group-hover:text-blue-600"
                                            )}
                                        />
                                        {isSidebarOpen && (
                                            <span className="text-sm">{item.label}</span>
                                        )}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => onToggleSubmenu(item.label)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-none transition-all duration-200 group text-slate-600 hover:bg-slate-50",
                                            isActive && "bg-slate-50/80 text-slate-900 font-bold"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon
                                                className={cn(
                                                    "w-5 h-5 transition-colors shrink-0",
                                                    isActive
                                                        ? "text-blue-600"
                                                        : "text-slate-400 group-hover:text-blue-600"
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
                                            ?.filter((c) => isAuthorized(c))
                                            .map((child) => {
                                                if (!child.href) return null;

                                                const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`)
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        onClick={(e) => handleLinkClick(e, child.href)}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-2 rounded-none transition-all text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-[13px]",
                                                            isChildActive &&
                                                            "text-blue-600 font-bold bg-blue-50"
                                                        )}
                                                    >
                                                        <child.icon className="w-4 h-4 shrink-0" />
                                                        {child.label}
                                                    </Link>
                                                )
                                            })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
            </nav>
        </aside>
    )
}
