export type StatusMotorista = "online" | "offline" | "disponivel" | "ocupado" | "suspenso";

export interface Motorista {
    id: string;
    nome: string;
    nomeApelido?: string;
    dataNascimento: string;
    sexo?: "Masculino" | "Feminino" | "Outro";
    nacionalidade?: string;
    nif?: string;
    numeroDocumento: string;
    endereco?: string;
    cidade?: string;
    provincia?: string;
    telefone: string;
    telefoneAlternativo?: string;
    email: string;
    fotoPerfil?: string;

    // Documentação
    cartaConducao: string;
    dataEmissaoCarta?: string;
    dataValidadeCarta?: string;
    cartaProfissional: boolean;

    // Profissional
    experienciaAnos?: number;
    idiomasFalados: string[];
    disponibilidade: "Ativo" | "Inativo" | "Férias";
    dataInicio: string;
    turno?: string;
    viaturaId?: string;
    viaturaModelo?: string;
    status: StatusMotorista;

    // Performance
    numeroViagens: number;
    pontuacao: number;
    avaliacao?: number;
    ganhoTotal: number;

    // Observações
    notasInternas?: string;
    comportamento?: string;
    recomendacoes?: string;
    restricoesMedicas?: string;

    companyId: string;
    createdAt: string;
}

export interface MotoristaFormData extends Omit<Partial<Motorista>, "id" | "numeroViagens" | "pontuacao" | "ganhoTotal" | "createdAt"> {
    nome: string;
    email: string;
    telefone: string;
    numeroDocumento: string;
    cartaConducao: string;
    dataNascimento: string;
    dataInicio: string;
}
