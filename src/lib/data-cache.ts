/** @format */

type CacheEntry<T> = {
    data: T[];
    tags: string[];
    lastFetched: number;
};

class DataCache {
    private cache: Record<string, CacheEntry<any>> = {};

    /**
     * Obtém dados do cache para uma chave específica
     */
    get<T>(key: string): T[] | null {
        return this.cache[key] ? this.cache[key].data : null;
    }

    /**
     * Salva dados no cache com lógica de substituição de duplicados por ID
     */
    set<T extends { id?: string | number }>(
        key: string,
        newData: T[],
        tags: string[] = [],
        replace: boolean = false
    ) {
        if (!this.cache[key] || replace) {
            this.cache[key] = { data: [], tags, lastFetched: Date.now() };
        }

        const currentEntry = this.cache[key];
        // If replace is true, mergedData starts empty. Otherwise it starts with current data.
        const mergedData = replace ? [] : [...currentEntry.data];

        if (newData.length > 0) {
            newData.forEach((item) => {
                if (item.id) {
                    const index = mergedData.findIndex((m) => m.id === item.id);
                    if (index !== -1) {
                        // Substitui o existente para evitar duplicados
                        mergedData[index] = { ...mergedData[index], ...item };
                    } else {
                        // Adiciona novo
                        mergedData.push(item);
                    }
                } else {
                    // Se não tiver ID (improvável para entidades), apenas adiciona
                    mergedData.push(item);
                }
            });
        }

        this.cache[key] = {
            data: mergedData,
            tags: Array.from(new Set([...currentEntry.tags, ...tags])),
            lastFetched: Date.now(),
        };

        console.log(`[Cache] Dados atualizados para chave: ${key}. Total anterior: ${currentEntry.data.length}, Novo total: ${mergedData.length}`);
    }

    /**
     * Limpa o cache para uma chave ou tags específicas
     */
    invalidate(key?: string, tags: string[] = []) {
        if (key) {
            delete this.cache[key];
        }

        if (tags.length > 0) {
            Object.keys(this.cache).forEach((k) => {
                if (this.cache[k].tags.some((t) => tags.includes(t))) {
                    delete this.cache[k];
                }
            });
        }
    }
}

export const globalDataCache = new DataCache();
