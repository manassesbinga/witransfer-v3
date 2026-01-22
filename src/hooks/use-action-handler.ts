import { useState, useCallback } from "react";
import { useNotification } from "./use-notification";

export interface ActionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ActionHandlerOptions {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data?: any) => void;
    onError?: (error: string) => void;
    showNotifications?: boolean;
}

/**
 * Hook reutilizável para padronizar o tratamento de ações assíncronas
 * Gerencia loading, erros e mensagens de forma consistente
 */
export function useActionHandler() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { tratarResultado, sucesso, erro } = useNotification();

    /**
     * Executa uma ação assíncrona com tratamento padronizado
     */
    const execute = useCallback(
        async <T = any>(
            action: () => Promise<ActionResult<T>>,
            options: ActionHandlerOptions = {}
        ): Promise<T | null> => {
            const {
                successMessage,
                errorMessage,
                onSuccess,
                onError,
                showNotifications = true,
            } = options;

            setLoading(true);
            setError(null);

            try {
                const resultado = await action();

                if (resultado.success || !resultado.error) {
                    if (showNotifications) {
                        if (successMessage) {
                            sucesso(successMessage);
                        } else {
                            tratarResultado(resultado, successMessage, errorMessage);
                        }
                    }

                    onSuccess?.(resultado.data);
                    return resultado.data || null;
                } else {
                    const errorMsg = errorMessage || resultado.error || "Ocorreu um erro inesperado.";
                    setError(errorMsg);

                    if (showNotifications) {
                        erro(errorMsg);
                    }

                    onError?.(errorMsg);
                    return null;
                }
            } catch (err: any) {
                const errorMsg = errorMessage || err.message || "Erro técnico inesperado.";
                setError(errorMsg);

                if (showNotifications) {
                    erro(errorMsg);
                }

                onError?.(errorMsg);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [tratarResultado, sucesso, erro]
    );

    /**
     * Executa ação sem exibir notificações (apenas gerencia estado)
     */
    const executeSilent = useCallback(
        async <T = any>(
            action: () => Promise<ActionResult<T>>,
            options: Omit<ActionHandlerOptions, "showNotifications"> = {}
        ): Promise<T | null> => {
            return execute(action, { ...options, showNotifications: false });
        },
        [execute]
    );

    /**
     * Limpa o estado de erro
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        execute,
        executeSilent,
        loading,
        error,
        clearError,
    };
}


