"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";

/**
 * Busca sugestões de localidades em tempo real usando a API gratuita do OpenStreetMap (Nominatim).
 * Focada em Angola, conforme solicitado.
 */
export async function getLocalitySuggestions(curr: string) {
  return createPublicAction(
    "GetLocalitySuggestions",
    async (query: string) => {
      if (!query || query.length < 2) return [];

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&countrycodes=ao&accept-language=pt`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "WiTransfer-Angola-App/1.0",
        },
        next: { revalidate: 600 },
      });

      if (!response.ok) {
        throw new Error(`Erro na API Nominatim: ${response.status}`);
      }

      const data = await response.json();

      return data.map((item: any) => {
        const address = item.address;
        const parts = [];

        if (address.road) parts.push(address.road);
        if (address.suburb) parts.push(address.suburb);
        if (address.city || address.town || address.village) {
          parts.push(address.city || address.town || address.village);
        }
        if (address.state) parts.push(address.state);

        if (parts.length < 2) return item.display_name;

        return `${parts.join(", ")}, Angola`;
      });
    },
    curr,
  );
}
