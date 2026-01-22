'use server';

import { supabase } from '@/lib/supabase';
import { unstable_cache, unstable_noStore as noStore } from 'next/cache';

export type CachedExtrasParams = {
    vehicleId?: string | null;
    partnerId?: string | null;
    role?: string | null;
};

/**
 * Funções de busca de dados do Supabase com CACHE real
 */

async function fetchVehicles() {
    console.log('🚗 [DB] Buscando veículos do Supabase...');
    const { data, error } = await supabase
        .from("vehicles")
        .select(`
            *,
            partners (
                id,
                name,
                avatar_url,
                address_province,
                address_city,
                address_street,
                status
            ),
            vehicle_classes (
                id,
                name,
                icon
            )
        `);

    if (error) {
        console.error('❌ [DB] Erro ao buscar veículos:', error);
        return [];
    }

    const allVehicles = data || [];
    // Filtramos por status do veículo E status do parceiro (não permitir parceiros pendentes)
    return allVehicles.filter(v =>
        ["available", "ativa", "active"].includes(v.status?.toLowerCase()) &&
        v.partners?.status !== "pending"
    );
}

export const getCachedVehicles = unstable_cache(
    async () => fetchVehicles(),
    ['vehicles-list'],
    { revalidate: 3600, tags: ['vehicles'] }
);

async function fetchVehicleClasses() {
    console.log('📁 [DB] Buscando classes de veículos...');
    const { data, error } = await supabase.from("vehicle_classes").select("*");
    if (error) return [];
    return data || [];
}

export const getCachedVehicleClasses = unstable_cache(
    async () => fetchVehicleClasses(),
    ['vehicle-classes'],
    { revalidate: 3600, tags: ['classes'] }
);

export async function getCachedExtras(params?: CachedExtrasParams) {
    // Para simplificar a performance na pesquisa, buscamos todos os extras e cacheamos.
    // O filtro por parceiro/veículo deve ser feito em memória no cálculo.
    return fetchAllExtrasCached();
}

const fetchAllExtrasCached = unstable_cache(
    async () => {
        console.log('🎁 [DB] Buscando todos os extras...');
        const { data, error } = await supabase.from("extras").select("*");
        return data || [];
    },
    ['all-extras'],
    { revalidate: 3600, tags: ['extras'] }
);

async function fetchServices() {
    console.log('🔧 [DB] Buscando serviços...');
    const { data, error } = await supabase.from("services").select("*");
    return data || [];
}

export const getCachedServices = unstable_cache(
    async () => fetchServices(),
    ['all-services'],
    { revalidate: 3600, tags: ['services'] }
);

async function fetchClassPrices() {
    const { data, error } = await supabase.from("service_class_prices").select("*");
    return data || [];
}

export const getCachedClassPrices = unstable_cache(
    async () => fetchClassPrices(),
    ['class-prices'],
    { revalidate: 3600, tags: ['prices'] }
);

async function fetchVehiclePrices() {
    const { data, error } = await supabase.from("vehicle_service_prices").select("*");
    return data || [];
}

export const getCachedVehiclePrices = unstable_cache(
    async () => fetchVehiclePrices(),
    ['vehicle-prices'],
    { revalidate: 3600, tags: ['prices'] }
);

/**
 * Busca veículos que possuem reservas confirmadas ou pendentes que conflitam com o período solicitado.
 * @param startTime ISO string do início do período
 * @param endTime ISO string do fim do período
 */
export async function getConflictingBookings(startTime: string, endTime: string) {
    noStore();
    console.log(`📡 [CACHE] Buscando conflitos entre ${startTime} e ${endTime}...`);

    const { data, error } = await supabase
        .from("bookings")
        .select("vehicle_id")
        .not("status", "eq", "canceled")
        .not("vehicle_id", "is", null)
        .lt("start_time", endTime)
        .gt("end_time", startTime);

    if (error) {
        console.error('❌ [CACHE] Erro ao verificar disponibilidade de veículos:', error);
        return [];
    }

    const vehicleIds = data.map(b => b.vehicle_id).filter(Boolean);
    console.log(`🚫 [CACHE] ${vehicleIds.length} veículos ocupados neste período.`);
    return vehicleIds;
}
