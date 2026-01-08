/** @format */

"use client";

import React, { useState } from "react";
import { useForm } from "@/hooks/use-form";
import { useNotification } from "@/hooks/use-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldContent,
} from "@/components/ui/field";
import motoristasService from "@/services/motoristasService";
import { MotoristaFormData, Motorista } from "@/types/motorista";
import {
  validarEmail,
  validarTelefone,
  validarData,
  validarDocumentoAngola,
  validarCartaConducao,
} from "@/lib/validators";
import {
  User,
  FileText,
  Briefcase,
  MessageSquare,
  Upload,
  X,
  CheckCircle,
} from "lucide-react";

interface FormularioCadastroMotoristaProps {
  motoristaId?: string;
  onSucesso?: () => void;
  editar?: boolean;
  dadosIniciais?: Partial<Motorista>;
}

const FormularioCadastroMotorista: React.FC<
  FormularioCadastroMotoristaProps
> = ({ motoristaId, onSucesso, editar = false, dadosIniciais }) => {
  const { sucesso, erro } = useNotification();
  const [idiomaSelecionado, setIdiomaSelecionado] = useState("");

  const formDataInicial: MotoristaFormData = {
    // A) Dados Pessoais
    nome: dadosIniciais?.nome || "",
    nomeApelido: dadosIniciais?.nomeApelido || "",
    dataNascimento: dadosIniciais?.dataNascimento || "",
    sexo: dadosIniciais?.sexo || undefined,
    nacionalidade: dadosIniciais?.nacionalidade || "",
    nif: dadosIniciais?.nif || "",
    numeroDocumento: dadosIniciais?.numeroDocumento || "",
    endereco: dadosIniciais?.endereco || "",
    cidade: dadosIniciais?.cidade || "",
    provincia: dadosIniciais?.provincia || "",
    telefone: dadosIniciais?.telefone || "",
    telefoneAlternativo: dadosIniciais?.telefoneAlternativo || "",
    email: dadosIniciais?.email || "",

    // B) Documentação
    cartaConducao: dadosIniciais?.cartaConducao || "",
    dataEmissaoCarta: dadosIniciais?.dataEmissaoCarta || "",
    dataValidadeCarta: dadosIniciais?.dataValidadeCarta || "",
    cartaProfissional: dadosIniciais?.cartaProfissional || false,

    // C) Informações Profissionais
    experienciaAnos: dadosIniciais?.experienciaAnos || undefined,
    idiomasFalados: dadosIniciais?.idiomasFalados || [],
    disponibilidade: dadosIniciais?.disponibilidade || "Ativo",
    dataInicio: dadosIniciais?.dataInicio || "",
    viaturaId: dadosIniciais?.viaturaId || "",
    status: dadosIniciais?.status || "offline",

    // G) Observações
    notasInternas: dadosIniciais?.notasInternas || "",
    comportamento: dadosIniciais?.comportamento || "",
    recomendacoes: dadosIniciais?.recomendacoes || "",
    restricoesMedicas: dadosIniciais?.restricoesMedicas || "",
  };

  const { valores, erros, enviando, mudar, definirErro, enviar } = useForm({
    valorInicial: formDataInicial,
    onSubmit: async (dados: MotoristaFormData) => {
      // Validações
      if (!dados.nome || dados.nome.length < 3) {
        definirErro("nome", "Nome deve ter pelo menos 3 caracteres");
        return;
      }

      if (!validarEmail(dados.email)) {
        definirErro("email", "E-mail inválido");
        return;
      }

      if (!validarTelefone(dados.telefone)) {
        definirErro("telefone", "Telefone deve conter 9 dígitos");
        return;
      }

      if (!validarData(dados.dataNascimento)) {
        definirErro("dataNascimento", "Data inválida");
        return;
      }

      if (!validarDocumentoAngola(dados.numeroDocumento)) {
        definirErro("numeroDocumento", "Documento inválido");
        return;
      }

      if (!validarCartaConducao(dados.cartaConducao)) {
        definirErro("cartaConducao", "Carta de condução inválida");
        return;
      }

      if (!validarData(dados.dataInicio)) {
        definirErro("dataInicio", "Data de início inválida");
        return;
      }

      try {
        if (editar && motoristaId) {
          await motoristasService.atualizar(motoristaId, dados);
          sucesso("Motorista atualizado com sucesso");
        } else {
          await motoristasService.criar(dados);
          sucesso("Motorista criado com sucesso");
        }
        onSucesso?.();
      } catch (erroCapturado: any) {
        erro(erroCapturado.message || "Erro ao salvar motorista");
      }
    },
  });

  const adicionarIdioma = () => {
    if (
      idiomaSelecionado &&
      !valores.idiomasFalados?.includes(idiomaSelecionado)
    ) {
      mudar("idiomasFalados", [
        ...(valores.idiomasFalados || []),
        idiomaSelecionado,
      ]);
      setIdiomaSelecionado("");
    }
  };

  const removerIdioma = (idioma: string) => {
    mudar(
      "idiomasFalados",
      valores.idiomasFalados?.filter((i: string) => i !== idioma) || []
    );
  };

  return (
    <form onSubmit={enviar} className="space-y-8">
      {/* A) DADOS PESSOAIS */}
      <div className="from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <User size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">A) Dados Pessoais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>Nome Completo *</FieldLabel>
            <Input
              value={valores.nome}
              onChange={(e) => mudar("nome", e.target.value)}
              placeholder="João Manuel da Silva"
              required
              className="rounded-xl border-slate-200"
            />
            {erros.nome && <FieldError>{erros.nome}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Nome Curto / Apelido</FieldLabel>
            <Input
              value={valores.nomeApelido || ""}
              onChange={(e) => mudar("nomeApelido", e.target.value)}
              placeholder="João"
              className="rounded-xl border-slate-200"
            />
          </Field>

          <Field>
            <FieldLabel>Data de Nascimento *</FieldLabel>
            <Input
              type="date"
              value={valores.dataNascimento}
              onChange={(e) => mudar("dataNascimento", e.target.value)}
              required
              className="rounded-xl border-slate-200"
            />
            {erros.dataNascimento && (
              <FieldError>{erros.dataNascimento}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Sexo</FieldLabel>
            <Select
              value={valores.sexo || undefined}
              onValueChange={(v) => mudar("sexo", v)}>
              <SelectTrigger className="rounded-xl border-slate-200 h-11 w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Nacionalidade</FieldLabel>
            <Input
              value={valores.nacionalidade || ""}
              onChange={(e) => mudar("nacionalidade", e.target.value)}
              placeholder="Angolana"
              className="rounded-xl border-slate-200"
            />
          </Field>

          <Field>
            <FieldLabel>NIF</FieldLabel>
            <Input
              value={valores.nif || ""}
              onChange={(e) => mudar("nif", e.target.value)}
              placeholder="000000000"
              className="rounded-xl border-slate-200"
            />
          </Field>

          <Field>
            <FieldLabel>Número do Documento (BI) *</FieldLabel>
            <Input
              value={valores.numeroDocumento}
              onChange={(e) => mudar("numeroDocumento", e.target.value)}
              placeholder="000000000LA000"
              required
              className="rounded-xl border-slate-200"
            />
            {erros.numeroDocumento && (
              <FieldError>{erros.numeroDocumento}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Endereço</FieldLabel>
            <Input
              value={valores.endereco || ""}
              onChange={(e) => mudar("endereco", e.target.value)}
              placeholder="Rua, Bairro"
              className="rounded-xl border-slate-200"
            />
          </Field>

          <Field>
            <FieldLabel>Cidade</FieldLabel>
            <Input
              value={valores.cidade || ""}
              onChange={(e) => mudar("cidade", e.target.value)}
              placeholder="Luanda"
              className="rounded-xl border-slate-200"
            />
          </Field>

          <Field>
            <FieldLabel>Província</FieldLabel>
            <Input
              value={valores.provincia || ""}
              onChange={(e) => mudar("provincia", e.target.value)}
              placeholder="Luanda"
              className="rounded-xl border-slate-200"
            />
          </Field>

          <Field>
            <FieldLabel>Telefone Principal *</FieldLabel>
            <Input
              value={valores.telefone}
              onChange={(e) => mudar("telefone", e.target.value)}
              placeholder="923456789"
              required
              className="rounded-xl border-slate-200"
            />
            <p className="text-[10px] text-slate-400 font-medium ml-1">
              9 dígitos
            </p>
            {erros.telefone && <FieldError>{erros.telefone}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Telefone Alternativo</FieldLabel>
            <Input
              value={valores.telefoneAlternativo || ""}
              onChange={(e) => mudar("telefoneAlternativo", e.target.value)}
              placeholder="923456789"
              className="rounded-xl border-slate-200"
            />
          </Field>

          <Field>
            <FieldLabel>Email *</FieldLabel>
            <Input
              type="email"
              value={valores.email}
              onChange={(e) => mudar("email", e.target.value)}
              placeholder="motorista@exemplo.com"
              required
              className="rounded-xl border-slate-200"
            />
            {erros.email && <FieldError>{erros.email}</FieldError>}
          </Field>
        </div>

        {/* Upload Foto */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto do Motorista
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-600">
              Clique para fazer upload ou arraste a foto
            </p>
            <input type="file" className="hidden" accept="image/*" />
          </div>
        </div>
      </div>

      {/* B) DOCUMENTAÇÃO DO MOTORISTA */}
      <div className="from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-600 p-2 rounded-lg">
            <FileText size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            B) Documentação do Motorista
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>Número da Carta de Condução *</FieldLabel>
            <Input
              value={valores.cartaConducao}
              onChange={(e) => mudar("cartaConducao", e.target.value)}
              placeholder="000000000"
              required
              className="rounded-xl border-slate-200"
            />
            {erros.cartaConducao && (
              <FieldError>{erros.cartaConducao}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Data de Emissão da Carta</FieldLabel>
            <Input
              type="date"
              value={valores.dataEmissaoCarta || ""}
              onChange={(e) => mudar("dataEmissaoCarta", e.target.value)}
              className="rounded-xl border-slate-200"
            />
          </Field>

          <Field>
            <FieldLabel>Data de Validade da Carta</FieldLabel>
            <Input
              type="date"
              value={valores.dataValidadeCarta || ""}
              onChange={(e) => mudar("dataValidadeCarta", e.target.value)}
              className="rounded-xl border-slate-200"
            />
          </Field>

          <div className="flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              id="cartaProfissional"
              checked={valores.cartaProfissional || false}
              onChange={(e) => mudar("cartaProfissional", e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
            />
            <label
              htmlFor="cartaProfissional"
              className="text-sm font-bold text-slate-700">
              Possui Carta Profissional
            </label>
          </div>
        </div>

        {/* Upload de Documentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto do BI
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-1" size={24} />
              <p className="text-xs text-gray-600">Upload BI</p>
              <input type="file" className="hidden" accept="image/*" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto da Carta
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-1" size={24} />
              <p className="text-xs text-gray-600">Upload Carta</p>
              <input type="file" className="hidden" accept="image/*" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registo Criminal (opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-1" size={24} />
              <p className="text-xs text-gray-600">Upload Documento</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Atestado Médico (opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-1" size={24} />
              <p className="text-xs text-gray-600">Upload Atestado</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* C) INFORMAÇÕES PROFISSIONAIS */}
      <div className=" from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-600 p-2 rounded-lg">
            <Briefcase size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            C) Informações Profissionais
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>Experiência (anos de condução)</FieldLabel>
            <Input
              type="text"
              inputMode="numeric"
              value={valores.experienciaAnos?.toString() || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                mudar("experienciaAnos", parseInt(val) || 0);
              }}
              placeholder="5"
              className="rounded-xl border-slate-200"
            />
          </Field>

          <Field>
            <FieldLabel>Data de Início *</FieldLabel>
            <Input
              type="date"
              value={valores.dataInicio}
              onChange={(e) => mudar("dataInicio", e.target.value)}
              required
              className="rounded-xl border-slate-200"
            />
            {erros.dataInicio && <FieldError>{erros.dataInicio}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Disponibilidade *</FieldLabel>
            <Select
              value={valores.disponibilidade || undefined}
              onValueChange={(v) => mudar("disponibilidade", v)}>
              <SelectTrigger className="rounded-xl border-slate-200 h-11 w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Férias">Férias</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Status *</FieldLabel>
            <Select
              value={valores.status || undefined}
              onValueChange={(v) => mudar("status", v)}>
              <SelectTrigger className="rounded-xl border-slate-200 h-11 w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="ocupado">Ocupado</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="hidden">
            {/* Turno removido conforme solicitado */}
          </div>
        </div>

        {/* Idiomas Falados */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Idiomas Falados
          </label>
          <div className="flex gap-2 mb-3">
            <Select
              value={idiomaSelecionado || undefined}
              onValueChange={(v) => setIdiomaSelecionado(v)}>
              <SelectTrigger className="flex-1 rounded-xl border-slate-200 h-11 w-full">
                <SelectValue placeholder="Selecione um idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Português">Português</SelectItem>
                <SelectItem value="Inglês">Inglês</SelectItem>
                <SelectItem value="Francês">Francês</SelectItem>
                <SelectItem value="Espanhol">Espanhol</SelectItem>
                <SelectItem value="Kimbundu">Kimbundu</SelectItem>
                <SelectItem value="Umbundu">Umbundu</SelectItem>
                <SelectItem value="Kikongo">Kikongo</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={adicionarIdioma}
              variant="outline"
              className="px-6 h-11 rounded-xl border-slate-200 font-bold">
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {valores.idiomasFalados?.map((idioma: string) => (
              <div
                key={idioma}
                className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                <span>{idioma}</span>
                <button
                  type="button"
                  onClick={() => removerIdioma(idioma)}
                  className="hover:text-green-900 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* G) OBSERVAÇÕES */}
      <div className=" from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-600 p-2 rounded-lg">
            <MessageSquare size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">G) Observações</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Internas
            </label>
            <textarea
              value={valores.notasInternas || ""}
              onChange={(e) => mudar("notasInternas", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Informações internas sobre o motorista..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comportamento
            </label>
            <textarea
              value={valores.comportamento || ""}
              onChange={(e) => mudar("comportamento", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Observações sobre o comportamento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recomendações
            </label>
            <textarea
              value={valores.recomendacoes || ""}
              onChange={(e) => mudar("recomendacoes", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Recomendações e sugestões..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restrições Médicas
            </label>
            <textarea
              value={valores.restricoesMedicas || ""}
              onChange={(e) => mudar("restricoesMedicas", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Restrições médicas, se houver..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={enviando}
          className="flex items-center justify-center gap-2 flex-1 h-12 rounded-xl font-black text-lg shadow-lg shadow-primary/20">
          {enviando ? (
            "Salvando..."
          ) : (
            <>
              <CheckCircle size={20} />
              {editar ? "Atualizar" : "Criar"} Motorista
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormularioCadastroMotorista;
