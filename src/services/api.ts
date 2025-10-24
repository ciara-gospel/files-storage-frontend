// src/services/api.ts
export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY || "",
      },
      ...options,
    });

    // réseau ok mais status non-ok
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${res.status} ${res.statusText} - ${text}`);
    }

    // body peut être vide (204)
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;
    return await res.json();
  } catch (err) {
    // Erreur réseau (ex: CORS, DNS, offline)
    throw err;
  }
}
