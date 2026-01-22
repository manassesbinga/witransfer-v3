import { NextResponse } from "next/server";
import { SearchFilters } from "@/types";
import { searchCarsInternal } from "@/actions/public/search/cars";

export async function POST(request: Request) {
  try {
    const filters: SearchFilters = await request.json();
    const results = await searchCarsInternal(filters);
    return NextResponse.json(results);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to search cars" },
      { status: 500 },
    );
  }
}
