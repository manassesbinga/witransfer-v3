export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Se o endpoint for relativo, anexa a URL base
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  if (!baseUrl && typeof window === "undefined") {
    // Tenta detectar o host dinamicamente se estiver no lado do servidor
    try {
      const { headers } = require("next/headers");
      const headerList = await headers();
      const host = headerList.get("host");

      if (host) {
        // Usa o protocolo correto baseado no host
        const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
        baseUrl = `${protocol}://${host}`;
      } else {
        baseUrl = "http://127.0.0.1:3000";
      }
    } catch (e) {
      // Fallback para IPv4 local se falhar ao ler headers
      baseUrl = "http://127.0.0.1:3000";
    }
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (typeof window === "undefined") {
    console.log(`[API_FETCH_DEBUG] Server-side fetch to: ${url}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      next: {
        ...(options as any).next,
        revalidate: options.cache === "no-store"
          ? undefined
          : ((options as any).next?.revalidate ?? 3600),
        tags: (options as any).next?.tags || [],
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

      throw new Error(
        "A requisição demorou muito para responder. O servidor pode estar compilando a rota pela primeira vez. Tente atualizar a página.",
      );
    }
    throw error;
  }
}
