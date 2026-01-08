"use client"

import { FileText, Download, Calendar, TrendingUp, Users, Car } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const relatoriosDisponiveis = [
  {
    id: 1,
    nome: "Relatório de Viagens",
    descricao: "Detalhamento de todas as viagens do período",
    tipo: "Operacional",
    icon: Car,
  },
  {
    id: 2,
    nome: "Relatório Financeiro",
    descricao: "Receitas, despesas e lucro do período",
    tipo: "Financeiro",
    icon: TrendingUp,
  },
  {
    id: 3,
    nome: "Desempenho dos Motoristas",
    descricao: "Avaliações, viagens e ganhos por motorista",
    tipo: "Operacional",
    icon: Users,
  },
  {
    id: 4,
    nome: "Relatório de Clientes",
    descricao: "Clientes ativos, novos e recorrentes",
    tipo: "Comercial",
    icon: Users,
  },
]

const relatoriosGerados = [
  {
    id: 1,
    nome: "Relatório Mensal - Janeiro 2024",
    dataGeracao: "2024-01-31",
    tamanho: "2.4 MB",
    status: "Disponível",
  },
  { id: 2, nome: "Relatório Semanal - Semana 3", dataGeracao: "2024-01-21", tamanho: "856 KB", status: "Disponível" },
  {
    id: 3,
    nome: "Relatório de Motoristas - Janeiro",
    dataGeracao: "2024-01-20",
    tamanho: "1.2 MB",
    status: "Disponível",
  },
  {
    id: 4,
    nome: "Relatório Financeiro - Dezembro 2023",
    dataGeracao: "2024-01-05",
    tamanho: "3.1 MB",
    status: "Disponível",
  },
]

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500 mt-1">Gere e baixe relatórios detalhados do seu negócio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatoriosDisponiveis.map((relatorio) => (
          <Card key={relatorio.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <relatorio.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{relatorio.nome}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {relatorio.tipo}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{relatorio.descricao}</p>

                  <div className="flex items-center gap-3">
                    <Select defaultValue="mes">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semana">Esta semana</SelectItem>
                        <SelectItem value="mes">Este mês</SelectItem>
                        <SelectItem value="trimestre">Trimestre</SelectItem>
                        <SelectItem value="ano">Este ano</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-[#1a365d] hover:bg-[#1a365d]/90">Gerar Relatório</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Gerados</CardTitle>
          <CardDescription>Relatórios previamente gerados disponíveis para download</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatoriosGerados.map((relatorio) => (
              <div
                key={relatorio.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{relatorio.nome}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {relatorio.dataGeracao}
                      </span>
                      <span>{relatorio.tamanho}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700">{relatorio.status}</Badge>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Baixar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
