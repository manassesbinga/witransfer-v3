"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Edit, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getCategoriesAction, getExtrasAction } from "../../actions";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, extRes] = await Promise.all([
        getCategoriesAction(),
        getExtrasAction(),
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (extRes.success) setExtras(extRes.data);
    } catch (error) {
      toast.error("Erro ao carregar catálogo do banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-medium animate-pulse">
          Solicitando dados ao servidor...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Catálogo de Serviços
        </h1>
        <p className="text-slate-500 mt-1">
          Dados gerenciados diretamente do ecossistema WiTransfer.
        </p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
          <TabsTrigger
            value="categories"
            className="rounded-lg px-6 font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Tag className="w-4 h-4 mr-2" /> Categorias
          </TabsTrigger>
          <TabsTrigger
            value="extras"
            className="rounded-lg px-6 font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Package className="w-4 h-4 mr-2" /> Serviços Extras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100">
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] pl-8 h-12">
                      ID Class
                    </TableHead>
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12">
                      Nome da Categoria
                    </TableHead>
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12">
                      Descrição
                    </TableHead>
                    <TableHead className="text-right pr-8 h-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id} className="border-slate-50 h-16">
                      <TableCell className="pl-8 font-mono text-xs text-slate-400">
                        {cat.id}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {cat.label}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {cat.description}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extras" className="space-y-4">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100">
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] pl-8 h-12">
                      Serviço Extra
                    </TableHead>
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12">
                      Cobrança
                    </TableHead>
                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12">
                      Preço (AOA)
                    </TableHead>
                    <TableHead className="text-right pr-8 h-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extras.map((extra) => (
                    <TableRow key={extra.id} className="border-slate-50 h-16">
                      <TableCell className="pl-8 font-bold text-slate-800">
                        {extra.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-slate-50 border-slate-100 text-[10px] font-bold text-slate-500 uppercase"
                        >
                          {extra.perDay ? "Diária" : "Fixo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        {Number(extra.price).toLocaleString()} AOA
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
