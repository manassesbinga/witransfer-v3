import { NextResponse } from "next/server";
import { getSystemDataInternal } from "@/actions/public/search/cars";

export async function GET() {
  try {
    const data = await getSystemDataInternal();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch system data" },
      { status: 500 },
    );
  }
}
