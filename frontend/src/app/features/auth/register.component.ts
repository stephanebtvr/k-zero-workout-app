/**
 * RegisterComponent — Page d'inscription IronPath.
 *
 * Design Apple épuré : champs firstName, lastName, email, password.
 * Reactive Forms avec validation inline. Animation fade-in + shake sur erreur.
 */
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="auth-container">
      <div class="auth-card" [class.shake]="showShake()">
        <!-- Logo -->
        <div class="auth-logo">
          <span class="logo-icon">🏋️</span>
          <h1 class="logo-text">IronPath</h1>
        </div>

        <p class="auth-subtitle">Créez votre compte pour commencer</p>

        <!-- Message d'erreur global -->
        @if (errorMessage()) {
          <div class="error-banner">
            <span class="error-icon">⚠️</span>
            {{ errorMessage() }}
          </div>
        }

        <!-- Formulaire d'inscription -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <!-- Nom complet (deux colonnes) -->
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">Prénom</label>
              <input
                id="firstName"
                type="text"
                formControlName="firstName"
                class="form-input"
                placeholder="Jean"
                autocomplete="given-name"
              />
              @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                <span class="field-error">Le prénom est obligatoire</span>
              }
            </div>

            <div class="form-group">
              <label for="lastName" class="form-label">Nom</label>
              <input
                id="lastName"
                type="text"
                formControlName="lastName"
                class="form-input"
                placeholder="Dupont"
                autocomplete="family-name"
              />
              @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                <span class="field-error">Le nom est obligatoire</span>
              }
            </div>
          </div>

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
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
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
              placeholder="8 caractères minimum"
              autocomplete="new-password"
            />
            @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
              <span class="field-error">Le mot de passe est obligatoire</span>
            }
            @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
              <span class="field-error">Le mot de passe doit contenir au moins 8 caractères</span>
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
              Inscription en cours...
            } @else {
              Créer mon compte
            }
          </button>
        </form>

        <!-- Lien vers connexion -->
        <p class="auth-link">
          Déjà un compte ?
          <a routerLink="/login" class="link-accent">Se connecter</a>
        </p>
      </div>
    </div>
  `,
    styles: [`
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

    .auth-card { width: 100%; max-width: 420px; }

    .auth-logo { text-align: center; margin-bottom: 8px; }
    .logo-icon { font-size: 48px; display: block; margin-bottom: 8px; }
    .logo-text {
      font-size: 32px; font-weight: 700;
      color: var(--text-primary, #1D1D1F); letter-spacing: -0.5px;
    }

    .auth-subtitle {
      text-align: center; color: var(--text-secondary, #6E6E73);
      font-size: 16px; margin-bottom: 32px;
    }

    .error-banner {
      background-color: #FFF2F2; border: 1px solid #FFD1D1;
      color: #FF3B30; padding: 12px 16px; border-radius: 12px;
      margin-bottom: 20px; font-size: 14px;
      display: flex; align-items: center; gap: 8px;
    }
    .error-icon { font-size: 16px; }

    .form-row { display: flex; gap: 12px; }
    .form-row .form-group { flex: 1; }

    .form-group { margin-bottom: 20px; }

    .form-label {
      display: block; font-size: 14px; font-weight: 500;
      color: var(--text-primary, #1D1D1F); margin-bottom: 6px;
    }

    .form-input {
      width: 100%; padding: 12px 16px; font-size: 16px;
      border: 1px solid var(--border, #E5E5EA); border-radius: 12px;
      background-color: var(--surface, #F5F5F7);
      color: var(--text-primary, #1D1D1F);
      transition: border-color 200ms ease, box-shadow 200ms ease;
      outline: none; box-sizing: border-box;
    }

    .form-input:focus {
      border-color: var(--accent, #0071E3);
      box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
    }

    .form-input::placeholder { color: var(--text-secondary, #6E6E73); opacity: 0.6; }

    .field-error { display: block; font-size: 13px; color: #FF3B30; margin-top: 4px; }

    .btn-primary {
      width: 100%; padding: 14px; font-size: 16px; font-weight: 600;
      color: #FFFFFF; background-color: var(--accent, #0071E3);
      border: none; border-radius: 12px; cursor: pointer;
      transition: background-color 200ms ease, opacity 200ms ease;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin-top: 8px;
    }

    .btn-primary:hover:not(:disabled) { background-color: #0062C4; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF; border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-link {
      text-align: center; font-size: 14px;
      color: var(--text-secondary, #6E6E73); margin-top: 24px;
    }

    .link-accent {
      color: var(--accent, #0071E3); text-decoration: none; font-weight: 500;
    }
    .link-accent:hover { text-decoration: underline; }

    .shake { animation: shake 400ms ease-out; }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }

    :host-context(.dark) .auth-container { background-color: #000000; }
    :host-context(.dark) .error-banner {
      background-color: #3A1A1A; border-color: #5A2A2A; color: #FF453A;
    }
  `]
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);
    showShake = signal(false);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]]
        });
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            this.triggerShake();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.isLoading.set(false);
                const message = error?.error?.message || 'Une erreur est survenue lors de l\'inscription';
                this.errorMessage.set(message);
                this.triggerShake();
            }
        });
    }

    private triggerShake(): void {
        this.showShake.set(true);
        setTimeout(() => this.showShake.set(false), 400);
    }
}
