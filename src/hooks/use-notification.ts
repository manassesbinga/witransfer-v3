import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
    duration?: number;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Hook reutilizável para exibir notificações (toasts)
 * Padroniza o uso de mensagens em toda a aplicação
 */
export function useNotification() {
    /**
     * Exibe mensagem de sucesso
     */
    const sucesso = (mensagem: string, options?: NotificationOptions) => {
        toast.success(mensagem, {
            description: options?.description,
            duration: options?.duration || 3000,
            action: options?.action,
        });
    };

    /**
     * Exibe mensagem de erro
     */
    const erro = (mensagem: string, options?: NotificationOptions) => {
        toast.error(mensagem, {
            description: options?.description,
            duration: options?.duration || 4000,
            action: options?.action,
        });
    };

    /**
     * Exibe mensagem de aviso/alerta
     */
    const aviso = (mensagem: string, options?: NotificationOptions) => {
        toast.warning(mensagem, {
            description: options?.description,
            duration: options?.duration || 3000,
            action: options?.action,
        });
    };

    /**
     * Exibe mensagem informativa
     */
    const info = (mensagem: string, options?: NotificationOptions) => {
        toast.info(mensagem, {
            description: options?.description,
            duration: options?.duration || 3000,
            action: options?.action,
        });
    };

    /**
     * Exibe mensagem genérica
     */
    const mostrar = (mensagem: string, tipo: NotificationType = 'info', options?: NotificationOptions) => {
        switch (tipo) {
            case 'success':
                sucesso(mensagem, options);
                break;
            case 'error':
                erro(mensagem, options);
                break;
            case 'warning':
                aviso(mensagem, options);
                break;
            case 'info':
            default:
                info(mensagem, options);
                break;
        }
    };

    /**
     * Trata resultado de ação assíncrona com mensagens padronizadas
     */
    const tratarResultado = (
        resultado: { success?: boolean; error?: string; message?: string },
        mensagemSucesso?: string,
        mensagemErro?: string
    ) => {
        if (resultado.success || !resultado.error) {
            sucesso(mensagemSucesso || resultado.message || 'Operação concluída com sucesso!');
            return true;
        } else {
            erro(mensagemErro || resultado.error || 'Ocorreu um erro inesperado.');
            return false;
        }
    };

    return {
        sucesso,
        erro,
        aviso,
        info,
        mostrar,
        tratarResultado,
    };
}
