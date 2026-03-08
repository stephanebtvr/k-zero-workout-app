/**
 * JwtInterceptor — Intercepteur HTTP pour l'injection du token JWT.
 *
 * Responsabilités :
 * 1. Ajoute le header "Authorization: Bearer <token>" à chaque requête sortante
 * 2. Intercepte les réponses 401 pour tenter un refresh automatique
 * 3. Rejoue la requête originale après un refresh réussi
 *
 * Protection anti-boucle infinie :
 * Si la requête de refresh elle-même retourne 401, on déconnecte l'utilisateur
 * au lieu de retenter indéfiniment. Le flag `isRefreshing` empêche les appels
 * de refresh concurrents (une seule tentative à la fois).
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Flag pour éviter les appels de refresh concurrents */
let isRefreshing = false;

/**
 * Intercepteur fonctionnel Angular 18 (standalone).
 *
 * Injecte le Bearer token et gère le retry automatique sur 401.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Ne pas ajouter le token aux requêtes d'authentification
    // (register, login, refresh n'ont pas besoin de Bearer token)
    if (req.url.includes('/auth/')) {
        return next(req);
    }

    // Injection du Bearer token dans le header Authorization
    const token = authService.getAccessToken();
    const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si la réponse est 401 et qu'on n'est pas déjà en train de rafraîchir
            if (error.status === 401 && !isRefreshing) {
                isRefreshing = true;

                return authService.refreshToken().pipe(
                    switchMap(() => {
                        isRefreshing = false;
                        // Rejoue la requête originale avec le nouveau access token
                        const newToken = authService.getAccessToken();
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` }
                        });
                        return next(retryReq);
                    }),
                    catchError(refreshError => {
                        isRefreshing = false;
                        // Le refresh a échoué → déconnexion
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
