import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toasts',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast" 
           [ngClass]="toast.type"
           (click)="toastService.remove(toast.id)">
        <span class="icon" *ngIf="toast.type === 'success'">✓</span>
        <span class="icon" *ngIf="toast.type === 'error'">✕</span>
        <span class="icon" *ngIf="toast.type === 'info'">ℹ</span>
        <span class="message">{{ toast.message }}</span>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none; /* Laisse passer les clics sous le conteneur */
    }

    .toast {
      pointer-events: auto; /* Rend le toast cliquable */
      background: var(--app-surface, #1C1C1E);
      color: var(--app-text, #F5F5F7);
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      border-left: 4px solid transparent;
      min-width: 250px;
      max-width: 350px;
    }

    .toast.success { border-left-color: var(--app-success, #34C759); }
    .toast.error { border-left-color: var(--app-danger, #FF3B30); }
    .toast.info { border-left-color: var(--app-primary, #0071E3); }

    .icon {
      font-weight: bold;
      font-size: 1.1rem;
    }
    .toast.success .icon { color: var(--app-success, #34C759); }
    .toast.error .icon { color: var(--app-danger, #FF3B30); }
    .toast.info .icon { color: var(--app-primary, #0071E3); }

    .message {
      font-size: 0.95rem;
      font-weight: 500;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastsComponent {
    public toastService = inject(ToastService);
}
