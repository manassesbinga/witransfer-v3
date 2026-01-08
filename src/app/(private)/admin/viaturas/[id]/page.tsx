/** @format */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Car,
  Calendar,
  Users,
  AlertTriangle,
  Gauge,
  Fuel,
  FileText,
  Wrench,
  Camera,
  Activity,
  Shield,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Settings,
  BarChart3,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Viatura } from "../../../../../types/viatura";
import { getCarsAction } from "../../../actions/cars/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Dados mockados extendidos para demonstração
const extendedMockData = {
  manutencao: [
    {
      id: 1,
      data: "2023-11-15",
      tipo: "Troca de Óleo",
      quilometragem: 45000,
      oficina: "AutoMecânica Silva",
      custo: 35000,
      proxima: "2024-05-15",
      kmAlvo: 55000,
    },
    {
      id: 2,
      data: "2023-08-10",
      tipo: "Revisão Geral",
      quilometragem: 40000,
      oficina: "AutoMecânica Silva",
      custo: 120000,
      proxima: "2024-02-10",
      kmAlvo: 50000,
    },
    {
      id: 3,
      data: "2023-05-20",
      tipo: "Troca de Pneus",
      quilometragem: 38000,
      oficina: "Pneus & Cia",
      custo: 200000,
      proxima: "",
      kmAlvo: 0,
    },
  ],
  documentos: {
    seguro: {
      companhia: "Global Seguros",
      apolice: "12345/23",
      validade: "2024-12-31",
      status: "valido",
    },
    inspecao: { data: "2023-10-01", validade: "2024-10-01", status: "valido" },
    livreto: { status: "regular" },
    multas: [
      {
        id: 1,
        data: "2023-09-15",
        valor: 5000,
        motivo: "Estacionamento proibido",
        status: "pendente",
      },
    ],
  },
  estado: {
    geral: "BOM",
    notas:
      "Veículo em bom estado de conservação, pequenos riscos no para-choque traseiro.",
    danos: [
      { local: "Para-choque traseiro", tipo: "Arranhão", severidade: "Baixa" },
      {
        local: "Porta motorista",
        tipo: "Pequeno amassado",
        severidade: "Baixa",
      },
    ],
  },
  consumo: {
    mediaUrbana: "8.5 km/l",
    mediaEstrada: "12.0 km/l",
    ultimoAbastecimento: { data: "2023-12-10", litros: 45, tipo: "Gasolina" },
  },
  estatisticas: {
    viagensRealizadas: 342,
    kmPercorridos: 45000,
    mediaKmDia: 150,
    tempoBomba: "98%",
    custoManutencao: 355000,
    eficienciaOperacional: 95,
  },
};

