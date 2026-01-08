/** @format */

"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Car,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Navigation,
  ArrowRight,
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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import "@/app/loading";
import GlobalLoading from "@/app/loading";

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const result = await getBookingsAction("transfer");
      if (result.success) {
        setTransfers(result.data);
      }
    } catch (error) {
      toast.error("Erro ao carregar solicitações de transfer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const result = await updateBookingStatusAction(id, status);
      if (result.success) {
        toast.success(`Transfer atualizado para: ${status}`);
        fetchTransfers();
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
        <GlobalLoading />
      </div>
    );
  }

  const filtered = transfers.filter(
    (t) =>
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header - SEM BOTÃO DE CRIAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Viagens & Transfers
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie as solicitações de transporte ponto a ponto dos clientes.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4 border-b border-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por cliente, origem ou ID..."
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
                  ID / Cliente
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Itinerário (Rota)
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Agenda
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Veículo
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
                    className="text-center py-20 text-slate-400 font-medium">
                    Nenhuma viagem solicitada até o momento.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-slate-50 hover:bg-slate-50/20 transition-colors h-24 group">
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
                      <div className="flex flex-col gap-1 max-w-[200px]">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <div className="w-2 h-2 rounded-full border border-primary shrink-0" />
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {item.pickupLocation}
                          </span>
                        </div>
                        <div className="h-2 border-l border-dotted border-slate-300 ml-[3px]" />
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <MapPin className="w-2.5 h-2.5 text-red-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {item.dropoffLocation}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(item.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <Car className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {item.carName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "border-none px-2.5 py-1 rounded-full font-bold uppercase text-[9px] tracking-wider",
                          item.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : item.status === "pending"
                            ? "bg-amber-100 text-amber-700 animate-pulse"
                            : "bg-slate-100 text-slate-500"
                        )}>
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
                            className="h-8 w-8 text-slate-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl p-2">
                          <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">
                            Controle Operacional
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(item.id, "confirmed")
                            }
                            className="gap-2 cursor-pointer font-bold text-green-600 focus:text-green-600 focus:bg-green-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" /> Aprovar Viagem
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(item.id, "canceled")
                            }
                            className="gap-2 cursor-pointer font-bold text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg">
                            <XCircle className="w-4 h-4" /> Negar Pedido
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 cursor-pointer font-medium rounded-lg">
                            <button
                              type="button"
                              className="flex items-center gap-2 w-full text-left"
                              onClick={() => {
                                if (item.carId) {
                                  router.push(
                                    `/admin/viaturas/rastreamento?vehicleId=${item.carId}`
                                  );
                                }
                              }}>
                              <Navigation className="w-4 h-4" /> Ver no Mapa
                            </button>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer font-medium rounded-lg">
                            <Link
                              href={`/admin/clientes/${item.userId}`}
                              className="flex items-center gap-2 w-full">
                              <User className="w-4 h-4" /> Ver Perfil do Cliente
                            </Link>
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
