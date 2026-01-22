import { NextResponse } from "next/server";

// Endpoint removed: waitlist processing is disabled. Return 404 to indicate not available.
export async function POST() {
  return NextResponse.json({ error: "Endpoint process-waitlist removed" }, { status: 404 });
}
