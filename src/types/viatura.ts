export type StatusViatura = "ativa" | "inativa" | "manutencao" | "inspecao";

export interface Viatura {
    id: string;
    marca: string;
    modelo: string;
    ano: number;
    cor: string;
    categoria: string;
    matricula: string;
    status: StatusViatura;

    // Informações Técnicas
    numeroChassi?: string;
    numeroMotor?: string;
    tipoCombustivel?: string;
    transmissao?: string;
    potencia?: string;
    cilindrada?: string;

    // Estado e Condições
    quilometragemAtual: number;
    kilometragem: number; // compatibilidade
    estadoGeral?: string;
    nivelConservacao?: string;
    dataUltimaRevisao?: string;
    dataProximaRevisao?: string;

    // Documentação
    seguroCompanhia?: string;
    seguroNumeroApolice?: string;
    seguroValidade?: string;
    inspecaoDataUltima?: string;
    inspecaoValidade?: string;

    // Extras
    lugares: number;
    arCondicionado: boolean;
    possuiABS?: boolean;
    possuiAirbags?: boolean;

    motoristaId?: string;
    motoristanome?: string;

    companyId?: string;
    createdAt?: string;
}

export interface ViaturaFormData extends Omit<Partial<Viatura>, "id" | "createdAt"> {
    marca: string;
    modelo: string;
    matricula: string;
}
