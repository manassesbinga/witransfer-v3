import { toast } from 'sonner';

export function useNotification() {
    const sucesso = (mensagem: string) => {
        toast.success(mensagem);
    };

    const erro = (mensagem: string) => {
        toast.error(mensagem);
    };

    const aviso = (mensagem: string) => {
        toast(mensagem);
    };

    return {
        sucesso,
        erro,
        aviso,
    };
}
