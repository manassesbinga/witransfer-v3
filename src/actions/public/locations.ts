"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";
import { supabase } from "@/lib/supabase";
import { orsGeocode, orsReverseGeocode } from "@/lib/ors";

function normalize(s: string) {
  if (!s) return "";
  return s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Busca sugestões de localidades em tempo real usando a API gratuita do OpenStreetMap (Nominatim).
 * Agora executada diretamente no Server Action para evitar latência de HTTP interno.
 */
export async function getLocalitySuggestions(curr: string) {
  return createPublicAction(
    "GetLocalitySuggestions",
    async (query: string) => {
      if (!query || query.length < 2) return [];

      const normalizedQuery = normalize(query);

      try {
        const EXTERNAL_TIMEOUT = 800; // AGGRESSIVE: 800ms máximo para garantir < 2s total

        const fetchWithTimeout = async (url: string, options: any = {}) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT);
          try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            return response;
          } finally {
            clearTimeout(id);
          }
        };

        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=3&countrycodes=ao&accept-language=pt`;

        const [nominatimRes, partnerLocations, orsRes] = await Promise.allSettled([
          fetchWithTimeout(nominatimUrl, {
            headers: { "User-Agent": "WiTransfer-App" },
            cache: 'force-cache',
            next: { revalidate: 3600 }
          }).then(r => r.ok ? r.json() : []).catch(() => []),
          supabase
            .from("partners")
            .select("address_province, address_city")
            .filter("status", "eq", "active")
            .limit(20),
          orsGeocode(query).catch(() => [])
        ]);

        const suggestions = new Map<string, any>();

        // 1. Partner locations (Priority)
        if (partnerLocations.status === 'fulfilled' && partnerLocations.value.data) {
          partnerLocations.value.data.forEach((p: any) => {
            const prov = p.address_province;
            const city = p.address_city;
            if (prov && normalize(prov).includes(normalizedQuery)) {
              const label = `${prov}, Angola`;
              if (!suggestions.has(label)) suggestions.set(label, { label, score: 100 });
            }
            if (city && normalize(city).includes(normalizedQuery)) {
              const label = `${city}, ${prov || "Angola"}`;
              if (!suggestions.has(label)) suggestions.set(label, { label, score: 90 });
            }
          });
        }

        // FAST PATH: Se já temos 5+ sugestões de parceiros, retornar imediatamente
        if (suggestions.size >= 5) {
          return Array.from(suggestions.values())
            .sort((a, b) => b.score - a.score)
            .map(s => s.label)
            .slice(0, 10);
        }

        // 2. ORS Results (simplificados)
        if (orsRes.status === 'fulfilled' && Array.isArray(orsRes.value)) {
          orsRes.value.slice(0, 5).forEach((item: any) => {
            // Simplificar label do ORS
            let cleanLabel = item.label;
            // Se tiver vírgulas, pegar apenas primeiras 2-3 partes
            const parts = cleanLabel.split(',').map((p: string) => p.trim());
            if (parts.length > 3) {
              cleanLabel = parts.slice(0, 3).join(', ');
            }
            if (!suggestions.has(cleanLabel)) {
              suggestions.set(cleanLabel, { label: cleanLabel, score: 80 });
            }
          });
        }

        // 3. Nominatim Results (simplificados)
        if (nominatimRes.status === 'fulfilled' && Array.isArray(nominatimRes.value)) {
          nominatimRes.value.forEach((item: any) => {
            const addr = item.address || {};
            let cleanLabel = "";

            // Priorizar: cidade > município > província
            if (addr.city || addr.town || addr.village) {
              const cityName = addr.city || addr.town || addr.village;
              const provName = addr.state || addr.province || "";
              cleanLabel = provName ? `${cityName}, ${provName}` : cityName;
            } else if (addr.state || addr.province) {
              cleanLabel = `${addr.state || addr.province}, Angola`;
            } else if (addr.road) {
              const suburb = addr.suburb || addr.neighbourhood || "";
              cleanLabel = suburb ? `${addr.road}, ${suburb}` : addr.road;
            } else {
              // Fallback: simplificar display_name
              const parts = item.display_name.split(',').map((p: string) => p.trim());
              cleanLabel = parts.slice(0, 3).join(', ');
            }

            // Evitar duplicatas e labels muito longos
            if (cleanLabel && cleanLabel.length < 60 && !suggestions.has(cleanLabel)) {
              suggestions.set(cleanLabel, { label: cleanLabel, score: 70 });
            }
          });
        }

        // Sort and slice
        return Array.from(suggestions.values())
          .sort((a, b) => b.score - a.score)
          .map(s => s.label)
          .slice(0, 10);

      } catch (error) {
        console.error("Location Search Error:", error);
        return [];
      }
    },
    curr,
  );
}

/**
 * Obtém detalhes de endereço estruturados a partir de coordenadas (Reverse Geocoding).
 * Usa OpenRouteService via Server-Side para proteger chaves e garantir consistência.
 */
export async function getAddressFromCoordinates(lat: number, lng: number) {
  return createPublicAction(
    "GetAddressFromCoordinates",
    async ({ lat, lng }: { lat: number; lng: number }) => {
      if (!lat || !lng) return null;

      const result = await orsReverseGeocode(lat, lng);

      if (!result) return null;

      // Normalização e Fallbacks específicos para Angola
      return {
        rua: result.street || result.name || result.neighborhood || "",
        municipio: result.city || result.neighborhood || "",
        provincia: result.province || "",
        pais: "Angola", // Forçamos Angola no contexto atual, ou retornamos o do resultado se disponivel
        fullLabel: result.label
      };
    },
    { lat, lng }
  );
}
