import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
    template: `
    <div class="app-container">
      <app-sidebar class="desktop-sidebar"></app-sidebar>
      <div class="main-content">
        <app-header></app-header>
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toasts></app-toasts>
    </div>
  `,
    styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
      background: var(--app-bg);
      color: var(--app-text);
      transition: background-color 0.3s, color 0.3s;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0; /* Important pour éviter les dépassements flexbox sur petits écrans */
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      /* Padding géré par les composants enfants (container) */
    }

    @media (max-width: 768px) {
      .desktop-sidebar {
        display: none; /* Cacher la sidebar sur mobile pour le moment */
      }
    }
  `]
})
export class LayoutComponent { }
