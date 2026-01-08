const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === "undefined" ? "http://localhost:3000" : "");

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Se o endpoint for relativo, anexa a URL base
  // No servidor, fetch exige URLs absolutas.
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (typeof window === "undefined") {
    console.log(`[API-FETCH] Calling: ${url}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      // Timeout mais longo para ambiente de desenvolvimento (compilação fria)
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          errorData.message ||
          `Erro na API: ${response.status}`,
      );
    }

    return response.json();
  } catch (error: any) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      console.error(`[API-TIMEOUT] Request to ${url} timed out after 30s`);
      throw new Error(
        "A requisição demorou muito para responder. O servidor pode estar compilando a rota pela primeira vez. Tente atualizar a página.",
      );
    }
    throw error;
  }
}