const DetalheViatura = () => {
  const router = useRouter();
  const params = useParams();
  const viaturaId = params.id as string;

  const [carregando, setCarregando] = useState(true);
  const [viatura, setViatura] = useState<Viatura | null>(null);
  const [activeTab, setActiveTab] = useState<
    "geral" | "manutencao" | "documentos" | "fotos"
  >("geral");

  useEffect(() => {
    const fetchViatura = async () => {
      setCarregando(true);
      try {
        const result = await getCarsAction();
        if (result.success) {
          const v = result.data.find((item: any) => item.id === viaturaId);
          if (v) {
            setViatura({
              ...v,
              modelo: v.modelo || v.name || "Sem modelo",
              marca: v.marca || "Sem marca",
              matricula: v.matricula || `ID-${v.id.slice(0, 4)}`,
              status: v.status || "ativa",
              kilometragem: v.kilometragem || v.quilometragemAtual || 0,
            });
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar detalhes da viatura");
      } finally {
        setCarregando(false);
      }
    };
    fetchViatura();
  }, [viaturaId]);

  if (carregando)
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin mx-auto w-8 h-8 text-blue-600" />
      </div>
    );
  if (!viatura)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Viatura não encontrada
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header com Navegação */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/viaturas")}
          className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Voltar para Viaturas
        </button>

        {/* Card Header Premium */}
        <div className="bg-white border border-gray-100 rounded-none p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-6">
              {/* Ícone grande */}
              <div className="bg-blue-50 p-4 rounded-none border border-gray-100">
                <Car size={48} className="text-blue-600" />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {viatura.ano} {viatura.marca} {viatura.modelo}
                  </h1>
                  <Badge
                    variant={
                      viatura.status === "ativa"
                        ? "success"
                        : viatura.status === "manutencao"
                        ? "warning"
                        : "destructive"
                    }>
                    {viatura.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-slate-500 flex items-center gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />{" "}
                    {viatura.matricula}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{viatura.cor}</span>
                  <span className="text-slate-300">•</span>
                  <span>{viatura.categoria}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <Gauge size={14} className="text-slate-400" />{" "}
                    {viatura.kilometragem.toLocaleString()} km
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-none h-11 font-bold border-gray-100 hover:bg-slate-50">
                <Edit size={16} /> Editar
              </Button>
              <Button
                variant="default"
                className="flex items-center gap-2 rounded-none h-11 font-bold bg-blue-600 hover:bg-blue-700 border-0">
                <Calendar size={16} /> Agendar Manutenção
              </Button>
            </div>
          </div>

          {/* Quick Stats no Header */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
            <div className="bg-slate-50 p-4 rounded-none border border-gray-100">
              <p className="text-slate-400 text-xs uppercase font-medium tracking-wider mb-2">
                Viagens Realizadas
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {extendedMockData.estatisticas.viagensRealizadas}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-none border border-gray-100">
              <p className="text-slate-400 text-xs uppercase font-medium tracking-wider mb-2">
                Km Percorridos
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {extendedMockData.estatisticas.kmPercorridos.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-none border border-gray-100">
              <p className="text-slate-400 text-xs uppercase font-medium tracking-wider mb-2">
                Média KM/Dia
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {extendedMockData.estatisticas.mediaKmDia}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-none border border-gray-100">
              <p className="text-slate-400 text-xs uppercase font-medium tracking-wider mb-2">
                Eficiência
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {extendedMockData.estatisticas.eficienciaOperacional}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação Interna (Tabs) */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "geral", label: "Visão Geral", icon: Car },
            { id: "manutencao", label: "Manutenção & Estado", icon: Wrench },
            { id: "documentos", label: "Documentação", icon: FileText },
            { id: "fotos", label: "Galeria", icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}>
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      <div className="space-y-6">
        {/* ABA: VISÃO GERAL */}
        {activeTab === "geral" && (
          <div className="space-y-6">
            {/* Grid de Cards Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card de Foto e Especificações */}
              <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-br from-gray-100 to-gray-200 h-72 w-full flex items-center justify-center relative">
                  <Car size={80} className="text-gray-400" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Gauge size={14} className="text-blue-600" />
                      {viatura.kilometragem.toLocaleString()} km
                    </div>
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Calendar size={14} className="text-purple-600" />
                      {viatura.ano}
                    </div>
                  </div>
                  <button className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Camera size={16} />
                    Adicionar Fotos
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-gray-600" />
                    Especificações Técnicas
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-linear-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Fuel size={16} className="text-teal-600" />
                        <p className="text-xs text-gray-600">Combustível</p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {viatura.tipoCombustivel || "Gasolina"}
                      </p>
                    </div>

                    <div className="bg-linear-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge size={16} className="text-purple-600" />
                        <p className="text-xs text-gray-600">Transmissão</p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {viatura.transmissao || "Manual"}
                      </p>
                    </div>

                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={16} className="text-blue-600" />
                        <p className="text-xs text-gray-600">Tração</p>
                      </div>
                      <p className="font-bold text-gray-900">4x2</p>
                    </div>

                    <div className="bg-linear-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-orange-600" />
                        <p className="text-xs text-gray-600">Lugares</p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {viatura.lugares || 5}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Lateral: Motorista e Performance */}
              <div className="space-y-6">
                <div className="bg-linear-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wider opacity-90">
                    Motorista Responsável
                  </h3>
                  {viatura.motoristaId ? (
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
                        {viatura.motoristanome?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          {viatura.motoristanome}
                        </p>
                        <p className="text-xs text-blue-100">
                          ID: #{viatura.motoristaId}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white/10 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30">
                      <Users size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm mb-2">Nenhum motorista alocado</p>
                      <button className="text-xs bg-white text-blue-600 px-4 py-1.5 rounded-full font-medium hover:bg-blue-50 transition-colors">
                        Atribuir Motorista
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-600" />
                    Performance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Fuel size={14} />
                          Consumo Médio
                        </span>
                        <span className="font-semibold text-gray-900">
                          {extendedMockData.consumo.mediaUrbana}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-linear-to-r from-green-500 to-emerald-500 h-2.5 rounded-full"
                          style={{ width: "85%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Activity size={14} />
                          Saúde Motor
                        </span>
                        <span className="font-semibold text-green-600">
                          98%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-linear-to-r from-green-500 to-emerald-500 h-2.5 rounded-full"
                          style={{ width: "98%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 flex items-center gap-1">
                          <CheckCircle size={14} />
                          Tempo em Operação
                        </span>
                        <span className="font-semibold text-blue-600">
                          {extendedMockData.estatisticas.tempoBomba}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-linear-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full"
                          style={{ width: "98%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes Técnicos Expandidos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Informações Técnicas Detalhadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">
                    Número de Chassi (VIN)
                  </p>
                  <p className="font-semibold text-gray-900">
                    {viatura.numeroChassi || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Número do Motor</p>
                  <p className="font-semibold text-gray-900">
                    {viatura.numeroMotor || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Potência</p>
                  <p className="font-semibold text-gray-900">
                    {viatura.potencia ? `${viatura.potencia} cv` : "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Cilindrada</p>
                  <p className="font-semibold text-gray-900">
                    {viatura.cilindrada ? `${viatura.cilindrada} cc` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Estatísticas de Uso */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      {extendedMockData.estatisticas.viagensRealizadas}
                    </p>
                    <p className="text-green-100 text-sm">Viagens</p>
                  </div>
                </div>
                <p className="text-green-100">Viagens Realizadas</p>
              </div>

              <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Gauge size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      {extendedMockData.estatisticas.kmPercorridos.toLocaleString()}
                    </p>
                    <p className="text-blue-100 text-sm">Quilômetros</p>
                  </div>
                </div>
                <p className="text-blue-100">Total Percorrido</p>
              </div>

              <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Wrench size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      {(
                        extendedMockData.estatisticas.custoManutencao / 1000
                      ).toFixed(0)}
                      K
                    </p>
                    <p className="text-purple-100 text-sm">Kz</p>
                  </div>
                </div>
                <p className="text-purple-100">Custo Manutenção</p>
              </div>
            </div>
          </div>
        )}

        {/* ABA: MANUTENÇÃO */}
        {activeTab === "manutencao" && (
          <div className="space-y-6">
            {/* Histórico */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" />
                  Histórico de Manutenção
                </h3>
                <Button
                  size="sm"
                  variant="default"
                  className="flex items-center gap-2">
                  <Plus size={16} />
                  Adicionar Registro
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="  from-gray-50 to-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-lg">Data</th>
                      <th className="px-6 py-4">Serviço</th>
                      <th className="px-6 py-4">Oficina</th>
                      <th className="px-6 py-4">KM</th>
                      <th className="px-6 py-4 rounded-tr-lg text-right">
                        Custo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {extendedMockData.manutencao.map((repo) => (
                      <tr
                        key={repo.id}
                        className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(repo.data).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">
                            {repo.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {repo.oficina}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                            {repo.quilometragem.toLocaleString()} km
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-blue-600 font-bold">
                            {repo.custo.toLocaleString()} Kz
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Estado Geral */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-600" />
                  Próxima Manutenção
                </h3>
                <div className=" o-amber-50 p-5 rounded-xl border-2 border-yellow-200 mb-4">
                  <div className="flex items-start gap-4">
                    <AlertTriangle
                      className="text-yellow-600  mt-1"
                      size={24}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-yellow-900 mb-1">
                        Troca de Óleo Prevista
                      </p>
                      <p className="text-sm text-yellow-700">
                        Em <span className="font-semibold">1.500 km</span> ou
                        até <span className="font-semibold">15/05/2024</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">
                      Revisão Geral:
                    </span>
                    <span className="font-semibold text-gray-900">
                      10.000 km restantes
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">
                      Troca de Pneus:
                    </span>
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} />
                      Recente
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-green-600" />
                  Relatório de Estado
                </h3>
                <div className="mb-6 text-center  from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Condição Geral</p>
                  <p className="text-4xl font-bold text-green-600">
                    {extendedMockData.estado.geral}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i <= 4 ? "bg-green-500" : "bg-gray-300"
                        }`}></div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Avarias / Danos Registrados:
                  </p>
                  <ul className="space-y-2">
                    {extendedMockData.estado.danos.map((dano, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                        <AlertTriangle
                          size={14}
                          className="text-red-500  mt-0.5"
                        />
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium">
                            {dano.tipo}
                          </span>
                          <span className="text-gray-600">
                            {" "}
                            em {dano.local}
                          </span>
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            Severidade: {dano.severidade}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: DOCUMENTOS */}
        {activeTab === "documentos" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seguro */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Shield className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Seguro Automóvel
                      </h3>
                      <p className="text-xs text-gray-500">Proteção completa</p>
                    </div>
                  </div>
                  <Badge variant="success">Válido</Badge>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Companhia</p>
                    <p className="font-semibold text-gray-900">
                      {extendedMockData.documentos.seguro.companhia}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Apólice</p>
                    <p className="font-semibold text-gray-900">
                      {extendedMockData.documentos.seguro.apolice}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Validade</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(
                        extendedMockData.documentos.seguro.validade
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspeção */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <FileText className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Inspeção Obrigatória
                      </h3>
                      <p className="text-xs text-gray-500">Revisão técnica</p>
                    </div>
                  </div>
                  <Badge variant="success">Regular</Badge>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      Última Inspeção
                    </p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(
                        extendedMockData.documentos.inspecao.data
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Válido até</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(
                        extendedMockData.documentos.inspecao.validade
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 mb-1">Status</p>
                    <p className="font-semibold text-green-800 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Em Dia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Multas / Pendências */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-600" />
                Pendências e Multas
              </h3>
              {extendedMockData.documentos.multas.length > 0 ? (
                <div className="space-y-3">
                  {extendedMockData.documentos.multas.map((multa) => (
                    <div
                      key={multa.id}
                      className="flex justify-between items-center bg-red-50 p-5 rounded-xl border-2 border-red-100">
                      <div className="flex items-start gap-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-900">
                            {multa.motivo}
                          </p>
                          <p className="text-xs text-red-700 flex items-center gap-1 mt-1">
                            <Calendar size={12} />
                            {new Date(multa.data).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-700">
                          {multa.valor.toLocaleString()} Kz
                        </p>
                        <span className="inline-block text-xs bg-red-200 text-red-800 px-3 py-1 rounded-full font-medium mt-1">
                          {multa.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle
                    size={48}
                    className="mx-auto text-green-600 mb-3"
                  />
                  <p className="text-green-800 font-semibold">
                    Nenhuma pendência encontrada
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Veículo sem multas ou restrições
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: FOTOS */}
        {activeTab === "fotos" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Camera size={20} className="text-purple-600" />
              Galeria do Veículo
            </h3>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Fotos Externas
                </h4>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  <Plus size={14} />
                  Adicionar Foto
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="group relative aspect-video  from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hover:shadow-lg transition-all cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-400">
                    <Car
                      className="text-gray-300 group-hover:text-gray-400 transition-colors"
                      size={32}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Fotos Internas
                </h4>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  <Plus size={14} />
                  Adicionar Foto
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="group relative aspect-video  from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hover:shadow-lg transition-all cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-400">
                    <Car
                      className="text-gray-300 group-hover:text-gray-400 transition-colors"
                      size={32}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalheViatura;
