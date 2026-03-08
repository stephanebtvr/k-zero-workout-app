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

    // ━━━━ Routes protégées (avec Layout) ━━━━
    {
        path: '',
        loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
                title: 'Tableau de bord — IronPath'
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
                title: 'Mon Profil — IronPath'
            },
            {
                path: 'exercises',
                loadComponent: () => import('./features/exercises/exercise-list.component').then(m => m.ExerciseListComponent),
                title: 'Exercices — IronPath'
            },
            {
                path: 'programs',
                loadComponent: () => import('./features/programs/program-list.component').then(m => m.ProgramListComponent),
                title: 'Mes Programmes — IronPath'
            },
            {
                path: 'programs/new',
                loadComponent: () => import('./features/programs/program-builder.component').then(m => m.ProgramBuilderComponent),
                title: 'Créer un programme — IronPath'
            },
            {
                path: 'workout',
                loadComponent: () => import('./features/workout/active-workout.component').then(m => m.ActiveWorkoutComponent),
                title: 'Séance en cours — IronPath'
            },
            {
                path: 'history',
                loadComponent: () => import('./features/workout/workout-history.component').then(m => m.WorkoutHistoryComponent),
                title: 'Historique — IronPath'
            },
            {
                path: 'measurements',
                loadComponent: () => import('./features/measurements/measurements.component').then(m => m.MeasurementsComponent),
                title: 'Mensurations — IronPath'
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // ━━━━ Redirections Globales ━━━━
    { path: '**', redirectTo: '/dashboard' }
];
