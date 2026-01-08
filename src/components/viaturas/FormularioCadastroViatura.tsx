/** @format */

"use client";

import React from "react";
import { useForm } from "@/hooks/use-form";
import { useNotification } from "@/hooks/use-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveCarAction } from "@/app/(private)/actions/cars/actions";
import { ViaturaFormData } from "../../types/viatura";
import { 
  Field, 
  FieldLabel, 
  FieldError, 
  FieldGroup 
} from "@/components/ui/field";
import { 
  Car, 
  Settings, 
  Activity, 
  FileText, 
  Camera, 
  Plus, 
  Upload,
  CheckCircle
} from "lucide-react";

interface FormularioCadastroViaturaProps {
  viaturaId?: string;
  onSucesso?: () => void;
  editar?: boolean;
  dadosIniciais?: ViaturaFormData;
}

const FormularioCadastroViatura: React.FC<FormularioCadastroViaturaProps> = ({
  viaturaId,
  onSucesso,
  editar = false,
  dadosIniciais: dadosRecebidos,
}) => {
  const { sucesso, erro } = useNotification();

  const dadosPadrao: ViaturaFormData = {
    // A) Dados Básicos
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    cor: "",
    categoria: "economica",
    matricula: "",
    status: "ativa",
    
    // B) Informações Técnicas
    numeroChassi: "",
    numeroMotor: "",
    tipoCombustivel: "gasolina",
    transmissao: "manual",
    
    // C) Estado e Condições
    quilometragemAtual: 0,
    kilometragem: 0, // mantendo compatibilidade
    estadoGeral: "novo",
    nivelConservacao: "otimo",
    dataUltimaRevisao: "",
    dataProximaRevisao: "",
    
    // D) Documentação
    seguroCompanhia: "",
    seguroNumeroApolice: "",
    seguroValidade: "",
    inspecaoDataUltima: "",
    inspecaoValidade: "",
    
    // Extras
    lugares: 5,
    arCondicionado: true,
    possuiABS: false,
    possuiAirbags: false,
  };

  const { valores, erros, enviando, mudar, definirErro, enviar } = useForm({
    valorInicial: dadosRecebidos || dadosPadrao,
    onSubmit: async (dados) => {
      // Validações básicas
      if (!dados.marca) { definirErro("marca", "Marca é obrigatória"); return; }
      if (!dados.modelo) { definirErro("modelo", "Modelo é obrigatório"); return; }
      if (!dados.matricula) { definirErro("matricula", "Matrícula é obrigatória"); return; }
      
      try {
        const result = await saveCarAction({
          ...dados,
          id: editar ? viaturaId : undefined
        });
        
        if (result.success) {
          sucesso(editar ? "Viatura atualizada com sucesso!" : "Viatura cadastrada com sucesso!");
          onSucesso?.();
        } else {
          erro(result.error || "Erro ao salvar viatura");
        }
      } catch (e: any) {
        erro(e.message || "Erro ao salvar viatura");
      }
    },
  });

  // Utilitário para upload de arquivo simulado
  const FileUpload = ({ label, id }: { label: string; id: string }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group">
      <input type="file" id={id} className="hidden" />
      <div className="flex flex-col items-center gap-2">
        <div className="p-3 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
          <Upload size={24} className="text-gray-400 group-hover:text-blue-500" />
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{label}</span>
        <span className="text-xs text-gray-400">Clique para selecionar</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={enviar} className="space-y-6">
      
      {/* A) Dados Básicos do Veículo */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Car size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">A) Dados Básicos do Veículo</h3>
            <p className="text-xs text-gray-500">Informações principais de identificação</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field>
            <FieldLabel>Marca</FieldLabel>
            <Input
              value={valores.marca}
              onChange={(e) => mudar("marca", e.target.value)}
              placeholder="Ex: Toyota"
              required
            />
            {erros.marca && <FieldError>{erros.marca}</FieldError>}
          </Field>
          
          <Field>
            <FieldLabel>Modelo</FieldLabel>
            <Input
              value={valores.modelo}
              onChange={(e) => mudar("modelo", e.target.value)}
              placeholder="Ex: Corolla"
              required
            />
            {erros.modelo && <FieldError>{erros.modelo}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Ano de Fabrico</FieldLabel>
            <Input
              type="number"
              value={valores.ano}
              onChange={(e) => mudar("ano", parseInt(e.target.value))}
              required
            />
            {erros.ano && <FieldError>{erros.ano}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Cor</FieldLabel>
            <Input
              value={valores.cor}
              onChange={(e) => mudar("cor", e.target.value)}
              placeholder="Ex: Prata"
            />
          </Field>

          <Field>
            <FieldLabel>Categoria</FieldLabel>
            <Select 
              value={valores.categoria} 
              onValueChange={(val) => mudar("categoria", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economica">Econômica</SelectItem>
                <SelectItem value="conforto">Conforto</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="van">Van/Minivan</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Status Inicial</FieldLabel>
            <Select 
              value={valores.status} 
              onValueChange={(val) => mudar("status", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
                <SelectItem value="inativa">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* B) Informações Técnicas */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
          <div className="bg-gray-200 p-2 rounded-lg">
            <Settings size={20} className="text-gray-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">B) Informações Técnicas</h3>
            <p className="text-xs text-gray-500">Especificações técnicas e registro</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>Número de Chassi (VIN)</FieldLabel>
            <Input
              value={valores.numeroChassi}
              onChange={(e) => mudar("numeroChassi", e.target.value)}
              placeholder="XYZ123456789"
            />
          </Field>

          <Field>
            <FieldLabel>Número do Motor</FieldLabel>
            <Input
              value={valores.numeroMotor}
              onChange={(e) => mudar("numeroMotor", e.target.value)}
              placeholder="MOT12345"
            />
          </Field>

          <Field>
            <FieldLabel>Matrícula</FieldLabel>
            <Input
              value={valores.matricula}
              onChange={(e) => mudar("matricula", e.target.value)}
              placeholder="LD-00-00-AA"
              required
            />
            {erros.matricula && <FieldError>{erros.matricula}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Tipo de Combustível</FieldLabel>
            <Select 
              value={valores.tipoCombustivel} 
              onValueChange={(val) => mudar("tipoCombustivel", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasolina">Gasolina</SelectItem>
                <SelectItem value="gasoleo">Gasóleo (Diesel)</SelectItem>
                <SelectItem value="gpl">GPL</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
                <SelectItem value="eletrico">Elétrico</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Transmissão</FieldLabel>
            <Select 
              value={valores.transmissao} 
              onValueChange={(val) => mudar("transmissao", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatica">Automática</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* C) Estado e Condições */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <Activity size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">C) Estado e Condições</h3>
            <p className="text-xs text-gray-500">Histórico e estado atual de conservação</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field>
            <FieldLabel>Quilometragem Atual (km)</FieldLabel>
            <Input
              type="number"
              value={valores.quilometragemAtual}
              onChange={(e) => mudar("quilometragemAtual", parseInt(e.target.value))}
            />
          </Field>

          <Field>
            <FieldLabel>Estado Geral</FieldLabel>
            <Select 
              value={valores.estadoGeral} 
              onValueChange={(val) => mudar("estadoGeral", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="semi-novo">Semi-novo</SelectItem>
                <SelectItem value="usado">Usado</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Nível de Conservação</FieldLabel>
            <Select 
              value={valores.nivelConservacao} 
              onValueChange={(val) => mudar("nivelConservacao", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="otimo">Ótimo</SelectItem>
                <SelectItem value="bom">Bom</SelectItem>
                <SelectItem value="razoavel">Razoável</SelectItem>
                <SelectItem value="mau">Mau</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Última Revisão</FieldLabel>
            <Input
              type="date"
              value={valores.dataUltimaRevisao}
              onChange={(e) => mudar("dataUltimaRevisao", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Próxima Revisão Prevista</FieldLabel>
            <Input
              type="date"
              value={valores.dataProximaRevisao}
              onChange={(e) => mudar("dataProximaRevisao", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* D) Documentação */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <FileText size={20} className="text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">D) Documentação</h3>
            <p className="text-xs text-gray-500">Documentos legais, seguro e inspeções</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-2">Documento do Carro / Livreto (Upload)</label>
             <FileUpload label="Carregar Livreto (PDF/Foto)" id="file-livreto" />
          </div>
        </div>

        <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Seguro do Automóvel</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Field>
            <FieldLabel>Companhia de Seguro</FieldLabel>
            <Input
              value={valores.seguroCompanhia}
              onChange={(e) => mudar("seguroCompanhia", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Número da Apólice</FieldLabel>
            <Input
              value={valores.seguroNumeroApolice}
              onChange={(e) => mudar("seguroNumeroApolice", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Validade do Seguro</FieldLabel>
            <Input
              type="date"
              value={valores.seguroValidade}
              onChange={(e) => mudar("seguroValidade", e.target.value)}
            />
          </Field>
        </div>

        <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Inspeção Periódica</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Data da Última Inspeção</FieldLabel>
            <Input
              type="date"
              value={valores.inspecaoDataUltima}
              onChange={(e) => mudar("inspecaoDataUltima", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Validade da Inspeção</FieldLabel>
            <Input
              type="date"
              value={valores.inspecaoValidade}
              onChange={(e) => mudar("inspecaoValidade", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* E) Fotos */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Camera size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">E) Fotos</h3>
            <p className="text-xs text-gray-500">Galeria de imagens do veículo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fotos Externas</label>
              <FileUpload label="Frente, Traseira, Laterais" id="fotos-externas" />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fotos Internas</label>
              <FileUpload label="Painel, Bancos, Bagageira" id="fotos-internas" />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Motor</label>
              <FileUpload label="Motor" id="foto-motor" />
           </div>
        </div>
      </div>

      {/* F) Extras */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
          <div className="bg-teal-100 p-2 rounded-lg">
            <Plus size={20} className="text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">F) Extras & Equipamentos</h3>
            <p className="text-xs text-gray-500">Opcionais e itens de segurança</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-teal-500 transition-colors">
            <input 
              type="checkbox" 
              checked={valores.arCondicionado}
              onChange={(e) => mudar("arCondicionado", e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 mr-3"
            />
            <span className="text-sm font-medium text-gray-700">Ar Condicionado</span>
          </label>
          
          <label className="flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-teal-500 transition-colors">
            <input 
              type="checkbox" 
              checked={valores.possuiABS}
              onChange={(e) => mudar("possuiABS", e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 mr-3"
            />
            <span className="text-sm font-medium text-gray-700">Freios ABS</span>
          </label>

          <label className="flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-teal-500 transition-colors">
            <input 
              type="checkbox" 
              checked={valores.possuiAirbags}
              onChange={(e) => mudar("possuiAirbags", e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 mr-3"
            />
            <span className="text-sm font-medium text-gray-700">Airbags</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <Button 
          type="button" 
          variant="secondary"
          onClick={() => window.history.back()}
          className="px-6">
          Cancelar
        </Button>
        
        <Button 
          type="submit" 
          disabled={enviando}
          className="px-8 flex items-center gap-2">
          <CheckCircle size={18} />
          {enviando ? 'Processando...' : (editar ? 'Salvar Alterações' : 'Cadastrar Viatura')}
        </Button>
      </div>
    </form>
  );
};

export default FormularioCadastroViatura;
