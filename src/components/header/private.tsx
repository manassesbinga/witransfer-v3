"use client"

import Link from "next/link"
import { Menu, Search, Building2, AlertTriangle, LogOut, User as UserIcon } from "lucide-react"
import type { User } from "@/types"

interface AppHeaderProps {
    isSidebarOpen: boolean
    onToggleSidebar: () => void
    user: User | null
    isPartnerRoute?: boolean
    onLogout: () => void
}

export function AppHeader({
    isSidebarOpen,
    onToggleSidebar,
    user,
    isPartnerRoute = false,
    onLogout
}: AppHeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 hover:bg-slate-100 rounded-none"
                >
                    <Menu className="w-5 h-5 text-slate-600" />
                </button>

                {/* Identificação do Parceiro */}
                {isPartnerRoute && (
                    <div className="flex items-center gap-2 px-4 py-1.5 text-primary">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm font-bold">
                            {(user as any)?.partnerName || user?.name || "Portal do Parceiro"}
                        </span>
                        {user?.isVerified && (
                            <span className="flex h-2 w-2 rounded-full bg-blue-600" title="Verificado" />
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Verification Alert for Partners */}
                {isPartnerRoute && user && !user.isVerified && (
                    <>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <Link
                            href="/partners/settings/profile#legal-documents"
                            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-none border border-amber-200 transition-all group"
                            title="Complete a verificação de documentos"
                        >
                            <div className="relative">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-none animate-pulse"></span>
                            </div>
                            <span className="text-xs font-bold hidden lg:inline">Verificar Documentos</span>
                        </Link>
                    </>
                )}



                <div className="h-8 w-px bg-slate-100"></div>

                {/* User Info & Logout Button */}
                <div className="flex items-center gap-3 ml-2">
                    <div className="h-10 w-10 bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                        {(user as any)?.avatarUrl || user?.avatar_url ? (
                            <img src={(user as any)?.avatarUrl || user?.avatar_url} alt={user?.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-5 h-5 text-primary" />
                        )}
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                            {(user as any)?.partnerName || user?.name || (user as any)?.full_name || "User"}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 tracking-widest">
                            {user?.role === "PARTNER" ? "Partner" : (user?.role || "Admin")}
                        </p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all rounded-none"
                        title="Sair do sistema"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}
