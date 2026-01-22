"use client"

import { useState } from "react"
import { Shield, Building, Save, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)

    const handleSave = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            toast.success("Configurações atualizadas!")
        }, 1000)
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privilégios & Configurações</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Gestão de preferências da conta corporativa e parâmetros do sistema.</p>
            </div>

            <Tabs defaultValue="geral" className="space-y-8">
                <TabsList className="bg-white border border-[#F1F5F9] p-1 rounded-none h-14 w-full justify-start gap-2 shadow-sm">
                    <TabsTrigger value="geral" className="rounded-none h-full px-8 font-bold text-[10px] tracking-[0.2em] data-[state=active]:bg-[#1E293B] data-[state=active]:text-white data-[state=active]:shadow-none transition-all">
                        <Building className="w-4 h-4 mr-2" /> Empresa
                    </TabsTrigger>
                    <TabsTrigger value="perfil" className="rounded-none h-full px-8 font-bold text-[10px] tracking-[0.2em] data-[state=active]:bg-[#1E293B] data-[state=active]:text-white data-[state=active]:shadow-none transition-all">
                        <User className="w-4 h-4 mr-2" /> Perfil
                    </TabsTrigger>

                    <TabsTrigger value="seguranca" className="rounded-none h-full px-8 font-bold text-[10px] tracking-[0.2em] data-[state=active]:bg-[#1E293B] data-[state=active]:text-white data-[state=active]:shadow-none transition-all">
                        <Shield className="w-4 h-4 mr-2" /> Segurança
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="space-y-6">
                    <Card className="rounded-none border-[#F1F5F9] shadow-none bg-white">
                        <CardHeader className="p-10 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                            <CardTitle className="text-sm font-bold tracking-widest text-[#1E293B]">Dados Institucionais</CardTitle>
                            <CardDescription className="text-xs font-semibold text-[#64748B]">Informações oficiais da organização WiTransfer.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-[#94A3B8] tracking-widest">Nome da Empresa</Label>
                                    <Input defaultValue="WiTransfer Business Lda" className="rounded-none border-[#E2E8F0] h-12 font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-[#94A3B8] tracking-widest">NIF / Tax ID</Label>
                                    <Input defaultValue="5401234567" className="rounded-none border-[#E2E8F0] h-12 font-mono font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-[#94A3B8] tracking-widest">Email Principal</Label>
                                    <Input defaultValue="geral@witransfer.ao" className="rounded-none border-[#E2E8F0] h-12 font-semibold" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-[#94A3B8] tracking-widest">Jurisdição</Label>
                                    <Input defaultValue="Luanda, Angola" disabled className="rounded-none border-[#E2E8F0] h-12 font-bold bg-[#F8FAFC]" />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-[#F1F5F9] flex justify-end">
                                <Button onClick={handleSave} disabled={loading} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-none h-14 px-12 font-bold text-[10px] tracking-widest shadow-xl shadow-blue-500/10">
                                    {loading ? "A processar..." : "Sincronizar Dados"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>
        </div>
    )
}
