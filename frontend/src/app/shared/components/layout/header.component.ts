import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <header class="app-header">
      <div class="header-left">
        <!-- Espace pour un éventuel bouton menu mobile (hamburger) plus tard -->
      </div>
      
      <div class="header-right">
        <!-- Theme Toggle -->
        <button class="theme-toggle" (click)="toggleTheme()" [title]="'Mode ' + themeService.theme()">
          <span class="icon" *ngIf="themeService.theme() === 'light'">🌙</span>
          <span class="icon" *ngIf="themeService.theme() === 'dark'">☀️</span>
          <span class="icon" *ngIf="themeService.theme() === 'system'">💻</span>
        </button>
      </div>
    </header>
  `,
    styles: [`
    .app-header {
      height: 64px;
      background: var(--app-surface);
      border-bottom: 1px solid var(--app-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 10;
      transition: background-color 0.3s;
    }
    
    .theme-toggle {
      background: var(--app-bg);
      border: 1px solid var(--app-border);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .theme-toggle:hover {
      background: var(--app-surface);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .icon {
      font-size: 1.2rem;
    }
  `]
})
export class HeaderComponent {
    public themeService = inject(ThemeService);

    toggleTheme() {
        const current = this.themeService.theme();
        if (current === 'light') this.themeService.setTheme('dark');
        else if (current === 'dark') this.themeService.setTheme('system');
        else this.themeService.setTheme('light');
    }
}
