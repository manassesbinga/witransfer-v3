/** @format */

"use client";

import { useEffect, useState, use } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  History,
  Shield,
  MessageSquare,
  Car,
  Clock,
  CheckCircle,
  Loader2,
  FileText,
  CreditCard,
  Briefcase,
  Globe,
  AlertCircle,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMotoristasAction, deleteMotoristaAction } from "../../../actions";
import {
  formatarTelefone,
  formatarMoeda,
  formatarData,
} from "@/lib/formatters";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Motorista } from "@/types/motorista";

export default function DetalheMotoristaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "geral" | "documentacao" | "profissional" | "financeiro" | "historico"
  >("geral");

  useEffect(() => {
    const fetchMotorista = async () => {
      try {
        const result = await getMotoristasAction();
        if (result.success) {
          const found = result.data.find((m: any) => m.id === id);
          if (found) {
            setMotorista(found);
          } else {
            toast.error("Motorista não encontrado");
            router.push("/admin/motoristas");
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    fetchMotorista();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja remover este motorista?")) return;
    try {
      const res = await deleteMotoristaAction(id);
      if (res.success) {
        toast.success("Motorista removido com sucesso");
        router.push("/admin/motoristas");
      }
    } catch (error) {
      toast.error("Erro ao remover motorista");
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-medium">Carregando perfil do condutor...</p>
      </div>
    );
  }

  if (!motorista) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "online":
      case "disponivel":
        return "success";
      case "ocupado":
        return "warning";
      case "suspenso":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 1. Botão de Voltar */}
      <div className="mb-2">
        <Link
          href="/admin/motoristas"
          className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
          <ArrowLeft size={20} />
          Voltar para Motoristas
        </Link>
      </div>

      {/* 2. Cabeçalho Fixo (White Card) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-slate-50 shadow-sm">
            <AvatarImage src={motorista.fotoPerfil} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {motorista.nome.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {motorista.nome}
              </h1>
              <Badge
                variant={getStatusVariant(motorista.status)}
                className="rounded-lg px-2 py-0.5 uppercase text-[10px] font-black tracking-widest border-none">
                {motorista.status}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium mt-0.5 flex items-center gap-2">
              <Mail size={14} className="text-slate-400" /> {motorista.email} •
              ID: #{motorista.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Link
            href={`/admin/motoristas/editar/${id}`}
            className="flex-1 md:flex-none">
            <Button
              variant="outline"
              className="w-full rounded-xl h-11 font-bold border-slate-100">
              <Edit size={16} className="mr-2" /> Editar Perfil
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1 md:flex-none rounded-xl h-11 font-bold shadow-lg shadow-destructive/20">
            <Trash2 size={16} className="mr-2" /> Excluir
          </Button>
        </div>
      </div>

      {/* 3. Navegação (Tabs) */}
      <div className="border-b border-slate-100 mb-6 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 min-w-max">
          {[
            { id: "geral", label: "Visão Geral", icon: User },
            { id: "documentacao", label: "Documentação", icon: FileText },
            { id: "profissional", label: "Profissional", icon: Briefcase },
            { id: "financeiro", label: "Financeiro", icon: TrendingUp },
            { id: "historico", label: "Histórico", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                )}>
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. Conteúdo das Abas */}
      <div className="space-y-6">
        {/* ABA: VISÃO GERAL */}
        {activeTab === "geral" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Seção: Dados Principais */}
            <section>
              <div className="flex items-center gap-3 mb-5 px-1">
                <div className="w-1 h-3 bg-primary/40 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Perfil do Condutor
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ElegantInfoCard
                  icon={User}
                  label="Nome Completo"
                  value={motorista.nome}
                />
                <ElegantInfoCard
                  icon={Shield}
                  label="Apelido / Nome Curto"
                  value={motorista.nomeApelido || "-"}
                />
                <ElegantInfoCard
                  icon={Calendar}
                  label="Data de Nascimento"
                  value={motorista.dataNascimento}
                />
                <ElegantInfoCard
                  icon={Globe}
                  label="Nacionalidade"
                  value={motorista.nacionalidade || "Angolana"}
                />
                <ElegantInfoCard
                  icon={Hash}
                  label="NIF"
                  value={motorista.nif || "-"}
                />
                <ElegantInfoCard
                  icon={User}
                  label="Sexo / Gênero"
                  value={motorista.sexo || "-"}
                />
                <ElegantInfoCard
                  icon={Star}
                  label="Avaliação Média"
                  value={(motorista.pontuacao || 0).toFixed(1)}
                />
                <ElegantInfoCard
                  icon={Clock}
                  label="Status do Sistema"
                  value={motorista.status}
                  isStatus
                  status={motorista.status}
                />
              </div>
            </section>

            {/* Seção: Contato & Localização */}
            <section>
              <div className="flex items-center gap-3 mb-5 px-1">
                <div className="w-1 h-3 bg-primary/40 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Contato & Localização
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ElegantInfoCard
                  icon={Phone}
                  label="Telemóvel Principal"
                  value={formatarTelefone(motorista.telefone)}
                />
                <ElegantInfoCard
                  icon={Phone}
                  label="Contacto Alternativo"
                  value={
                    motorista.telefoneAlternativo
                      ? formatarTelefone(motorista.telefoneAlternativo)
                      : "-"
                  }
                />
                <ElegantInfoCard
                  icon={Mail}
                  label="Endereço de E-mail"
                  value={motorista.email}
                />
                <ElegantInfoCard
                  icon={MapPin}
                  label="Província & Cidade"
                  value={`${motorista.provincia || "-"}, ${
                    motorista.cidade || "-"
                  }`}
                  className="lg:col-span-1"
                />
                <ElegantInfoCard
                  icon={MapPin}
                  label="Endereço Residencial Completo"
                  value={motorista.endereco || "-"}
                  className="lg:col-span-2"
                />
              </div>
            </section>

            {/* Seção: Performance & Observações */}
            <section>
              <div className="flex items-center gap-3 mb-5 px-1">
                <div className="w-1 h-3 bg-primary/40 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Performance & Observações
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ElegantStatusBox
                  icon={TrendingUp}
                  label="Volume de Viagens"
                  value={motorista.numeroViagens || 0}
                  subValue="+0% este mês"
                  color="slate"
                />
                <ElegantStatusBox
                  icon={CreditCard}
                  label="Ganhos Acumulados"
                  value={formatarMoeda(motorista.ganhoTotal || 0)}
                  color="slate"
                />
                <ElegantTextArea
                  icon={MessageSquare}
                  label="Notas Administrativas"
                  value={motorista.notasInternas}
                />
                <ElegantTextArea
                  icon={Briefcase}
                  label="Registo de Comportamento"
                  value={motorista.comportamento}
                />
                <ElegantTextArea
                  icon={AlertCircle}
                  label="Restrições Médicas"
                  value={motorista.restricoesMedicas}
                  isAlert
                />
                <ElegantTextArea
                  icon={CheckCircle}
                  label="Recomendações"
                  value={motorista.recomendacoes}
                />
              </div>
            </section>
          </div>
        )}

        {/* ABA: DOCUMENTAÇÃO */}
        {activeTab === "documentacao" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Coluna: Identificação */}
              <section className="space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1 h-3 bg-orange-400/40 rounded-full" />
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Identificação Civil
                  </h2>
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Número do BI
                      </p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">
                        {motorista.numeroDocumento}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-500">
                      <CreditCard size={20} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <ElegantDocumentStatus
                      icon={Shield}
                      label="BI / Cartão de Munícipe"
                      status="Validado"
                      variant="success"
                    />
                    <ElegantDocumentStatus
                      icon={CheckCircle}
                      label="Registo Criminal"
                      status="Verificado (2024)"
                      variant="info"
                    />
                    <ElegantDocumentStatus
                      icon={AlertCircle}
                      label="Atestado Médico"
                      status="Pendente"
                      variant="warning"
                    />
                  </div>
                </div>
              </section>

              {/* Coluna: Habilitação */}
              <section className="space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1 h-3 bg-blue-400/40 rounded-full" />
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Habilitação de Condução
                  </h2>
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Nº da Carta de Condução
                      </p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">
                        {motorista.cartaConducao}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                        <FileText size={20} />
                      </div>
                      {motorista.cartaProfissional && (
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Profissional
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/30">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Data de Emissão
                      </p>
                      <p className="font-bold text-slate-700 text-sm">
                        {motorista.dataEmissaoCarta || "-"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/30">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Data de Validade
                      </p>
                      <p className="font-bold text-red-500 text-sm">
                        {motorista.dataValidadeCarta || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ABA: PROFISSIONAL */}
        {activeTab === "profissional" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Coluna: Experiência */}
              <section className="space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1 h-3 bg-green-400/40 rounded-full" />
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Experiência & Vínculo
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ElegantStatusBox
                    icon={Briefcase}
                    label="Tempo de Casa"
                    value={`${motorista.experienciaAnos || 0} Anos`}
                    color="slate"
                  />
                  <ElegantStatusBox
                    icon={Calendar}
                    label="Data de Admissão"
                    value={motorista.dataInicio}
                    color="slate"
                  />
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                  <ElegantDetailRow
                    icon={Car}
                    label="Viatura Alocada"
                    value={motorista.viaturaModelo || "Nenhuma viatura"}
                  />
                </div>
              </section>

              {/* Coluna: Idiomas */}
              <section className="space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1 h-3 bg-indigo-400/40 rounded-full" />
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Competências Linguísticas
                  </h2>
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl p-8 min-h-[220px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Idiomas Falados & Fluência
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {motorista.idiomasFalados &&
                    motorista.idiomasFalados.length > 0 ? (
                      motorista.idiomasFalados.map((idioma, i) => (
                        <div
                          key={i}
                          className="px-4 py-2.5 bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm border border-slate-100 flex items-center gap-2 group hover:border-indigo-200 hover:bg-white transition-all">
                          <div className="w-2 h-2 rounded-full bg-indigo-400/40" />
                          {idioma}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full py-8 text-slate-300">
                        <Globe size={32} className="mb-2 opacity-20" />
                        <p className="text-xs italic">
                          Nenhum idioma registado.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ABA: FINANCEIRO */}
        {activeTab === "financeiro" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card de Saldo */}
              <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-200 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-6">
                    <TrendingUp size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Saldo Disponível
                  </p>
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                    {formatarMoeda(motorista.ganhoTotal || 0)}
                  </h4>
                  <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                    <CheckCircle size={12} /> Próximo fechamento: 15/01
                  </p>
                </div>
                <Button className="mt-10 rounded-2xl h-12 font-black text-xs uppercase tracking-widest bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  Solicitar Levantamento
                </Button>
              </div>

              {/* Gráfico de Resumo */}
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 hover:border-slate-200 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Evolução Semanal
                  </h3>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                  </div>
                </div>
                <div className="h-40 flex items-end gap-3 px-2">
                  {[40, 65, 45, 90, 55, 75, 60].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-slate-50 rounded-xl relative group h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-slate-200 rounded-xl transition-all group-hover:bg-primary/20"
                        style={{ height: `${h}%` }}
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                        {h}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span>Seg</span>
                  <span>Ter</span>
                  <span>Qua</span>
                  <span>Qui</span>
                  <span>Sex</span>
                  <span>Sab</span>
                  <span>Dom</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: HISTÓRICO */}
        {activeTab === "historico" && (
          <div className="bg-white rounded-[32px] border border-slate-100 p-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100/50">
              <History size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
              Histórico de Atividade
            </h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              O log completo de viagens, alterações de status e feedbacks dos
              clientes será exibido aqui em breve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ElegantInfoCard({
  icon: Icon,
  label,
  value,
  className,
  isStatus,
  status,
}: {
  icon: any;
  label: string;
  value: string | number;
  className?: string;
  isStatus?: boolean;
  status?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-slate-200 hover:shadow-sm group",
        className
      )}>
      <div className=" w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
          {label}
        </p>
        {isStatus ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                status === "online" || status === "disponivel"
                  ? "bg-green-500"
                  : status === "ocupado"
                  ? "bg-amber-500"
                  : "bg-red-500"
              )}
            />
            <p className="font-bold text-slate-900 text-sm capitalize">
              {value}
            </p>
          </div>
        ) : (
          <p className="font-bold text-slate-900 text-sm mt-0.5 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function ElegantStatusBox({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 transition-all hover:border-slate-200 hover:shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
          <Icon size={16} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="text-[10px] font-bold text-green-600">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

function ElegantTextArea({
  icon: Icon,
  label,
  value,
  isAlert,
}: {
  icon: any;
  label: string;
  value?: string;
  isAlert?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col transition-all hover:border-slate-200 hover:shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "p-1.5 rounded-lg",
            isAlert ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"
          )}>
          <Icon size={14} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "text-xs leading-relaxed",
          isAlert ? "text-red-600 font-medium" : "text-slate-600 italic"
        )}>
        {value ? `"${value}"` : "Nenhuma informação registada."}
      </p>
    </div>
  );
}

function ElegantDocumentStatus({
  icon: Icon,
  label,
  status,
  variant,
}: {
  icon: any;
  label: string;
  status: string;
  variant: "success" | "info" | "warning";
}) {
  const colors = {
    success: "text-green-500 bg-green-50",
    info: "text-blue-500 bg-blue-50",
    warning: "text-amber-500 bg-amber-50",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all group">
      <div className="flex items-center gap-3">
        <div
          className={cn("p-2 rounded-xl transition-colors", colors[variant])}>
          <Icon size={18} />
        </div>
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <span
        className={cn(
          "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
          colors[variant]
        )}>
        {status}
      </span>
    </div>
  );
}

function ElegantDetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="text-slate-400">
          <Icon size={16} />
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}
