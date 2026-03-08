/**
 * authStore.ts — Store Zustand pour la gestion de l'authentification.
 *
 * Gère l'état d'authentification de l'application mobile :
 * - Stockage de l'access token en mémoire (plus sécurisé)
 * - Persistance du refresh token dans AsyncStorage
 * - Actions : login, register, logout, refreshToken
 *
 * Stratégie de persistance :
 * - Access token : en mémoire Zustand uniquement
 *   → Perdu à la fermeture de l'app (compensé par le refresh auto)
 * - Refresh token : dans AsyncStorage (chiffré sur iOS par le keychain)
 *   → Persiste entre les sessions
 *
 * Note : MMKV serait plus performant que AsyncStorage mais requiert
 * un build natif. AsyncStorage fonctionne avec Expo Go.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../services/api';

/** Clé AsyncStorage pour le refresh token */
const REFRESH_TOKEN_KEY = 'ironpath_refresh_token';

/** Résumé des informations utilisateur */
interface UserSummary {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

/** Réponse d'authentification du backend */
interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserSummary;
}

/** État du store d'authentification */
interface AuthState {
    /** Utilisateur connecté */
    user: UserSummary | null;
    /** Access token JWT en mémoire */
    accessToken: string | null;
    /** L'utilisateur est-il authentifié ? */
    isAuthenticated: boolean;
    /** Chargement en cours (login, register, etc.) */
    isLoading: boolean;
    /** Message d'erreur */
    error: string | null;

    /** Inscription d'un nouvel utilisateur */
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    /** Connexion avec email et mot de passe */
    login: (email: string, password: string) => Promise<void>;
    /** Déconnexion (révocation du refresh token) */
    logout: () => Promise<void>;
    /** Renouvellement de l'access token */
    refreshToken: () => Promise<void>;
    /** Tentative de refresh automatique au démarrage */
    tryAutoRefresh: () => Promise<void>;
    /** Réinitialise l'erreur */
    clearError: () => void;
}

/**
 * Store Zustand pour l'authentification.
 *
 * Utilise le pattern "create" de Zustand avec un state + actions.
 * Le state est réactif : tout composant qui utilise useAuthStore()
 * se re-rend automatiquement quand les valeurs changent.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    register: async (email, password, firstName, lastName) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiRequest<AuthResponse>('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            // Stockage du refresh token dans AsyncStorage
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

            set({
                user: response.user,
                accessToken: response.accessToken,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || "Erreur lors de l'inscription" });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiRequest<AuthResponse>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

            set({
                user: response.user,
                accessToken: response.accessToken,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Email ou mot de passe incorrect' });
            throw error;
        }
    },

    logout: async () => {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        const { accessToken } = get();

        // Révocation côté serveur (fire and forget)
        if (refreshToken) {
            try {
                await apiRequest('/auth/logout', {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken }),
                }, accessToken);
            } catch {
                // Ignoré : on déconnecte quand même côté client
            }
        }

        // Nettoyage de l'état local
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
        });
    },

    refreshToken: async () => {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
            set({ isAuthenticated: false });
            return;
        }

        try {
            const response = await apiRequest<AuthResponse>('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });

            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

            set({
                user: response.user,
                accessToken: response.accessToken,
                isAuthenticated: true,
            });
        } catch {
            // Refresh échoué : on nettoie et l'utilisateur devra se reconnecter
            await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
            });
        }
    },

    tryAutoRefresh: async () => {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
            await get().refreshToken();
        }
    },

    clearError: () => set({ error: null }),
}));
