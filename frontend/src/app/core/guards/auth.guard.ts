/**
 * AuthGuard — Guard de route pour protéger les pages authentifiées.
 *
 * Vérifie que l'utilisateur est authentifié avant d'accéder à une route.
 * Si non authentifié, redirige automatiquement vers /login.
 *
 * Utilisation dans les routes :
 * { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard fonctionnel Angular 18 (standalone).
 *
 * @returns true si l'utilisateur est authentifié, sinon redirige vers /login
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Redirige vers la page de connexion avec l'URL de retour
    return router.createUrlTree(['/login']);
};
