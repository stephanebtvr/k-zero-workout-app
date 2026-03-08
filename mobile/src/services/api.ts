/**
 * api.ts — Configuration du client HTTP pour les appels API backend.
 *
 * URL de base configurable via la constante API_URL.
 * En développement, pointe vers le backend Docker local.
 * En production, pointe vers l'API Render.
 */

/** URL de base de l'API backend */
export const API_URL = __DEV__
    ? 'http://localhost:8080/api/v1'
    : 'https://ironpath-api.onrender.com/api/v1';

/**
 * Effectue une requête HTTP avec gestion des headers JSON et du token JWT.
 *
 * @param endpoint chemin relatif de l'endpoint (ex: '/auth/login')
 * @param options options fetch (method, body, headers additionnels)
 * @param token access token JWT optionnel
 * @returns la réponse parsée en JSON
 * @throws Error si la réponse n'est pas 2xx
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    // Injection du Bearer token si fourni
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Gestion des erreurs HTTP
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
        throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    // 204 No Content : pas de body à parser
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}
