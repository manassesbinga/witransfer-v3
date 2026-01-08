// Deprecated server-side state storage removed.
// This module is kept for compatibility but no longer writes or reads server files.

export async function saveAppState(
  _data: any,
  _type: "search" | "checkout" = "search",
) {
  console.warn(
    "saveAppState is deprecated. Use URL-encoded state (param `s`) or sessionStorage (sid) instead.",
  );
  return null;
}

export async function getAppState(_id: string) {
  console.warn(
    "getAppState is deprecated. Use URL-encoded state (param `s`) or sessionStorage (sid) instead.",
  );
  return null;
}
