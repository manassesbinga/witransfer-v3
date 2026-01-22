"use server";

// Deprecated server-side state storage removed.
// This module is kept for compatibility but no longer writes or reads server files.

export async function saveAppState(
  _data: any,
  _type: "search" | "checkout" = "search",
) {
  // deprecated log removed

  return null;
}

export async function getAppState(_id: string) {
  // deprecated log removed

  return null;
}
