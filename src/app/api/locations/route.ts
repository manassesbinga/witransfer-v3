import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { orsGeocode } from "@/lib/ors";

function normalize(s: string) {
    if (!s) return "";
    return s.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * API Route for location suggestions.
 * Combines results from OpenStreetMap (Nominatim) and local partners' addresses.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    const normalizedQuery = normalize(query);

    try {
        // Use a much shorter timeout for external services in autocomplete context (2 seconds)
        const EXTERNAL_TIMEOUT = 2500;

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

        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&countrycodes=ao&accept-language=pt`;

        const [nominatimRes, partnerLocations, orsRes] = await Promise.allSettled([
            fetchWithTimeout(nominatimUrl, {
                headers: { "User-Agent": "WiTransfer-App" },
                next: { revalidate: 3600 }
            }).then(r => r.ok ? r.json() : []),
            supabase
                .from("partners")
                .select("address_province, address_city")
                .filter("status", "eq", "active"),
            orsGeocode(query) // orsGeocode already has a timeout, but longer
        ]);

        const suggestions = new Map<string, any>();

        // SOURCE C: Partner locations (PROCESSED FIRST for priority)
        if (partnerLocations.status === 'fulfilled' && partnerLocations.value.data) {
            partnerLocations.value.data.forEach((p: any) => {
                const prov = p.address_province;
                const city = p.address_city;
                if (prov && normalize(prov).includes(normalizedQuery)) {
                    const label = `${prov}, Angola`;
                    if (!suggestions.has(label)) suggestions.set(label, { label, score: 120 });
                }
                if (city && normalize(city).includes(normalizedQuery)) {
                    const label = `${city}, ${prov || "Angola"}`;
                    if (!suggestions.has(label)) suggestions.set(label, { label, score: 110 });
                }
            });
        }

        // SOURCE ORS: OpenRouteService
        if (orsRes.status === 'fulfilled' && Array.isArray(orsRes.value)) {
            orsRes.value.forEach((item: any) => {
                const label = item.label;
                if (!suggestions.has(label)) {
                    suggestions.set(label, { label, score: 90 });
                }
            });
        }

        // SOURCE B: Nominatim
        if (nominatimRes.status === 'fulfilled' && Array.isArray(nominatimRes.value)) {
            nominatimRes.value.forEach((item: any) => {
                const label = item.display_name;
                if (!suggestions.has(label)) {
                    suggestions.set(label, { label, score: 80 });
                }
            });
        }

        // Sort by score descending and return top 10 labels
        const finalResults = Array.from(suggestions.values())
            .sort((a, b) => b.score - a.score)
            .map(s => s.label)
            .slice(0, 10);

        return NextResponse.json(finalResults);
    } catch (error) {
        console.error("Location API error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
