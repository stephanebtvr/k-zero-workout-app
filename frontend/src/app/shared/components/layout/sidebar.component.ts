import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <aside class="sidebar apple-style">
      <div class="sidebar-header">
        <div class="logo-container">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">IronPath</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <!-- Dashboard -->
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Tableau de bord</span>
        </a>
        
        <div class="nav-section">ENTRAÎNEMENT</div>
        
        <!-- Programmes -->
        <a routerLink="/programs" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📋</span>
          <span class="nav-label">Programmes / Séances</span>
        </a>
        
        <!-- Exercices -->
        <a routerLink="/exercises" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🏋️</span>
          <span class="nav-label">Exercices</span>
        </a>
        
        <div class="nav-section">SUIVI</div>
        
        <!-- Historique -->
        <a routerLink="/history" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🕒</span>
          <span class="nav-label">Historique</span>
        </a>
        
        <!-- Mensurations -->
        <a routerLink="/measurements" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📏</span>
          <span class="nav-label">Mensurations</span>
        </a>

        <div class="nav-section">COMPTE</div>

        <!-- Profil -->
        <a routerLink="/profile" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">👤</span>
          <span class="nav-label">Mon Profil</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" (click)="logout()">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">Déconnexion</span>
        </button>
      </div>
    </aside>
  `,
    styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--app-surface);
      border-right: 1px solid var(--app-border);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      transition: background-color 0.3s;
    }
    
    .sidebar-header {
      padding: 24px 20px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      font-size: 1.5rem;
      background: var(--app-primary);
      color: white;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
    }
    .logo-text {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--app-text);
      letter-spacing: -0.5px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 10px 16px;
      overflow-y: auto;
    }

    .nav-section {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--app-text-secondary);
      margin: 24px 0 8px 12px;
      letter-spacing: 0.5px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin-bottom: 4px;
      border-radius: 12px;
      color: var(--app-text);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }
    .nav-item:hover {
      background: var(--app-bg);
    }
    .nav-item.active {
      background: rgba(0, 113, 227, 0.1);
      color: var(--app-primary);
    }
    .nav-icon {
      font-size: 1.2rem;
    }

    .sidebar-footer {
      padding: 20px 16px;
      border-top: 1px solid var(--app-border);
    }
    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      background: none;
      border: none;
      color: var(--app-danger);
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: rgba(255, 59, 48, 0.1);
    }
  `]
})
export class SidebarComponent {
    authService = inject(AuthService);

    logout() {
        this.authService.logout();
    }
}
