/**
 * app.routes.ts — Routes de l'application Angular IronPath.
 *
 * Stratégie :
 * - Routes publiques : /login, /register (pas de guard)
 * - Routes protégées : toutes les features (authGuard)
 * - Lazy-loading : chaque feature est chargée à la demande
 * - Redirect par défaut : / → /dashboard (si authentifié) ou /login
 */
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // ━━━━ Routes publiques ━━━━
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
        title: 'Connexion — IronPath'
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent),
        title: 'Inscription — IronPath'
    },

    // ━━━━ Routes protégées ━━━━
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
        title: 'Tableau de bord — IronPath'
    },

    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard],
        title: 'Mon Profil — IronPath'
    },

    {
        path: 'exercises',
        loadComponent: () => import('./features/exercises/exercise-list.component').then(m => m.ExerciseListComponent),
        canActivate: [authGuard],
        title: 'Exercices — IronPath'
    },

    {
        path: 'programs',
        loadComponent: () => import('./features/programs/program-list.component').then(m => m.ProgramListComponent),
        canActivate: [authGuard],
        title: 'Mes Programmes — IronPath'
    },
    {
        path: 'programs/new',
        loadComponent: () => import('./features/programs/program-builder.component').then(m => m.ProgramBuilderComponent),
        canActivate: [authGuard],
        title: 'Créer un programme — IronPath'
    },

    {
        path: 'workout',
        loadComponent: () => import('./features/workout/active-workout.component').then(m => m.ActiveWorkoutComponent),
        canActivate: [authGuard],
        title: 'Séance en cours — IronPath'
    },
    {
        path: 'history',
        loadComponent: () => import('./features/workout/workout-history.component').then(m => m.WorkoutHistoryComponent),
        canActivate: [authGuard],
        title: 'Historique — IronPath'
    },

    {
        path: 'measurements',
        loadComponent: () => import('./features/measurements/measurements.component').then(m => m.MeasurementsComponent),
        canActivate: [authGuard],
        title: 'Mensurations — IronPath'
    },

    // ━━━━ Redirections ━━━━
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: '/dashboard' }
];
