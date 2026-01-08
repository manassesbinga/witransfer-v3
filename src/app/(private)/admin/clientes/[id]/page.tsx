/** @format */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  DollarSign,
  Star,
  ArrowLeft,
  Edit,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Navigation,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import GlobalLoading from "@/app/loading";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

// Mock data - em produção viria da API
const mockCliente = {
  id: "CLI-001",
  nome: "Ana Silva Santos",
  email: "ana.silva@email.com",
  telefone: "+244 923 456 789",
  dataCadastro: "2024-01-15",
  totalViagens: 23,
  totalGasto: 450000,
  status: "ativo",
  ultimaViagem: "2024-12-20",
  avaliacaoMedia: 4.8,
  endereco: "Talatona, Luanda",
  preferencias: ["carro conforto", "pagamento mpsi"],
  documento: "BI123456789LA",
  dataNascimento: "1990-05-15",
  genero: "Feminino",
  notas:
    "Cliente preferencial, sempre solicita carros conforto. Pagamento sempre em dia.",
  viagensRecentes: [
    {
      id: "TR-1001",
      data: "2024-12-20",
      origem: "Aeroporto 4 de Fevereiro",
      destino: "Talatona",
      valor: 25000,
      status: "completed",
      motorista: "João Silva",
      avaliacao: 5,
    },
    {
      id: "TR-0998",
      data: "2024-12-18",
      origem: "Talatona",
      destino: "Centro de Luanda",
      valor: 18000,
      status: "completed",
      motorista: "Pedro Manuel",
      avaliacao: 4,
    },
    {
      id: "TR-0995",
      data: "2024-12-15",
      origem: "Kilamba Kiaxi",
      destino: "Aeroporto 4 de Fevereiro",
      valor: 22000,
      status: "completed",
      motorista: "Carlos Alberto",
      avaliacao: 5,
    },
  ],
};

export default function ClientePerfilPage() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState(mockCliente);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Em produção, buscar dados do cliente pelo ID
    // fetchCliente(params.id);
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <GlobalLoading />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Perfil do Cliente
            </h1>
            <p className="text-slate-500 mt-1">
              Detalhes completos do cliente {cliente.id}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-11 px-4 font-bold border-slate-100 hover:bg-slate-50">
            <Download size={18} className="mr-2" />
            Exportar
          </Button>
          <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {cliente.nome}
                  </h2>
                  <p className="text-slate-500 text-sm mb-4">{cliente.id}</p>
                  <Badge
                    className={cn(
                      "border-none px-4 py-2 rounded-full font-bold uppercase text-sm tracking-wider shadow-sm",
                      cliente.status === "ativo"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    )}>
                    {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="text-slate-400" />
                    {cliente.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone size={16} className="text-slate-400" />
                    {cliente.telefone}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400" />
                    {cliente.endereco}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-600">Total Viagens</span>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  {cliente.totalViagens}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-600">Total Gasto</span>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                    maximumFractionDigits: 0,
                  }).format(cliente.totalGasto)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-slate-600">
                    Avaliação Média
                  </span>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  {cliente.avaliacaoMedia.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-slate-600">
                    Média por Viagem
                  </span>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                    maximumFractionDigits: 0,
                  }).format(cliente.totalGasto / cliente.totalViagens)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Data de Nascimento
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {format(
                      new Date(cliente.dataNascimento),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Gênero
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {cliente.genero}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Documento de Identidade
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {cliente.documento}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Data de Cadastro
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {format(
                      new Date(cliente.dataCadastro),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Preferências
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cliente.preferencias.map((pref, index) => (
                    <Badge
                      key={index}
                      className="border-none bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Notas Internas
                </label>
                <p className="text-sm text-slate-900 mt-1">{cliente.notas}</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Trips */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Viagens Recentes
                </CardTitle>
                <Link href={`/admin/transfers?cliente=${cliente.id}`}>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Ver Todas
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cliente.viagensRecentes.map((viagem) => (
                  <div
                    key={viagem.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {viagem.id}
                        </p>
                        <p className="text-xs text-slate-500">
                          {viagem.origem} → {viagem.destino}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {format(new Date(viagem.data), "dd/MM/yyyy HH:mm")}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {viagem.motorista}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {new Intl.NumberFormat("pt-AO", {
                          style: "currency",
                          currency: "AOA",
                          maximumFractionDigits: 0,
                        }).format(viagem.valor)}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-slate-600">
                          {viagem.avaliacao}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
