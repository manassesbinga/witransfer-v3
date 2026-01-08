import {
    getMotoristasAction,
    createMotoristaAction,
    updateMotoristaAction,
    deleteMotoristaAction
} from '@/app/(private)/actions/motoristas/actions';
import { Motorista, MotoristaFormData } from '@/types/motorista';

const motoristasService = {
    async listar(): Promise<Motorista[]> {
        const response = await getMotoristasAction();
        if (!response.success) throw new Error(response.error);
        return response.data;
    },

    async buscarPorId(id: string): Promise<Motorista | undefined> {
        const motoristas = await this.listar();
        return motoristas.find(m => m.id === id);
    },

    async criar(dados: MotoristaFormData): Promise<Motorista> {
        const response = await createMotoristaAction(dados);
        if (!response.success) throw new Error(response.error);
        return response.data;
    },

    async atualizar(id: string, dados: Partial<MotoristaFormData>): Promise<void> {
        const response = await updateMotoristaAction(id, dados);
        if (!response.success) throw new Error(response.error);
    },

    async remover(id: string): Promise<void> {
        const response = await deleteMotoristaAction(id);
        if (!response.success) throw new Error(response.error);
    }
};

export default motoristasService;
