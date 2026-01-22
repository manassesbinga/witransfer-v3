/** @format */

import { useState, useCallback, useEffect } from "react";
import { globalDataCache } from "@/lib/data-cache";
import { toast } from "sonner";

interface UsePaginatedQueryOptions<T> {
    key: string;
    fetchAction: (page: number, limit: number, ...args: any[]) => Promise<any>;
    limit?: number;
    initialData?: T[];
    tags?: string[];
    args?: any[];
}

/**
 * Hook para busca de dados paginados com cache e deduplicação automática.
 * Segue a lógica de "pacotes" e substituição de duplicados solicitada.
 */
export function usePaginatedQuery<T extends { id?: string | number }>(options: UsePaginatedQueryOptions<T>) {
    const { key, fetchAction, limit = 10, initialData = [], tags = [], args = [] } = options;

    const [data, setData] = useState<T[]>(() => {
        const cached = globalDataCache.get<T>(key);
        return cached && cached.length > 0 ? cached : initialData;
    });

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Sincroniza estado inicial sempre que initialData mudar (importante para router.refresh)
    useEffect(() => {
        if (initialData) {
            console.log(`[Query] Syncing ${key} with new initialData (${initialData.length} items)`);
            // Se o initialData veio do servidor, ele deve prevalecer sobre o cache local da primeira página
            // Mesmo que seja um array vazio (ex: tudo foi para waitlist e sumiu para o parceiro)
            globalDataCache.set(key, initialData, tags, true);
            setData(initialData);
            setPage(1);
            // Se o initialData veio do servidor e é menor que o limite, não há mais para carregar
            setHasMore(initialData.length === limit);
        }
    }, [initialData, key, tags, limit]);

    // Sincroniza estado com o cache global inicial se houver
    useEffect(() => {
        const cached = globalDataCache.get<T>(key);
        if (cached && cached.length > 0) {
            setData(cached);
        }
    }, [key]);

    const loadMore = useCallback(async (isInitial = false) => {
        if (loading || (!hasMore && !isInitial)) return;

        setLoading(true);
        const nextPage = isInitial ? 1 : page + 1;

        try {
            console.log(`[Query] Buscando pacote ${nextPage} para ${key}...`);
            const result = await fetchAction(nextPage, limit, ...args);

            if (result.success && Array.isArray(result.data)) {
                const newBatch = result.data;

                // Salva no cache global (trata deduplicação e substituição)
                // Se for isInitial (refresh), substitui o cache existente
                globalDataCache.set(key, newBatch, tags, isInitial);

                // Atualiza estado local a partir do cache para refletir merge
                const updatedData = globalDataCache.get<T>(key) || [];
                setData(updatedData);

                setPage(nextPage);
                setHasMore(newBatch.length === limit);
            } else if (result.success) {
                setHasMore(false);
            } else {
                toast.error(result.error || "Erro ao carregar mais dados.");
            }
        } catch (error) {
            console.error(`[Query Error] ${key}:`, error);
            toast.error("Erro técnico ao buscar dados.");
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, limit, fetchAction, key, tags, args]);

    const refresh = useCallback(async () => {
        setHasMore(true);
        await loadMore(true);
    }, [loadMore]);

    return {
        data,
        loading,
        hasMore,
        loadMore,
        refresh,
        page
    };
}
