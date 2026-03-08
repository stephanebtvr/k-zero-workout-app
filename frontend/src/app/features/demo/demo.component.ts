import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="demo-container">
      <div class="demo-card">
        <!-- En-tête -->
        <div class="demo-header">
          <span class="logo-icon">📱</span>
          <h1 class="logo-text">Testez IronPath sur Mobile</h1>
        </div>

        <p class="demo-subtitle">
          Scannez le QR code ci-dessous avec <strong>l'appareil photo</strong> de votre téléphone
          ou via l'application <strong>Expo Go</strong> pour accéder directement à l'application mobile.
        </p>

        <!-- Zone QR Code -->
        <div class="qr-container">
          <!-- TODO: Replace with actual Expo Go URl when published -->
          <img
            class="qr-image"
            src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=exp://exp.host/@stephanebtvr/k-zero-workout-app"
            alt="QR Code Expo Go"
          />
        </div>

        <div class="instructions">
          <div class="instruction-step">
            <div class="step-number">1</div>
            <div class="step-text">Téléchargez <strong>Expo Go</strong> sur iOS ou Android</div>
          </div>
          <div class="instruction-step">
            <div class="step-number">2</div>
            <div class="step-text">Ouvrez l'appareil photo et scannez le code</div>
          </div>
          <div class="instruction-step">
            <div class="step-number">3</div>
            <div class="step-text">Connectez-vous avec vos identifiants</div>
          </div>
        </div>

        <!-- Bouton retour -->
        <a routerLink="/login" class="btn-secondary">
          <span class="btn-icon">←</span>
          Retour à la connexion
        </a>
      </div>
    </div>
  `,
  styles: [`
    /* ━━━━ Container principal ━━━━ */
    .demo-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg, #FFFFFF);
      padding: 24px;
      animation: fadeIn 300ms ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .demo-card {
      width: 100%;
      max-width: 480px;
      background-color: var(--surface, #F5F5F7);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
      text-align: center;
      border: 1px solid var(--border, #E5E5EA);
    }

    /* ━━━━ En-tête ━━━━ */
    .demo-header {
      margin-bottom: 16px;
    }

    .logo-icon {
      font-size: 56px;
      display: block;
      margin-bottom: 16px;
    }

    .logo-text {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary, #1D1D1F);
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .demo-subtitle {
      color: var(--text-secondary, #6E6E73);
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 32px;
    }

    /* ━━━━ Zone QR Code ━━━━ */
    .qr-container {
      background-color: #FFFFFF;
      padding: 24px;
      border-radius: 24px;
      display: inline-block;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      margin-bottom: 32px;
      border: 1px solid var(--border, #E5E5EA);
    }

    .qr-image {
      width: 200px;
      height: 200px;
      display: block;
      border-radius: 8px;
    }

    /* ━━━━ Instructions ━━━━ */
    .instructions {
      text-align: left;
      margin-bottom: 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .instruction-step {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      background-color: var(--accent, #0071E3);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .step-text {
      font-size: 15px;
      color: var(--text-primary, #1D1D1F);
    }

    /* ━━━━ Bouton de retour ━━━━ */
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary, #1D1D1F);
      background-color: transparent;
      border: 1px solid var(--border, #E5E5EA);
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: all 200ms ease;
    }

    .btn-secondary:hover {
      background-color: rgba(0, 0, 0, 0.04);
      border-color: var(--text-secondary, #6E6E73);
    }

    /* ━━━━ Dark mode ━━━━ */
    :host-context(.dark) .demo-container {
      background-color: #000000;
    }

    :host-context(.dark) .demo-card {
      background-color: #1C1C1E;
      border-color: #38383A;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    }

    :host-context(.dark) .qr-container {
      background-color: #FFFFFF; /* Garder fond blanc pr le QR Code API, pr contrat */
      border-color: #38383A;
    }

    :host-context(.dark) .btn-secondary {
      color: #FFFFFF;
      border-color: #38383A;
    }

    :host-context(.dark) .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: #6E6E73;
    }
  `]
})
export class DemoComponent { }
