import { Fuel, Droplets, Wrench, Activity, Ticket, ShieldCheck, User, Globe, Brush, FileText, Wallet, Package, MapPin, DollarSign } from "lucide-react"

export const FINANCIAL_CATEGORIES = [
    { id: "Abastecimento", label: "Abastecimento", icon: Fuel },
    { id: "Óleo", label: "Óleo/Lubr.", icon: Droplets },
    { id: "Manutenção", label: "Manutenção", icon: Wrench },
    { id: "Reparação", label: "Reparação", icon: Activity },
    { id: "Taxas", label: "Taxas", icon: Ticket },
    { id: "Seguro", label: "Seguro", icon: ShieldCheck },
    { id: "Motorista", label: "Motorista", icon: User },
    { id: "Internet", label: "Internet/GPS", icon: Globe },
    { id: "Lavagem", label: "Lavagem", icon: Brush },
    { id: "Multas", label: "Multas", icon: FileText },
    { id: "Estacionamento", label: "Estacionamento", icon: MapPin },
    { id: "Pedágio", label: "Pedágio/Tolls", icon: Ticket },
    { id: "Salários", label: "Pagamento Salários", icon: User },
    { id: "Comissão", label: "Comissão Plataforma", icon: DollarSign },
    { id: "Reembolso", label: "Reembolso Cliente", icon: Wallet },
    { id: "Administrativo", label: "Admin", icon: Wallet },
    { id: "Outro", label: "Outros", icon: Package },
]
