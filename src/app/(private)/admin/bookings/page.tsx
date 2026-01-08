"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Calendar,
  Clock,
  User,
  Car,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  Search,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getBookingsAction, updateBookingStatusAction } from "../../actions";
import { toast } from "sonner";

export default function RentalsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const result = await getBookingsAction("rental");
      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      toast.error("Erro ao carregar solicitações de aluguer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const result = await updateBookingStatusAction(id, status);
      if (result.success) {
        toast.success(`Pedido atualizado para: ${status}`);
        fetchRentals();
      } else {
        toast.error(result.error || "Erro ao atualizar status.");
      }
    } catch (error) {
      toast.error("Erro inesperado.");
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-medium">Sincronizando pedidos de aluguer...</p>
      </div>
    );
  }

  const filtered = bookings.filter(
    (b) =>
      b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header - SEM BOTÃO DE CRIAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Solicitações de Aluguer
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os pedidos de Rent-a-car realizados pelos clientes.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Pendentes",
            count: bookings.filter((b) => b.status === "pending").length,
            color: "orange",
          },
          {
            label: "Confirmados",
            count: bookings.filter((b) => b.status === "confirmed").length,
            color: "green",
          },
          {
            label: "Total Faturado (Est.)",
            count: `${bookings
              .filter((b) => b.status === "confirmed")
              .reduce((acc, curr) => acc + curr.totalPrice, 0)
              .toLocaleString()} AOA`,
            color: "blue",
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm pb-2">
            <CardContent className="pt-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {stat.count}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4 border-b border-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por cliente ou ID do pedido..."
              className="pl-10 h-10 bg-slate-50 border-none rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14">
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] pl-8">
                  Pedido / Cliente
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Veículo Escolhido
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Período (Datas)
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Valor Total
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Status
                </TableHead>
                <TableHead className="text-right pr-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-20 text-slate-400 font-medium"
                  >
                    Nenhuma solicitação de aluguer encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-slate-50 hover:bg-slate-50/20 transition-colors h-20 group"
                  >
                    <TableCell className="pl-8">
                      <div>
                        <p className="text-[11px] font-bold text-primary mb-1 uppercase tracking-tighter">
                          {item.id}
                        </p>
                        <p className="text-sm font-black text-slate-900 leading-none">
                          {item.userName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {item.userEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">
                          {item.carName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          {new Date(item.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          {new Date(item.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-black text-slate-900">
                        {Number(item.totalPrice).toLocaleString()} AOA
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "border-none px-2.5 py-1 rounded-full font-bold uppercase text-[9px] tracking-wider",
                          item.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : item.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {item.status === "confirmed"
                          ? "Confirmado"
                          : item.status === "pending"
                            ? "Pendente"
                            : item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl p-2"
                        >
                          <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">
                            Ações Gestão
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(item.id, "confirmed")
                            }
                            className="gap-2 cursor-pointer font-bold text-green-600 focus:text-green-600 focus:bg-green-50 rounded-lg"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Confirmar
                            Reserva
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(item.id, "canceled")
                            }
                            className="gap-2 cursor-pointer font-bold text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
                          >
                            <XCircle className="w-4 h-4" /> Cancelar Pedido
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 cursor-pointer font-medium rounded-lg">
                            <User className="w-4 h-4" /> Perfil do Cliente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
