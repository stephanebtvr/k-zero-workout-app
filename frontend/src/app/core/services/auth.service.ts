/**
 * AuthService — Service d'authentification pour le frontend Angular.
 *
 * Gère le cycle complet d'authentification JWT :
 * - Login / Register : envoie les identifiants, stocke les tokens
 * - Refresh : renouvelle l'access token automatiquement
 * - Logout : révoque le refresh token et nettoie l'état local
 *
 * Stratégie de stockage des tokens :
 * - Access token : en mémoire uniquement (signal Angular)
 *   → Plus sécurisé que localStorage (pas accessible par XSS en cas de faille)
 *   → Perdu au rechargement de page (compensé par le refresh automatique)
 * - Refresh token : dans localStorage
 *   → Persiste entre les sessions et rechargements
 *   → Protégé par une durée de vie longue (7 jours) et révocable côté serveur
 */
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/** Interface de la réponse d'authentification du backend */
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserSummary;
}

/** Résumé des informations utilisateur */
export interface UserSummary {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

/** DTO de requête pour l'inscription */
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

/** DTO de requête pour la connexion */
export interface LoginRequest {
    email: string;
    password: string;
}

/** Clé localStorage pour le refresh token */
const REFRESH_TOKEN_KEY = 'ironpath_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/auth`;

    /** Access token stocké en mémoire (signal réactif) */
    private accessTokenSignal = signal<string | null>(null);

    /** Utilisateur connecté (signal réactif) */
    private currentUserSignal = signal<UserSummary | null>(null);

    /** Signal calculé : true si l'utilisateur est authentifié */
    readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);

    /** Signal calculé : l'utilisateur courant */
    readonly currentUser = computed(() => this.currentUserSignal());

    /** Signal pour l'état de chargement */
    readonly isLoading = signal(false);

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        // Tente un refresh au démarrage si un refresh token existe en localStorage
        this.tryAutoRefresh();
    }

    /**
     * Retourne l'access token courant (utilisé par l'interceptor JWT).
     *
     * @returns l'access token en mémoire ou null
     */
    getAccessToken(): string | null {
        return this.accessTokenSignal();
    }

    /**
     * Inscrit un nouvel utilisateur.
     *
     * @param request données d'inscription (email, password, firstName, lastName)
     * @returns Observable de la réponse d'authentification
     */
    register(request: RegisterRequest): Observable<AuthResponse> {
        this.isLoading.set(true);
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
            tap(response => this.handleAuthResponse(response)),
            catchError(error => {
                this.isLoading.set(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Connecte un utilisateur avec ses identifiants.
     *
     * @param request données de connexion (email, password)
     * @returns Observable de la réponse d'authentification
     */
    login(request: LoginRequest): Observable<AuthResponse> {
        this.isLoading.set(true);
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(response => this.handleAuthResponse(response)),
            catchError(error => {
                this.isLoading.set(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Renouvelle l'access token via le refresh token stocké.
     *
     * @returns Observable de la réponse d'authentification ou erreur si pas de token
     */
    refreshToken(): Observable<AuthResponse> {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
            return throwError(() => new Error('Aucun refresh token disponible'));
        }

        return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
            tap(response => this.handleAuthResponse(response)),
            catchError(error => {
                // Si le refresh échoue (token expiré/révoqué), on déconnecte
                this.clearAuth();
                return throwError(() => error);
            })
        );
    }

    /**
     * Déconnecte l'utilisateur : révoque le refresh token côté serveur
     * et nettoie l'état local.
     */
    logout(): void {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
            // Révocation côté serveur (fire and forget)
            this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
                error: () => { } // Ignoré : on déconnecte quand même côté client
            });
        }
        this.clearAuth();
        this.router.navigate(['/login']);
    }

    /**
     * Traite la réponse d'authentification : stocke les tokens et l'utilisateur.
     */
    private handleAuthResponse(response: AuthResponse): void {
        this.accessTokenSignal.set(response.accessToken);
        this.currentUserSignal.set(response.user);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        this.isLoading.set(false);
    }

    /**
     * Nettoie tous les données d'authentification.
     */
    private clearAuth(): void {
        this.accessTokenSignal.set(null);
        this.currentUserSignal.set(null);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        this.isLoading.set(false);
    }

    /**
     * Tente un refresh automatique au démarrage de l'application.
     * Si un refresh token existe en localStorage, on essaie de le revalider.
     */
    private tryAutoRefresh(): void {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
            this.refreshToken().subscribe({
                error: () => {
                    // Échec silencieux : l'utilisateur devra se reconnecter
                }
            });
        }
    }
}
