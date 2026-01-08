"use client"

import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const receitaMensal = [
  { mes: "Jan", valor: 320000 },
  { mes: "Fev", valor: 380000 },
  { mes: "Mar", valor: 350000 },
  { mes: "Abr", valor: 420000 },
  { mes: "Mai", valor: 450000 },
  { mes: "Jun", valor: 480000 },
]

const receitaPorMotorista = [
  { nome: "Pedro Costa", valor: 850000 },
  { nome: "Lucas Pereira", valor: 720000 },
  { nome: "Manuel Sousa", valor: 540000 },
  { nome: "André Santos", valor: 480000 },
  { nome: "Ricardo Neto", valor: 420000 },
]

const transacoes = [
  { id: 1, tipo: "entrada", descricao: "Viagem #1234 - João Silva", valor: "8.500 Kz", data: "2024-01-15 14:30" },
  { id: 2, tipo: "entrada", descricao: "Viagem #1233 - Maria Santos", valor: "15.000 Kz", data: "2024-01-15 13:45" },
  { id: 3, tipo: "saida", descricao: "Comissão WiTransfer", valor: "-12.500 Kz", data: "2024-01-15 12:00" },
  { id: 4, tipo: "entrada", descricao: "Viagem #1232 - Ana Ferreira", valor: "6.200 Kz", data: "2024-01-15 12:20" },
  { id: 5, tipo: "saida", descricao: "Manutenção - Toyota Corolla", valor: "-45.000 Kz", data: "2024-01-15 10:00" },
  { id: 6, tipo: "entrada", descricao: "Viagem #1231 - Carlos Mendes", valor: "12.800 Kz", data: "2024-01-15 11:00" },
]

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 mt-1">Acompanhe a receita e despesas da sua empresa.</p>
        </div>
        <Button className="bg-[#1a365d] hover:bg-[#1a365d]/90">Exportar Relatório</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Receita do Mês</p>
                <p className="text-2xl font-bold text-gray-900">450.000 Kz</p>
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Despesas do Mês</p>
                <p className="text-2xl font-bold text-gray-900">85.000 Kz</p>
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <TrendingDown className="h-4 w-4" />
                  <span>+5.2%</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Lucro Líquido</p>
                <p className="text-2xl font-bold text-gray-900">365.000 Kz</p>
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+15.8%</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">A Receber</p>
                <p className="text-2xl font-bold text-gray-900">125.000 Kz</p>
                <p className="text-sm text-gray-500 mt-1">De 15 viagens</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={receitaMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} Kz`, "Receita"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Line type="monotone" dataKey="valor" stroke="#1a365d" strokeWidth={2} dot={{ fill: "#1a365d" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Motorista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={receitaPorMotorista} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#94a3b8" tickFormatter={(value) => `${value / 1000}k`} />
                  <YAxis dataKey="nome" type="category" stroke="#94a3b8" width={100} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} Kz`, "Receita"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="valor" fill="#1a365d" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimas Transações</CardTitle>
          <Button variant="link" className="text-blue-600">
            Ver todas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transacoes.map((transacao) => (
              <div key={transacao.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      transacao.tipo === "entrada" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {transacao.tipo === "entrada" ? (
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transacao.descricao}</p>
                    <p className="text-sm text-gray-500">{transacao.data}</p>
                  </div>
                </div>
                <p className={`font-bold ${transacao.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
                  {transacao.valor}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
