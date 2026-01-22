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
import { createDriverAction, updateDriverAction } from "@/actions/private/drivers/actions";
import { getPartnersAction } from "@/actions/private/partners/actions";
import { getCarsAction } from "@/actions/private/cars/actions";
import { getCurrentUserAction } from "@/actions/private/auth/actions";
import { DriverFormData, Driver as Motorista } from "@/types";
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

interface DriverRegistrationFormProps {
  driverId?: string;
  onSuccess?: () => void;
  isEdit?: boolean;
  initialData?: Partial<DriverFormData>;
}

const DriverRegistrationForm: React.FC<
  DriverRegistrationFormProps
> = ({ driverId, onSuccess, isEdit = false, initialData }) => {
  const { sucesso, erro } = useNotification();
  const [selectedLanguage, setSelectedLanguage] = useState("");
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
        console.error("Erro ao carregar dependências:", err);
      }
    };
    fetchInitialData();
  }, []);

  const defaultValues: DriverFormData = {
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
    fotoPerfil: initialData?.fotoPerfil || "", // Changed from foto_perfil to align with frontend type if needed, or map correctly.

    // B) Documentação
    cartaConducao: initialData?.cartaConducao || "",
    dataEmissaoCarta: initialData?.dataEmissaoCarta || "",
    dataValidadeCarta: initialData?.dataValidadeCarta || "",
    cartaProfissional: initialData?.cartaProfissional || false,

    // C) Informações Profissionais
    experienciaAnos: initialData?.experienciaAnos || undefined,
    idiomasFalados: initialData?.idiomasFalados || [],
    disponibilidade: initialData?.disponibilidade || "Ativo",
    startDate: initialData?.startDate || "",
    partnerId: initialData?.partnerId || "",
    status: initialData?.status || "offline",
    role: initialData?.role || "motorista",
    vehicleId: initialData?.vehicleId || "",
  };

  const { values, errors, isSubmitting, handleChange, setError, handleSubmit } = useForm({
    initialValues: defaultValues,
    onSubmit: async (data: any) => {
      // Validações
      if (!data.name) {
        setError("name", "Nome é obrigatório");
        return;
      }
      if (!validarEmail(data.email)) {
        setError("email", "Email inválido");
        return;
      }
      if (!validarTelefone(data.telefone)) {
        setError("telefone", "Telefone inválido");
        return;
      }

      try {
        const payload = { ...data };
        if (!["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(user?.role) && user?.partnerId) {
          payload.partnerId = user.partnerId;
        }

        if (isEdit && driverId) {
          const result = await updateDriverAction(driverId, payload);
          if (result.success) {
            sucesso("Membro da equipa atualizado com sucesso!");
          } else {
            throw new Error(result.error || "Erro ao atualizar");
          }
        } else {
          const result = await createDriverAction(payload);
          if (result.success) {
            sucesso("Membro da equipa cadastrado com sucesso!");
          } else {
            throw new Error(result.error || "Erro ao cadastrar");
          }
        }
        onSuccess?.();
      } catch (err: any) {
        erro(err.message || "Erro na conexão com o servidor");
      }
    },
  });

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
      erro("Erro inesperado no upload.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Editar Membro da Equipa" : "Cadastrar Novo Membro"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Informações pessoais e profissionais da equipa
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isEdit ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isEdit ? "bg-amber-500" : "bg-emerald-500"}`} />
          {isEdit ? "Modo Edição" : "Modo Criação"}
        </div>
      </div>

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
                <span className="text-xs font-bold">Alterar Foto</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAvatarUpload(e.target.files?.[0] || null)} disabled={uploadingAvatar} />
              </label>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Permitido: JPG, PNG</p>
            <p className="text-xs text-gray-400">Tam. Máx: 2MB</p>
          </div>
        </div>

        {/* SECTION 1: DADOS PESSOAIS */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-bold mb-6">
              <User size={20} />
              <span className="tracking-wider text-xs">Informação Pessoal</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Nome Completo</FieldLabel>
                <Input
                  value={values.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: João Silva"
                  className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white"
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Apelido / Nome Curto</FieldLabel>
                <Input
                  value={values.nickName}
                  onChange={(e) => handleChange("nickName", e.target.value)}
                  placeholder="Ex: João"
                  className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white"
                />
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="joao.silva@exemplo.com"
                  className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white"
                />
                <FieldError>{errors.email}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Telefone Principal</FieldLabel>
                <Input
                  value={values.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  placeholder="+244 9XX XXX XXX"
                  className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white"
                />
                <FieldError>{errors.telefone}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Gênero</FieldLabel>
                <Select
                  value={values.gender}
                  onValueChange={(val) => handleChange("gender", val)}
                >
                  <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50">
                    <SelectValue placeholder="Selecione" />
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
                  className="rounded-xl border-gray-100 bg-gray-50"
                />
              </Field>
            </div>
          </div>

          {/* SECTION 2: DOCUMENTAÇÃO */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-bold mb-6">
              <FileText size={20} />
              <span className="tracking-wider text-xs">Documentação</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Carta de Condução</FieldLabel>
                <Input
                  value={values.cartaConducao}
                  onChange={(e) => handleChange("cartaConducao", e.target.value)}
                  placeholder="Número da carta"
                  className="rounded-xl border-gray-100 bg-gray-50"
                />
              </Field>

              <Field>
                <FieldLabel>Validade da Carta</FieldLabel>
                <Input
                  type="date"
                  value={values.dataValidadeCarta}
                  onChange={(e) => handleChange("dataValidadeCarta", e.target.value)}
                  className="rounded-xl border-gray-100 bg-gray-50"
                />
              </Field>

              <Field>
                <FieldLabel>Função / Cargo</FieldLabel>
                <Select
                  value={values.role}
                  onValueChange={(v) => handleChange("role", v)}
                >
                  <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorista">Motorista / Operador</SelectItem>
                    <SelectItem value="atendente">Atendente / Recepção</SelectItem>
                    <SelectItem value="gestor_financas">Gestor de Finanças</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {values.role === "motorista" && (
                <Field>
                  <FieldLabel>Atribuir Viatura</FieldLabel>
                  <Select
                    value={values.vehicleId || "unassigned"}
                    onValueChange={(v) => handleChange("vehicleId", v === "unassigned" ? "" : v)}
                  >
                    <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50">
                      <SelectValue placeholder="Selecione a viatura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Nenhuma (Desatribuir)</SelectItem>
                      {/* We need cars here. I'll add a fetch for cars. */}
                      {cars.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.licensePlate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(user?.role) && (
                <Field>
                  <FieldLabel>Parceiro / Empresa</FieldLabel>
                  <Select
                    value={values.partnerId}
                    onValueChange={(v) => handleChange("partnerId", v)}
                  >
                    <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50">
                      <SelectValue placeholder="Selecione o parceiro" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldContent className="text-[10px] text-gray-400 mt-1">
                    Vincule este membro a um parceiro específico
                  </FieldContent>
                </Field>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-8 flex items-center justify-end gap-4 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl h-12 px-8 font-bold border-gray-200 hover:bg-gray-50"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl h-12 px-10 font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckCircle size={20} />
          )}
          {isEdit ? "Salvar Alterações" : "Cadastrar Membro"}
        </Button>
      </div>
    </form>
  );
};

export default DriverRegistrationForm;
