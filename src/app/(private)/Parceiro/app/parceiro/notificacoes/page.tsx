"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const notificacoes = [
  {
    id: 1,
    tipo: "sucesso",
    titulo: "Viagem concluída",
    mensagem: "A viagem #1234 foi concluída com sucesso. Valor: 8.500 Kz",
    data: "Há 5 minutos",
    lida: false,
  },
  {
    id: 2,
    tipo: "alerta",
    titulo: "Manutenção pendente",
    mensagem: "O veículo Toyota Corolla (LD-45-78-AB) precisa de revisão em 5 dias.",
    data: "Há 1 hora",
    lida: false,
  },
  {
    id: 3,
    tipo: "info",
    titulo: "Novo motorista cadastrado",
    mensagem: "Ricardo Neto foi adicionado à sua equipe de motoristas.",
    data: "Há 2 horas",
    lida: false,
  },
  {
    id: 4,
    tipo: "erro",
    titulo: "Viagem cancelada",
    mensagem: "A viagem #1228 foi cancelada pelo cliente Sofia Nunes.",
    data: "Há 3 horas",
    lida: true,
  },
  {
    id: 5,
    tipo: "sucesso",
    titulo: "Pagamento recebido",
    mensagem: "Você recebeu o pagamento de 125.000 Kz referente às viagens de ontem.",
    data: "Há 5 horas",
    lida: true,
  },
  {
    id: 6,
    tipo: "info",
    titulo: "Atualização do sistema",
    mensagem: "Novas funcionalidades foram adicionadas ao painel do parceiro.",
    data: "Há 1 dia",
    lida: true,
  },
]

export default function NotificacoesPage() {
  const [activeTab, setActiveTab] = useState("todas")
  const [notificacoesList, setNotificacoesList] = useState(notificacoes)

  const naoLidas = notificacoesList.filter((n) => !n.lida).length

  const filteredNotificacoes = notificacoesList.filter((n) => {
    if (activeTab === "todas") return true
    if (activeTab === "nao-lidas") return !n.lida
    if (activeTab === "lidas") return n.lida
    return true
  })

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "sucesso":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "alerta":
        return <AlertCircle className="h-5 w-5 text-amber-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      case "erro":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getBgColor = (tipo: string) => {
    switch (tipo) {
      case "sucesso":
        return "bg-green-100"
      case "alerta":
        return "bg-amber-100"
      case "info":
        return "bg-blue-100"
      case "erro":
        return "bg-red-100"
      default:
        return "bg-gray-100"
    }
  }

  const marcarTodasComoLidas = () => {
    setNotificacoesList(notificacoesList.map((n) => ({ ...n, lida: true })))
  }

  const marcarComoLida = (id: number) => {
    setNotificacoesList(notificacoesList.map((n) => (n.id === id ? { ...n, lida: true } : n)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-500 mt-1">
            {naoLidas > 0 ? `Você tem ${naoLidas} notificações não lidas` : "Todas as notificações foram lidas"}
          </p>
        </div>
        {naoLidas > 0 && (
          <Button variant="outline" className="gap-2 bg-transparent" onClick={marcarTodasComoLidas}>
            <CheckCheck className="h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todas">
            Todas
            <Badge variant="secondary" className="ml-2">
              {notificacoesList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="nao-lidas">
            Não lidas
            {naoLidas > 0 && <Badge className="ml-2 bg-red-500">{naoLidas}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="lidas">Lidas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {filteredNotificacoes.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Nenhuma notificação encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotificacoes.map((notificacao) => (
                    <div
                      key={notificacao.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                        !notificacao.lida ? "bg-blue-50/50 border-blue-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${getBgColor(notificacao.tipo)}`}
                      >
                        {getIcon(notificacao.tipo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{notificacao.titulo}</h3>
                          {!notificacao.lida && <div className="h-2 w-2 rounded-full bg-blue-600"></div>}
                        </div>
                        <p className="text-gray-600">{notificacao.mensagem}</p>
                        <p className="text-sm text-gray-400 mt-2">{notificacao.data}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notificacao.lida && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => marcarComoLida(notificacao.id)}
                            title="Marcar como lida"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Remover">
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
