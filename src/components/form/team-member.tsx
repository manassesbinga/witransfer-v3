/** @format */

"use client";

import React, { useState } from "react";
import { useForm } from "@/hooks/use-form";
import { useNotification } from "@/hooks/use-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldContent,
} from "@/components/ui/field";
import { createDriverAction, updateDriverAction } from "@/actions/private/team/actions";
import { getPartnersAction } from "@/actions/private/partners/actions";
import { getCarsAction } from "@/actions/private/cars/actions";
import { getCurrentUserAction } from "@/actions/private/auth/actions";
import { TeamMemberFormData } from "@/types";
import {
    validarEmail,
    validarTelefone,
} from "@/lib/validators";
import {
    User,
    FileText,
    CheckCircle,
    Loader2,
    Camera
} from "lucide-react";
import { uploadAvatar } from "@/lib/storage";

interface TeamMemberFormProps {
    memberId?: string;
    onSuccess?: () => void;
    isEdit?: boolean;
    initialData?: Partial<TeamMemberFormData>;
}

const TeamMemberForm: React.FC<
    TeamMemberFormProps
> = ({ memberId, onSuccess, isEdit = false, initialData }) => {
    const { sucesso, erro } = useNotification();
    const [partners, setPartners] = useState<any[]>([]);
    const [cars, setCars] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    React.useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [pRes, cRes, uRes] = await Promise.all([
                    getPartnersAction(),
                    getCarsAction(),
                    getCurrentUserAction()
                ]);
                if (pRes.success) setPartners(pRes.data || []);
                if (cRes.success) setCars(cRes.data || []);
                if (uRes.success) {
                    setUser(uRes.data);
                    if (!["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(uRes.data.role)) {
                        handleChange("partnerId", uRes.data.partnerId);
                    }
                }
            } catch (err) {
                console.error("Error loading dependencies:", err);
            }
        };
        fetchInitialData();
    }, []);

    const defaultValues: TeamMemberFormData = {
        // A) Dados Pessoais
        name: initialData?.name || "",
        nickName: initialData?.nickName || "",
        dateOfBirth: initialData?.dateOfBirth || "",
        gender: initialData?.gender || undefined,
        nacionalidade: initialData?.nacionalidade || "",
        nif: initialData?.nif || "",
        numeroDocumento: initialData?.numeroDocumento || "",
        address: initialData?.address || "",
        city: initialData?.city || "",
        province: initialData?.province || "",
        telefone: initialData?.telefone || "",
        telefoneAlternativo: initialData?.telefoneAlternativo || "",
        email: initialData?.email || "",
        fotoPerfil: initialData?.fotoPerfil || "",

        // B) Documentação
        cartaConducao: initialData?.cartaConducao || "",
        dataEmissaoCarta: initialData?.dataEmissaoCarta || "",
        dataValidadeCarta: initialData?.dataValidadeCarta || "",
        cartaProfissional: initialData?.cartaProfissional || false,

        // C) Informação Profissional
        experienciaAnos: initialData?.experienciaAnos || undefined,
        idiomasFalados: initialData?.idiomasFalados || [],
        disponibilidade: initialData?.disponibilidade || "Active",
        startDate: initialData?.startDate || "",
        partnerId: initialData?.partnerId || "",
        status: initialData?.status || "offline",
        role: initialData?.role || "motorista",
        vehicleId: initialData?.vehicleId || "",

        // D) Credenciais de Acesso (apenas para não-motoristas)
        username: initialData?.username || "",
        password: initialData?.password || "",
    };

    const { values, errors, isSubmitting, handleChange, setError, handleSubmit } = useForm({
        initialValues: defaultValues,
        onSubmit: async (data: any) => {
            // Validações obrigatórias
            if (!data.name) {
                setError("name", "Nome é obrigatório");
                return;
            }
            if (!data.email) {
                setError("email", "Email é obrigatório");
                return;
            }
            if (!validarEmail(data.email)) {
                setError("email", "Email inválido");
                return;
            }
            if (!data.telefone) {
                setError("telefone", "Telefone é obrigatório");
                return;
            }
            if (!validarTelefone(data.telefone)) {
                setError("telefone", "Telefone inválido (ex: +244921712055 ou 921712055)");
                return;
            }
            if (!data.role) {
                setError("role", "Função é obrigatória");
                return;
            }

            // Validações para funções administrativas (não-motoristas)
            const requiresLogin = data.role !== "motorista";
            if (requiresLogin && !isEdit) {
                if (!data.password) {
                    setError("password", "Senha é obrigatória para esta função");
                    return;
                }
                if (data.password.length < 8) {
                    setError("password", "Senha deve ter no mínimo 8 caracteres");
                    return;
                }
            }

            // Validações para motoristas
            if (data.role === "motorista") {
                if (!data.cartaConducao) {
                    setError("cartaConducao", "Carta de condução é obrigatória para motoristas");
                    return;
                }
                if (!data.dataValidadeCarta) {
                    setError("dataValidadeCarta", "Validade da carta é obrigatória");
                    return;
                }
            }

            try {
                const payload = { ...data };
                if (!["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(user?.role) && user?.partnerId) {
                    payload.partnerId = user.partnerId;
                }

                if (isEdit && memberId) {
                    const result = await updateDriverAction(memberId, payload);
                    if (result.success) {
                        sucesso("Membro da equipa atualizado com sucesso!");
                    } else {
                        throw new Error(result.error || "Erro ao atualizar");
                    }
                } else {
                    const result = await createDriverAction(payload);
                    if (result.success) {
                        sucesso("Membro da equipa registado com sucesso!");
                    } else {
                        throw new Error(result.error || "Erro ao registar");
                    }
                }
                onSuccess?.();
            } catch (err: any) {
                erro(err.message || "Erro de conexão com o servidor");
            }
        },
    });

    // Determinar se a função atual requer credenciais de login
    const requiresLoginCredentials = values.role !== "motorista";

    const handleAvatarUpload = async (file: File | null) => {
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const result = await uploadAvatar(file);
            if (result.success && result.data) {
                handleChange("fotoPerfil", result.data.url);
                sucesso("Foto de perfil carregada!");
            } else {
                erro("Erro ao carregar foto.");
            }
        } catch (error) {
            erro("Erro inesperado ao carregar.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {/* Header Info */}

            <div className="grid grid-cols-[200px_1fr] gap-8">
                {/* AVATAR UPLOAD SECTION */}
                <div className="flex flex-col gap-4">
                    <div className="relative group w-48 h-48 mx-auto bg-gray-100 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                        {values.fotoPerfil ? (
                            <img src={values.fotoPerfil} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-20 h-20 text-gray-300" />
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm cursor-pointer">
                            <label className="cursor-pointer flex flex-col items-center gap-1 text-white">
                                {uploadingAvatar ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                                <span className="text-xs font-bold">Mudar Foto</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAvatarUpload(e.target.files?.[0] || null)} disabled={uploadingAvatar} />
                            </label>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400">Permitido: JPG, PNG</p>
                        <p className="text-xs text-slate-400">Tamanho máximo: 2MB</p>
                    </div>
                </div>

                {/* SECTION 1: PERSONAL DATA */}
                <div className="space-y-6">
                    <div className="bg-white rounded-none p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-primary font-bold mb-6">
                            <User size={20} />
                            <span className="tracking-wider text-xs">Informação Pessoal</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field>
                                <FieldLabel>Nome Completo <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    value={values.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Ex: João Silva"
                                    className="rounded-none border-slate-100 bg-slate-50 focus:bg-white"
                                    required
                                />
                                <FieldError>{errors.name}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel>Apelido / Nome Curto</FieldLabel>
                                <Input
                                    value={values.nickName}
                                    onChange={(e) => handleChange("nickName", e.target.value)}
                                    placeholder="Ex: João"
                                    className="rounded-none border-slate-100 bg-slate-50 focus:bg-white"
                                />
                            </Field>

                            <Field>
                                <FieldLabel>Email <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    type="email"
                                    value={values.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="joao.silva@exemplo.com"
                                    className="rounded-none border-slate-100 bg-slate-50 focus:bg-white"
                                    required
                                />
                                <FieldError>{errors.email}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel>Número de Telefone <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    value={values.telefone}
                                    onChange={(e) => handleChange("telefone", e.target.value)}
                                    placeholder="+244921712055"
                                    className="rounded-none border-slate-100 bg-slate-50 focus:bg-white"
                                    required
                                />
                                <FieldError>{errors.telefone}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel>Género</FieldLabel>
                                <Select
                                    value={values.gender}
                                    onValueChange={(val) => handleChange("gender", val)}
                                >
                                    <SelectTrigger className="rounded-none border-slate-100 bg-slate-50">
                                        <SelectValue placeholder="Selecionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                        <SelectItem value="Feminino">Feminino</SelectItem>
                                        <SelectItem value="Outro">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel>Data de Nascimento</FieldLabel>
                                <Input
                                    type="date"
                                    value={values.dateOfBirth}
                                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                                    className="rounded-none border-slate-100 bg-slate-50"
                                />
                            </Field>
                        </div>
                    </div>

                    {/* SECTION 2: DOCUMENTATION & ROLE */}
                    <div className="bg-white rounded-none p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-primary font-bold mb-6">
                            <FileText size={20} />
                            <span className="tracking-wider text-xs">Função e Documentação</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* FUNÇÃO - SEMPRE VISÍVEL NO TOPO */}
                            <Field className="md:col-span-2">
                                <FieldLabel>Função / Cargo <span className="text-red-500">*</span></FieldLabel>
                                <Select
                                    value={values.role}
                                    onValueChange={(v) => handleChange("role", v)}
                                >
                                    <SelectTrigger className="rounded-none border-slate-100 bg-slate-50">
                                        <SelectValue placeholder="Selecionar cargo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="motorista">Motorista / Operador</SelectItem>
                                        <SelectItem value="attendant">Atendente / Recepção</SelectItem>
                                        <SelectItem value="finance_manager">Gestor Financeiro</SelectItem>
                                        <SelectItem value="manager">Gestor da Conta</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldContent className="text-[10px] text-slate-400 mt-1">
                                    {requiresLoginCredentials
                                        ? "Esta função terá acesso ao sistema com credenciais de login."
                                        : "Motoristas não têm acesso ao sistema administrativo."}
                                </FieldContent>
                            </Field>

                            {/* CREDENCIAIS DE ACESSO - APENAS PARA NÃO-MOTORISTAS */}
                            {requiresLoginCredentials && (
                                <div className="md:col-span-2">
                                    <Field>
                                        <FieldLabel>Senha de Acesso {!isEdit && <span className="text-red-500">*</span>}</FieldLabel>
                                        <Input
                                            type="password"
                                            value={values.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            className="rounded-none border-slate-100 bg-slate-50 focus:bg-white"
                                            required={!isEdit}
                                        />
                                        <FieldContent className="text-[10px] text-slate-400 mt-1">
                                            {isEdit ? "Deixe em branco para manter a senha atual." : "Defina uma senha segura para o utilizador aceder via email."}
                                        </FieldContent>
                                        <FieldError>{errors.password}</FieldError>
                                    </Field>
                                </div>
                            )}

                            {/* CAMPOS ESPECÍFICOS DE MOTORISTA */}
                            {values.role === "motorista" && (
                                <>
                                    <Field>
                                        <FieldLabel>Carta de Condução <span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            value={values.cartaConducao}
                                            onChange={(e) => handleChange("cartaConducao", e.target.value)}
                                            placeholder="Número da carta"
                                            className="rounded-none border-slate-100 bg-slate-50"
                                            required
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel>Validade da Carta <span className="text-red-500">*</span></FieldLabel>
                                        <Input
                                            type="date"
                                            value={values.dataValidadeCarta}
                                            onChange={(e) => handleChange("dataValidadeCarta", e.target.value)}
                                            className="rounded-none border-slate-100 bg-slate-50"
                                            required
                                        />
                                    </Field>

                                    <Field className="md:col-span-2">
                                        <FieldLabel>Atribuir Veículo</FieldLabel>
                                        <Select
                                            value={values.vehicleId || "unassigned"}
                                            onValueChange={(v) => handleChange("vehicleId", v === "unassigned" ? "" : v)}
                                        >
                                            <SelectTrigger className="rounded-none border-slate-100 bg-slate-50">
                                                <SelectValue placeholder="Selecionar veículo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Nenhum (Desatribuir)</SelectItem>
                                                {cars.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name} ({c.licensePlate})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldContent className="text-[10px] text-slate-400 mt-1">
                                            Veículo atribuído a este motorista.
                                        </FieldContent>
                                    </Field>
                                </>
                            )}

                            {/* PARCEIRO - APENAS PARA ADMINS */}
                            {["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(user?.role) && (
                                <Field className="md:col-span-2">
                                    <FieldLabel>Parceiro / Empresa</FieldLabel>
                                    <Select
                                        value={values.partnerId}
                                        onValueChange={(v) => handleChange("partnerId", v)}
                                    >
                                        <SelectTrigger className="rounded-none border-slate-100 bg-slate-50">
                                            <SelectValue placeholder="Selecionar parceiro" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {partners.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldContent className="text-[10px] text-slate-400 mt-1">
                                        Vincular este membro a um parceiro específico.
                                    </FieldContent>
                                </Field>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100">
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-none h-12 px-8 font-bold border-slate-200 hover:bg-slate-50 text-slate-500 text-xs tracking-widest"
                    onClick={() => window.history.back()}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-none h-12 px-10 font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 disabled:opacity-50 transition-all flex items-center gap-2 text-xs tracking-widest"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <CheckCircle size={20} />
                    )}
                    {isEdit ? "Salvar Alterações" : "Registar Membro"}
                </Button>
            </div>
        </form>
    );
};

export default TeamMemberForm;
