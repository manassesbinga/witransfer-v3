
import { NextResponse } from "next/server";
import { orsGeocode, orsReverseGeocode } from "@/lib/ors";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    try {
        if (lat && lng) {
            const result = await orsReverseGeocode(parseFloat(lat), parseFloat(lng));
            return NextResponse.json(result);
        }

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        const results = await orsGeocode(query);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Geocode API error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
