import { useState, useCallback, FormEvent } from 'react';

interface UseFormProps<T> {
    valorInicial: T;
    onSubmit: (dados: T) => Promise<void>;
}

export function useForm<T>({ valorInicial, onSubmit }: UseFormProps<T>) {
    const [valores, setValores] = useState<T>(valorInicial);
    const [erros, setErros] = useState<Partial<Record<keyof T, string>>>({});
    const [enviando, setEnviando] = useState(false);

    const mudar = useCallback((chave: keyof T, valor: any) => {
        setValores((prev) => ({ ...prev, [chave]: valor }));
        // Limpar erro ao mudar
        setErros((prev) => {
            const novo = { ...prev };
            delete novo[chave];
            return novo;
        });
    }, []);

    const definirErro = useCallback((chave: keyof T, mensagem: string) => {
        setErros((prev) => ({ ...prev, [chave]: mensagem }));
    }, []);

    const enviar = async (e: FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        try {
            await onSubmit(valores);
        } catch (error) {
            console.error(error);
        } finally {
            setEnviando(false);
        }
    };

    return {
        valores,
        erros,
        enviando,
        mudar,
        definirErro,
        enviar,
    };
}
