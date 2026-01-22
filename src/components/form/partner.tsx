"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@/hooks/use-form"
import { useNotification } from "@/hooks/use-notification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn, toSnakeCase } from "@/lib/utils"
import { LocationAutocomplete } from "@/components/ui/location-autocomplete"
import {
    Building2,
    User,
    MapPin,
    Phone,
    Settings,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    DollarSign,
    Upload,
    FileText as FileIcon,
    X,
    Eye,
    EyeOff,
    Car,
    MapPin as MapIcon
} from "lucide-react"
import { uploadFileAction } from "@/actions/private/storage/actions"

import type { PartnerFormData } from "@/types"

interface PartnerFormProps {
    mode?: "create" | "edit"
    isPublic?: boolean
    isProfile?: boolean
    initialData?: Partial<PartnerFormData>
    onSubmit: (data: PartnerFormData) => Promise<any>
    onCancel?: () => void
}


export function PartnerForm({
    mode = "create",
    isPublic = false,
    isProfile = false,
    initialData,
    onSubmit,
    onCancel
}: PartnerFormProps) {
    const { sucesso, erro } = useNotification()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const serviceOptions = [
        { id: "Reservas/Aluguer", label: "Reservas/Aluguer" },
        { id: "Transfer/Viagens", label: "Transfer/Viagens" }
    ]

    const defaultValues: PartnerFormData = {
        nome: initialData?.nome || "",
        email: initialData?.email || "",
        tipo: initialData?.tipo || "empresa",
        nif: initialData?.nif || "",
        nomeResponsavel: initialData?.nomeResponsavel || "",
        telefonePrincipal: initialData?.telefonePrincipal || "",
        provincia: initialData?.provincia || "",
        municipio: initialData?.municipio || "",
        bairro: initialData?.bairro || "",
        rua: initialData?.rua || "",
        servicos: initialData?.servicos || [],

        // Novos Campos
        nomeEmpresa: initialData?.nomeEmpresa || "",
        pais: initialData?.pais || "Portugal",
        distrito: initialData?.distrito || "",
        codigoPostal: initialData?.codigoPostal || "",
        website: initialData?.website || "",
        cargo: initialData?.cargo || "",
        objetivo: initialData?.objetivo || "",
        areaAtividade: initialData?.areaAtividade || "",
        tamanhoEmpresa: initialData?.tamanhoEmpresa || "",
        setoresAtuacao: initialData?.setoresAtuacao || [],
        mercadosAtuacao: initialData?.mercadosAtuacao || [],
        aceitouPolitica: initialData?.aceitouPolitica || false,

        // Campos opcionais - garantir que sejam sempre strings
        nomeComercial: initialData?.nomeComercial || "",
        registroComercial: initialData?.registroComercial || "",
        whatsapp: initialData?.whatsapp || "",
        telefoneAlternativo: initialData?.telefoneAlternativo || "",
        password: initialData?.password || "",
        confirmPassword: initialData?.confirmPassword || "",
        tipoRemuneracao: initialData?.tipoRemuneracao || "percentual",
        valorRemuneracao: initialData?.valorRemuneracao || "",
        avatarUrl: initialData?.avatarUrl || "",
        logo: initialData?.logo || "",
        documentUrl: initialData?.documentUrl || "",
        parceiroVerificado: initialData?.parceiroVerificado || false,
        ...initialData
    }

    const { values, handleChange, isSubmitting, handleSubmit } = useForm({
        initialValues: defaultValues,
        onSubmit: async (data: PartnerFormData) => {
            try {
                // Validação de Campos Obrigatórios
                // Se for perfil (edição), não exigimos preenchimento de tudo para salvar parcial
                const requiredFields = isProfile ? [] : [
                    { key: 'nomeEmpresa', label: 'Nome da Empresa' },
                    { key: 'telefonePrincipal', label: 'Telefone Principal' },
                    { key: 'rua', label: 'Morada (Rua)' },
                    { key: 'municipio', label: 'Localidade/Município' },
                    { key: 'nif', label: 'NIF' },
                    { key: 'nomeResponsavel', label: 'Nome do Responsável' },
                    { key: 'email', label: 'Email do Responsável' },
                    // { key: 'cargo', label: 'Cargo do Responsável' }, // Não persistido atualmente
                    { key: 'telefoneAlternativo', label: 'Telemóvel do Responsável' },
                ];

                for (const field of requiredFields) {
                    if (!data[field.key as keyof PartnerFormData]) {
                        throw new Error(`O campo "${field.label}" é obrigatório.`);
                    }
                }

                if (mode === 'create') {
                    if (!data.aceitouPolitica) {
                        throw new Error("É necessário aceitar a Política de Privacidade.");
                    }
                    if (!data.password) throw new Error("A senha é obrigatória.");
                    if (data.password !== data.confirmPassword) throw new Error("As senhas não coincidem.");
                }

                const result = await onSubmit(data)
                if (result && !result.success) {
                    throw new Error(result.error || "Erro ao processar solicitação")
                }
                sucesso(mode === "create" ? "Cadastro realizado com sucesso!" : "Dados atualizados com sucesso!")

                if (isPublic && mode === "create") {
                    router.push("/partners/dashboard")
                }
            } catch (err: any) {
                erro(err.message || "Ocorreu um erro ao processar sua solicitação.")
            }
        }
    })

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    const toggleService = (serviceId: string) => {
        const current = values.servicos || []
        if (current.includes(serviceId)) {
            handleChange("servicos", current.filter((id: string) => id !== serviceId))
        } else {
            handleChange("servicos", [...current, serviceId])
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {/* Form Progress (Only if NOT public - admin forms show steps) */}
            {!isPublic && !isProfile && (
                <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-none border border-gray-100 shadow-sm overflow-x-auto">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-none flex items-center justify-center font-bold text-xs transition-colors",
                                step === i ? "bg-primary text-white" : step > i ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                            )}>
                                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                                step === i ? "text-primary" : "text-gray-400"
                            )}>
                                {i === 1 ? "Identificação" : "Documentação"}
                            </span>
                            {i < 2 && <div className="w-8 md:w-12 h-px bg-gray-100 mx-1 md:mx-2" />}
                        </div>
                    ))}
                </div>
            )}

            {/* Step 1: Identificação (Empresa + Responsável) */}
            {(isPublic || isProfile || step === 1) && (
                <div className="space-y-6">
                    {/* Identificação da Empresa */}
                    <Card className="border-gray-100 shadow-xl shadow-gray-200/50 rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/10 rounded-none">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight">Identificação da Empresa Candidata</CardTitle>
                                    <CardDescription>Preencha os dados da sua organização</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Nome da Empresa *</Label>
                                    <Input
                                        value={values.nomeEmpresa}
                                        onChange={(e) => handleChange("nomeEmpresa", e.target.value)}
                                        className="h-12 rounded-none border-gray-200"
                                        placeholder="Nome da Empresa"
                                        required={!isProfile} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Telefone / Telemóvel *</Label>
                                    <Input
                                        value={values.telefonePrincipal}
                                        onChange={(e) => handleChange("telefonePrincipal", e.target.value)}
                                        className="h-12 rounded-none border-gray-200"
                                        placeholder="+244 9XX XXX XXX"
                                        type="tel"
                                        required={!isProfile} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Localização da Empresa *</Label>
                                    <LocationAutocomplete
                                        value={values.rua || ""}
                                        onChange={(val) => {
                                            handleChange("rua", val);
                                            // Extrair cidade e província do valor selecionado
                                            const parts = val.split(',').map(p => p.trim());
                                            if (parts.length >= 2) {
                                                // Formato: "Cidade, Província" ou "Rua, Cidade, Província"
                                                const provincia = parts[parts.length - 1].replace(', Angola', '').trim();
                                                const municipio = parts.length > 2 ? parts[parts.length - 2] : parts[0];
                                                handleChange("provincia", provincia);
                                                handleChange("municipio", municipio);
                                            } else if (parts.length === 1) {
                                                // Se for apenas um valor, assumir como município
                                                handleChange("municipio", parts[0]);
                                            }
                                        }}
                                        onSelect={() => { }}
                                        placeholder="Digite cidade, província ou endereço completo"
                                        className="w-full"
                                        inputClassName="h-12 rounded-none border-gray-200"
                                    />
                                    {(values.municipio || values.provincia) && (
                                        <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                            {values.municipio && <span>🏙️ {values.municipio}</span>}
                                            {values.provincia && <span>🗺️ {values.provincia}</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">NIF / Nuit *</Label>
                                    <Input
                                        value={values.nif}
                                        onChange={(e) => handleChange("nif", e.target.value)}
                                        className="h-12 rounded-none border-gray-200"
                                        placeholder="Número de Identificação Fiscal"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Página Web</Label>
                                    <Input
                                        value={values.website}
                                        onChange={(e) => handleChange("website", e.target.value)}
                                        className="h-12 rounded-none border-gray-200"
                                        placeholder="www.exemplo.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Código Postal</Label>
                                    <Input
                                        value={values.codigoPostal}
                                        onChange={(e) => handleChange("codigoPostal", e.target.value)}
                                        className="h-12 rounded-none border-gray-200"
                                        placeholder="0000-000"
                                    />
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    {/* Responsável */}
                    <Card className="border-gray-100 shadow-xl shadow-gray-200/50 rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/10 rounded-none">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight">Nome do Responsável pelo contacto</CardTitle>
                                    <CardDescription>Dados da pessoa de contacto</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Nome *</Label>
                                    <Input
                                        value={values.nomeResponsavel}
                                        onChange={(e) => handleChange("nomeResponsavel", e.target.value)}
                                        className="h-12 rounded-none border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Email *</Label>
                                    <Input
                                        value={values.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className="h-12 rounded-none border-gray-200"
                                        type="email"
                                        required={!isProfile} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Cargo *</Label>
                                    <Input
                                        value={values.cargo}
                                        onChange={(e) => handleChange("cargo", e.target.value)}
                                        className="h-12 rounded-none border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Telemóvel *</Label>
                                    <Input
                                        value={values.telefoneAlternativo}
                                        onChange={(e) => handleChange("telefoneAlternativo", e.target.value)}
                                        className="h-12 rounded-none border-gray-200"
                                        placeholder="+244 9XX XXX XXX"
                                    />
                                </div>
                            </div>

                            {mode === "create" && (
                                <div className="pt-6 mt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-gray-400">Senha</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={values.password}
                                                onChange={(e) => handleChange("password", e.target.value)}
                                                className="h-12 rounded-none border-gray-200 pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-widest text-gray-400">Confirmar Senha</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={values.confirmPassword}
                                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                                className="h-12 rounded-none border-gray-200 pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Public Avatar Upload (Moved from deleted services card) */}
                            {isPublic && (
                                <div className="pt-8 border-t border-gray-100 space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <User className="w-5 h-5" />
                                        <span className="text-[10px] font-black tracking-[0.2em]">Logotipo da Empresa</span>
                                    </div>
                                    <Label className="text-[10px] font-black tracking-widest text-gray-400">Logotipo ou Foto de Perfil</Label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-none bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                            {values.avatarUrl || values.logo ? (
                                                <img src={values.avatarUrl || values.logo} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="avatar-upload-public"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]
                                                    if (!file) return
                                                    const formData = new FormData()
                                                    formData.append("file", file)
                                                    formData.append("bucket", "avatars")
                                                    formData.append("path", `partners/${Date.now()}-${file.name}`)
                                                    const res = await uploadFileAction(formData)
                                                    if (res.success && res.data) {
                                                        handleChange("avatarUrl", res.data.url)
                                                        handleChange("logo", res.data.url)
                                                        sucesso("Imagem carregada!")
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById("avatar-upload-public")?.click()}
                                                className="rounded-none font-bold gap-2"
                                            >
                                                <Upload className="w-4 h-4" /> Selecionar Imagem
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Admin Info (Moved from deleted services card) */}
                            {!isPublic && !isProfile && (
                                <div className="pt-8 border-t border-gray-100 space-y-6">
                                    <div className="flex items-center gap-2 text-primary">
                                        <ShieldCheck className="w-5 h-5" />
                                        <span className="text-[10px] font-black tracking-[0.2em]">Configurações de Administrador</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="verificado"
                                            checked={values.parceiroVerificado}
                                            onCheckedChange={(val) => handleChange("parceiroVerificado", val)}
                                        />
                                        <Label htmlFor="verificado" className="text-sm font-bold">Marcar como Parceiro Verificado</Label>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Step 2: Perfil e Objetivos - ONLY FOR PUBLIC REGISTRATION */}
            {isPublic && (
                <Card className="border-gray-100 shadow-xl shadow-gray-200/50 rounded-none overflow-hidden animate-in fade-in slide-in-from-right-4">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary/10 rounded-none">
                                <Settings className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight">Perfil de Parceiro</CardTitle>
                                <CardDescription>Conte-nos mais sobre seus objetivos</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Objetivo */}
                        <div className="space-y-4">
                            <Label className="text-lg font-bold">Qual o objetivo de se tornar Parceiro?</Label>
                            <div className="grid gap-3">
                                {[
                                    "Aumentar volume de serviços",
                                    "Gestão de Frota",
                                    "Digitalizar o negócio",
                                    "Outro objetivo"
                                ].map((opt) => (
                                    <div key={opt} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id={`obj-${opt}`}
                                            name="objetivo"
                                            value={opt}
                                            checked={values.objetivo === opt}
                                            onChange={(e) => handleChange("objetivo", e.target.value)}
                                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                        />
                                        <Label htmlFor={`obj-${opt}`} className="font-normal">{opt}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Principais Áreas */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <Label className="text-lg font-bold">Principais áreas de atividade</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    "Transporte de Passageiros (Transfer)",
                                    "Aluguer de Viaturas",
                                    "Transporte de Cargas",
                                    "Serviços de Motorista",
                                    "Outras áreas"
                                ].map((area) => (
                                    <div key={area} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`area-${area}`}
                                            checked={values.areaAtividade === area}
                                            onCheckedChange={() => {
                                                handleChange("areaAtividade", area)
                                            }}
                                        />
                                        <Label htmlFor={`area-${area}`} className="font-normal">{area}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Segmentos - Clientes */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <Label className="text-lg font-bold">Principais clientes alvo</Label>

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-4">
                                    {["Turistas", "Empresas (Corporate)", "Particulares/Locais", "Eventos"].map((opt) => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id={`client-${opt}`}
                                                name="tamanhoEmpresa" // Reusing this field for Client Segment temporarily
                                                value={opt}
                                                checked={values.tamanhoEmpresa === opt}
                                                onChange={(e) => handleChange("tamanhoEmpresa", e.target.value)}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <Label htmlFor={`client-${opt}`} className="font-normal">{opt}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Segmentos - Mercados */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-500">Mercados de atuação:</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    "Portugal", "Angola", "Moçambique", "Cabo Verde",
                                    "S. Tomé e Principe", "Guiné-Bissau", "Outros"
                                ].map((mkt) => (
                                    <div key={mkt} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`mkt-${mkt}`}
                                            checked={(values.mercadosAtuacao || []).includes(mkt)}
                                            onCheckedChange={(checked) => {
                                                const current = values.mercadosAtuacao || [];
                                                if (checked) {
                                                    handleChange("mercadosAtuacao", [...current, mkt]);
                                                } else {
                                                    handleChange("mercadosAtuacao", current.filter((s: string) => s !== mkt));
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`mkt-${mkt}`} className="font-normal">{mkt}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Política de Privacidade */}
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="privacy"
                                    checked={values.aceitouPolitica}
                                    onCheckedChange={(checked) => handleChange("aceitouPolitica", checked)}
                                />
                                <Label htmlFor="privacy" className="font-bold text-sm">Li e aceito a Política de Privacidade. *</Label>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            )}



            {/* Step 2/3: Documentação - Only for profile/admin, NOT for public registration */}
            {(!isPublic && (isProfile || step === 2)) && (
                <Card className="border-gray-100 shadow-xl shadow-gray-200/50 rounded-none overflow-hidden animate-in fade-in slide-in-from-right-4">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary/10 rounded-none">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight">Documentação & Perfil</CardTitle>
                                <CardDescription>Envie fotos e documentos para verificação</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Avatar/Logo Upload */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black tracking-widest text-gray-400">Logotipo ou Foto de Perfil</Label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-none bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                        {values.avatarUrl || values.logo ? (
                                            <img src={values.avatarUrl || values.logo} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id="avatar-upload"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                const formData = new FormData()
                                                formData.append("file", file)
                                                formData.append("bucket", "avatars")
                                                formData.append("path", `partners/${Date.now()}-${file.name}`)
                                                const res = await uploadFileAction(formData)
                                                if (res.success && res.data) {
                                                    handleChange("avatarUrl", res.data.url)
                                                    handleChange("logo", res.data.url)
                                                    sucesso("Imagem carregada!")
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById("avatar-upload")?.click()}
                                            className="rounded-none font-bold gap-2"
                                        >
                                            <Upload className="w-4 h-4" /> Selecionar Imagem
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Document Upload */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black tracking-widest text-gray-400">Documento de Verificação (NIF/PDF)</Label>
                                <div className="space-y-4">
                                    {values.documentUrl ? (
                                        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-none">
                                            <div className="flex items-center gap-3">
                                                <FileIcon className="w-5 h-5 text-emerald-600" />
                                                <span className="text-xs font-bold text-emerald-900">Documento Carregado</span>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleChange("documentUrl", "")}>
                                                <X className="w-4 h-4 text-emerald-600" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Input
                                                type="file"
                                                accept=".pdf,.doc,.docx,image/*"
                                                className="hidden"
                                                id="doc-upload"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]
                                                    if (!file) return
                                                    const formData = new FormData()
                                                    formData.append("file", file)
                                                    formData.append("bucket", "documents")
                                                    formData.append("path", `verifications/${Date.now()}-${file.name}`)
                                                    const res = await uploadFileAction(formData)
                                                    if (res.success && res.data) {
                                                        handleChange("documentUrl", res.data.url)
                                                        sucesso("Documento carregado!")
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById("doc-upload")?.click()}
                                                className="w-full h-24 border-2 border-dashed rounded-none flex flex-col gap-2 font-bold text-gray-400 hover:border-primary hover:text-primary transition-all"
                                            >
                                                <Upload className="w-5 h-5" />
                                                <span>Subir Comprovativo (PDF/IMG)</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            className="rounded-none font-bold text-gray-500"
                        >
                            Cancelar
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {/* Only show step navigation for admin forms (not public/profile) */}
                    {!isPublic && !isProfile && (
                        <>
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className="h-12 px-6 rounded-none font-bold border-gray-200"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Anterior
                                </Button>
                            )}

                            {step < 2 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="h-12 px-10 rounded-none font-black bg-primary text-white shadow-lg shadow-primary/20"
                                >
                                    Seguinte
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-12 px-12 rounded-none font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        mode === "create" ? "Finalizar Cadastro" : "Salvar Alterações"
                                    )}
                                </Button>
                            )}
                        </>
                    )}
                    {/* For public/profile forms, show submit button directly */}
                    {(isPublic || isProfile) && (
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 px-12 rounded-none font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                mode === "create" ? "Finalizar Cadastro" : "Salvar Alterações"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    )
}
