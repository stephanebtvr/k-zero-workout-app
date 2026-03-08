/**
 * ProfileComponent — Page de profil utilisateur IronPath.
 *
 * Design Apple : avatar grand format en haut, formulaire éditable dessous.
 * Bouton "Enregistrer" avec état loading + animation succès (checkmark).
 */
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { UserService, UserProfile } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="profile-container">
      <div class="profile-card">
        <h1 class="page-title">Mon Profil</h1>

        <!-- Avatar -->
        <div class="avatar-section">
          <div class="avatar-circle">
            @if (profile()?.avatarUrl) {
              <img [src]="profile()!.avatarUrl" alt="Avatar" class="avatar-img" />
            } @else {
              <span class="avatar-initials">{{ getInitials() }}</span>
            }
          </div>
          <button class="avatar-btn" (click)="onAvatarClick()">
            Changer la photo
          </button>
        </div>

        <!-- Info email (non modifiable) -->
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{{ profile()?.email }}</span>
        </div>

        <!-- Formulaire éditable -->
        @if (profileForm) {
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName" class="form-label">Prénom</label>
                <input id="firstName" type="text" formControlName="firstName" class="form-input" />
              </div>
              <div class="form-group">
                <label for="lastName" class="form-label">Nom</label>
                <input id="lastName" type="text" formControlName="lastName" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="birthDate" class="form-label">Date de naissance</label>
                <input id="birthDate" type="date" formControlName="birthDate" class="form-input" />
              </div>
              <div class="form-group">
                <label for="heightCm" class="form-label">Taille (cm)</label>
                <input id="heightCm" type="number" formControlName="heightCm" class="form-input" placeholder="175" />
              </div>
            </div>

            <button type="submit" class="btn-primary" [disabled]="isSaving()">
              @if (isSaving()) {
                <span class="spinner"></span> Enregistrement...
              } @else if (showSuccess()) {
                <span class="checkmark">✓</span> Enregistré
              } @else {
                Enregistrer
              }
            </button>
          </form>
        }

        <!-- Bouton déconnexion -->
        <button class="btn-logout" (click)="onLogout()">Se déconnecter</button>
      </div>
    </div>
  `,
    styles: [`
    .profile-container {
      min-height: 100vh; display: flex; align-items: flex-start;
      justify-content: center; background: var(--bg, #FFF); padding: 48px 24px;
    }
    .profile-card { width: 100%; max-width: 480px; }
    .page-title {
      font-size: 32px; font-weight: 700; color: var(--text-primary, #1D1D1F);
      letter-spacing: -0.5px; margin-bottom: 32px;
    }

    /* Avatar */
    .avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }
    .avatar-circle {
      width: 96px; height: 96px; border-radius: 50%;
      background: var(--surface, #F5F5F7); display: flex;
      align-items: center; justify-content: center; overflow: hidden;
      border: 2px solid var(--border, #E5E5EA); margin-bottom: 12px;
    }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials { font-size: 32px; font-weight: 600; color: var(--text-secondary, #6E6E73); }
    .avatar-btn {
      background: none; border: none; color: var(--accent, #0071E3);
      font-size: 14px; font-weight: 500; cursor: pointer;
    }

    /* Info row */
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 0; border-bottom: 1px solid var(--border, #E5E5EA); margin-bottom: 24px;
    }
    .info-label { font-size: 14px; color: var(--text-secondary, #6E6E73); }
    .info-value { font-size: 14px; color: var(--text-primary, #1D1D1F); font-weight: 500; }

    /* Form */
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
      background: var(--surface, #F5F5F7); color: var(--text-primary, #1D1D1F);
      outline: none; box-sizing: border-box; transition: border-color 200ms ease;
    }
    .form-input:focus { border-color: var(--accent, #0071E3); box-shadow: 0 0 0 3px rgba(0,113,227,0.15); }

    /* Buttons */
    .btn-primary {
      width: 100%; padding: 14px; font-size: 16px; font-weight: 600;
      color: #FFF; background: var(--accent, #0071E3); border: none;
      border-radius: 12px; cursor: pointer; transition: background 200ms ease;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-primary:hover:not(:disabled) { background: #0062C4; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #FFF; border-radius: 50%; animation: spin 600ms linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .checkmark { font-size: 18px; }

    .btn-logout {
      width: 100%; padding: 14px; font-size: 16px; font-weight: 500;
      color: var(--danger, #FF3B30); background: none;
      border: 1px solid var(--border, #E5E5EA); border-radius: 12px;
      cursor: pointer; margin-top: 16px; transition: background 200ms ease;
    }
    .btn-logout:hover { background: var(--surface, #F5F5F7); }

    :host-context(.dark) .profile-container { background: #000; }
  `]
})
export class ProfileComponent implements OnInit {
    profileForm!: FormGroup;
    profile = signal<UserProfile | null>(null);
    isSaving = signal(false);
    showSuccess = signal(false);

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.userService.getProfile().subscribe({
            next: (profile) => {
                this.profile.set(profile);
                this.profileForm = this.fb.group({
                    firstName: [profile.firstName],
                    lastName: [profile.lastName],
                    birthDate: [profile.birthDate || ''],
                    heightCm: [profile.heightCm || '']
                });
            }
        });
    }

    getInitials(): string {
        const p = this.profile();
        if (!p) return '?';
        return (p.firstName[0] + p.lastName[0]).toUpperCase();
    }

    onSubmit(): void {
        if (!this.profileForm.valid) return;
        this.isSaving.set(true);
        this.showSuccess.set(false);

        const values = this.profileForm.value;
        const request: any = {};
        if (values.firstName) request.firstName = values.firstName;
        if (values.lastName) request.lastName = values.lastName;
        if (values.birthDate) request.birthDate = values.birthDate;
        if (values.heightCm) request.heightCm = Number(values.heightCm);

        this.userService.updateProfile(request).subscribe({
            next: (profile) => {
                this.profile.set(profile);
                this.isSaving.set(false);
                this.showSuccess.set(true);
                setTimeout(() => this.showSuccess.set(false), 2000);
            },
            error: () => this.isSaving.set(false)
        });
    }

    onAvatarClick(): void {
        // Pour le MVP, on utilise une URL directe
        const url = prompt('URL de votre avatar :');
        if (url) {
            this.userService.uploadAvatar(url).subscribe({
                next: (profile) => this.profile.set(profile)
            });
        }
    }

    onLogout(): void {
        this.authService.logout();
    }
}
