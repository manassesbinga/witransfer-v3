/** @format */

import {
    BarChart3,
    Building2,
    Users,
    User,
    ShieldCheck,
    Settings,
    LayoutDashboard,
    History,
    Car,
    Tag,
    Briefcase,
    MapPin,
    DollarSign,
    Layers,
    Package,
    FileText,
    PieChart
} from "lucide-react";
import type { NavigationItem } from "@/types";

// ============================================================================
// ADMIN NAVIGATION
// ============================================================================

// ============================================================================
// ADMIN NAVIGATION
// ============================================================================

export const adminNavigation: NavigationItem[] = [
    {
        label: "Painel",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
    },
    {
        label: "Gestão",
        icon: Car,
        children: [
            {
                label: "Veículos",
                icon: Car,
                href: "/admin/fleet/vehicles",
            },
            {
                label: "Clientes",
                icon: User,
                href: "/admin/fleet/clients",
            },
        ],
    },
    {
        label: "Categorias",
        icon: Tag,
        children: [
            {
                label: "Classes",
                icon: Layers,
                href: "/admin/categories/classes",
            },
            {
                label: "Extras",
                icon: Package,
                href: "/categories/extras",
            },
            {
                label: "Serviços",
                icon: Briefcase,
                href: "/admin/categories/services",
            },
        ],
    },
    {
        label: "Operacional",
        icon: MapPin,
        children: [
            {
                label: "Reservas / Aluguer",
                icon: Briefcase,
                href: "/admin/operations/bookings",
            },
            {
                label: "Viagens / Transfers",
                icon: MapPin,
                href: "/admin/operations/transfers",
            },
        ],
    },


];

// ============================================================================
// PARTNER NAVIGATION
// ============================================================================

export const partnerNavigation: NavigationItem[] = [
    {
        label: "Painel",
        icon: LayoutDashboard,
        href: "/partners/dashboard",
    },
    {
        label: "Gestão",
        icon: Car,
        children: [
            {
                label: "Veículos",
                icon: Car,
                href: "/partners/fleet/vehicles",
            },
            {
                label: "Team",
                icon: Users,
                href: "/partners/fleet/teams",
                roles: ["PARTNER_ADMIN", "PARTNER_STAFF"],
                forbiddenSubRoles: ["attendant", "motorista", "driver"]
            },
            {
                label: "Clientes",
                icon: User,
                href: "/partners/fleet/clients",
            },
        ],
    },
    {
        label: "Categorias",
        icon: Tag,
        children: [
            {
                label: "Extras",
                icon: Package,
                href: "/partners/categories/extras",
            },
            // Removido Serviços aqui pois o caminho /categories/services não existe atualmente
        ],
    },
    {
        label: "Operacional",
        icon: MapPin,
        children: [
            {
                label: "Reservas / Aluguer",
                icon: Briefcase,
                href: "/partners/operations/bookings",
            },
            {
                label: "Viagens / Transfers",
                icon: MapPin,
                href: "/partners/operations/transfers",
            },
        ],
    },

    {
        label: "Meu Perfil",
        icon: User,
        href: "/partners/settings/profile",
        forbiddenSubRoles: ["attendant", "motorista", "finance_manager", "driver"]
    },
];
