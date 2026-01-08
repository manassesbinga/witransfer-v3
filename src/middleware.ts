import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  middleware as routingMiddleware,
  config as routingConfig,
} from "./middlewares/middleware";

/**
 * Main Middleware Entry Point
 * This file stays in src/ to be recognized by Next.js,
 * but delegates logic to the middlewares folder.
 */
export function middleware(request: NextRequest) {
  // Dispatch to organized middlewares
  return routingMiddleware(request);
}

// Export the config from the dedicated middleware file
export const config = routingConfig;
