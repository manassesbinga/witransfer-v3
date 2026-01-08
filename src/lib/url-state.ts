import { compressToBase64, decompressFromBase64 } from "lz-string";

// Encode a state object to a compact URL-safe string (shorter)
export function encodeState(obj: any): string {
  try {
    const json = JSON.stringify(obj);
    // Usa Base64 para string mais curta
    return compressToBase64(json)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  } catch (e) {
    console.error("Failed to encode state", e);
    return "";
  }
}

// Decode the compact URL-safe string back to object
export function decodeState(s: string): any | null {
  try {
    // Restaura padding para Base64
    const padding = (4 - (s.length % 4)) % 4;
    const padded = s + "=".repeat(padding);
    const decoded = padded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decompressFromBase64(decoded);
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode state", e);
    return null;
  }
}
