const ORS_API_KEY = process.env.ORS;

export interface LatLng {
    lat: number;
    lng: number;
}

export interface GeocodeResult {
    label: string;
    lat: number;
    lng: number;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    province?: string;
    layer?: string;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(id);
    }
}

export async function orsGeocode(text: string): Promise<GeocodeResult[]> {
    if (!ORS_API_KEY) {
        console.warn("⚠️ ORS: API Key não configurada.");
        return [];
    }

    try {
        // Usamos o perfil de geocoding para Angola para máxima precisão local
        const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(text)}&boundary.country=AO&size=10&layers=address,venue,neighbourhood,locality`;
        const res = await fetchWithTimeout(url);

        if (!res.ok) {
            if (res.status === 403 || res.status === 401) {
                console.error("❌ ORS: API Key expirada ou inválida.");
            } else {
                console.error(`❌ ORS Geocode falhou com status: ${res.status}`);
            }
            return [];
        }

        const data = await res.json();
        return (data.features || []).map((f: any) => {
            const props = f.properties;
            return {
                label: props.label,
                lng: f.geometry.coordinates[0],
                lat: f.geometry.coordinates[1],
                street: props.street,
                number: props.housenumber,
                neighborhood: props.neighbourhood || props.quarter || props.suburb || props.district || props.borough,
                city: props.locality || props.city || props.county,
                province: props.region || props.state,
                layer: props.layer
            };
        });
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error("⏱️ ORS Geocode: Timeout atingido.");
        } else {
            console.error("❌ ORS Geocode erro:", error);
        }
        return [];
    }
}

export async function orsReverseGeocode(lat: number, lng: number): Promise<{
    label: string;
    street?: string;
    name?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    province?: string;
    layer?: string;
} | null> {
    if (!ORS_API_KEY) return null;

    try {
        const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_API_KEY}&point.lat=${lat}&point.lon=${lng}&boundary.country=AO&size=1`;
        const res = await fetchWithTimeout(url);

        if (!res.ok) return null;

        const data = await res.json();
        if (data.features && data.features.length > 0) {
            const props = data.features[0].properties;
            return {
                label: props.label,
                street: props.street,
                name: props.name,
                number: props.housenumber,
                neighborhood: props.neighbourhood || props.quarter || props.suburb || props.district || props.borough,
                city: props.locality || props.city || props.county,
                province: props.region || props.state,
                layer: props.layer
            };
        }
        return null;
    } catch (error) {
        console.error("❌ ORS Reverse Geocode erro:", error);
        return null;
    }
}

export async function orsDirections(waypoints: LatLng[]): Promise<{ distance: number; duration: number } | null> {
    if (!ORS_API_KEY) {
        console.warn("⚠️ ORS: API Key não configurada para Directions.");
        return null;
    }
    if (waypoints.length < 2) return null;

    try {
        const url = `https://api.openrouteservice.org/v2/directions/driving-car`;
        const body = {
            coordinates: waypoints.map(w => [w.lng, w.lat]),
            instructions: false,
            units: "m",
            preference: "fastest",
            radiuses: waypoints.map(() => 5000), // Raio de 5km para encontrar a estrada mais próxima
        };

        console.log(`📡 [ORS-API] Solicitando rota para ${waypoints.length} pontos (Raio: 5km)...`);

        const res = await fetchWithTimeout(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": ORS_API_KEY,
            },
            body: JSON.stringify(body),
        }, 12000); // Timeout maior para rotas longas

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ ORS Directions falhou (Status ${res.status}):`, errorText);
            return null;
        }

        const data = await res.json();
        if (!data.routes || data.routes.length === 0) {
            console.warn("⚠️ ORS: Nenhuma rota encontrada para estas coordenadas.");
            return null;
        }

        const route = data.routes[0];

        // O summary contém a distância em metros e duração em segundos
        return {
            distance: route.summary.distance,
            duration: route.summary.duration,
        };
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error("⏱️ ORS Directions: Timeout atingido ao calcular rota.");
        } else {
            console.error("❌ ORS Directions erro:", error);
        }
        return null;
    }
}
