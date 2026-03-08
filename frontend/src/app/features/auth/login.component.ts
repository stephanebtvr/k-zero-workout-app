/**
 * LoginComponent — Page de connexion IronPath.
 *
 * Design Apple : layout centré, typographie SF Pro, champs épurés,
 * bouton CTA bleu pleine largeur, animation fade-in et shake sur erreur.
 *
 * Fonctionnalités :
 * - Reactive Form avec validation email + password
 * - Messages d'erreur inline en français
 * - État de chargement sur le bouton
 * - Lien vers la page d'inscription
 * - Animation shake subtile sur erreur de formulaire
 */
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="auth-container" @fadeIn>
      <div class="auth-card" [class.shake]="showShake()">
        <!-- Logo -->
        <div class="auth-logo">
          <span class="logo-icon">🏋️</span>
          <h1 class="logo-text">IronPath</h1>
        </div>

        <p class="auth-subtitle">Connectez-vous pour suivre vos performances</p>

        <!-- Message d'erreur global -->
        @if (errorMessage()) {
          <div class="error-banner">
            <span class="error-icon">⚠️</span>
            {{ errorMessage() }}
          </div>
        }

        <!-- Formulaire de connexion -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">Adresse email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-input"
              placeholder="votre@email.com"
              autocomplete="email"
            />
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <span class="field-error">Veuillez saisir une adresse email valide</span>
            }
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="form-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span class="field-error">Le mot de passe est obligatoire</span>
            }
          </div>

          <!-- Bouton de soumission -->
          <button
            type="submit"
            class="btn-primary"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Connexion en cours...
            } @else {
              Se connecter
            }
          </button>
        </form>

        <!-- Lien vers inscription -->
        <p class="auth-link">
          Pas encore de compte ?
          <a routerLink="/register" class="link-accent">S'inscrire</a>
        </p>
      </div>
    </div>
  `,
    styles: [`
    /* ━━━━ Container Auth ━━━━ */
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg, #FFFFFF);
      padding: 24px;
      animation: fadeIn 200ms ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
    }

    /* ━━━━ Logo ━━━━ */
    .auth-logo {
      text-align: center;
      margin-bottom: 8px;
    }

    .logo-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 8px;
    }

    .logo-text {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary, #1D1D1F);
      letter-spacing: -0.5px;
    }

    .auth-subtitle {
      text-align: center;
      color: var(--text-secondary, #6E6E73);
      font-size: 16px;
      margin-bottom: 32px;
    }

    /* ━━━━ Error Banner ━━━━ */
    .error-banner {
      background-color: #FFF2F2;
      border: 1px solid #FFD1D1;
      color: #FF3B30;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-icon { font-size: 16px; }

    /* ━━━━ Form ━━━━ */
    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, #1D1D1F);
      margin-bottom: 6px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 16px;
      border: 1px solid var(--border, #E5E5EA);
      border-radius: 12px;
      background-color: var(--surface, #F5F5F7);
      color: var(--text-primary, #1D1D1F);
      transition: border-color 200ms ease, box-shadow 200ms ease;
      outline: none;
      box-sizing: border-box;
    }

    .form-input:focus {
      border-color: var(--accent, #0071E3);
      box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
    }

    .form-input::placeholder {
      color: var(--text-secondary, #6E6E73);
      opacity: 0.6;
    }

    .field-error {
      display: block;
      font-size: 13px;
      color: #FF3B30;
      margin-top: 4px;
    }

    /* ━━━━ Bouton CTA ━━━━ */
    .btn-primary {
      width: 100%;
      padding: 14px;
      font-size: 16px;
      font-weight: 600;
      color: #FFFFFF;
      background-color: var(--accent, #0071E3);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: background-color 200ms ease, opacity 200ms ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0062C4;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ━━━━ Spinner ━━━━ */
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ━━━━ Lien inscription ━━━━ */
    .auth-link {
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary, #6E6E73);
      margin-top: 24px;
    }

    .link-accent {
      color: var(--accent, #0071E3);
      text-decoration: none;
      font-weight: 500;
    }

    .link-accent:hover {
      text-decoration: underline;
    }

    /* ━━━━ Animation Shake (erreur) ━━━━ */
    .shake {
      animation: shake 400ms ease-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }

    /* ━━━━ Dark mode ━━━━ */
    :host-context(.dark) .auth-container {
      background-color: #000000;
    }

    :host-context(.dark) .error-banner {
      background-color: #3A1A1A;
      border-color: #5A2A2A;
      color: #FF453A;
    }
  `]
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);
    showShake = signal(false);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });
    }

    /**
     * Soumet le formulaire de connexion.
     * Déclenche l'animation shake si le formulaire est invalide.
     */
    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            this.triggerShake();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.isLoading.set(false);
                const message = error?.error?.message || 'Email ou mot de passe incorrect';
                this.errorMessage.set(message);
                this.triggerShake();
            }
        });
    }

    /**
     * Déclenche l'animation shake pendant 400ms.
     */
    private triggerShake(): void {
        this.showShake.set(true);
        setTimeout(() => this.showShake.set(false), 400);
    }
}
