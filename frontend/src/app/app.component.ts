/**
 * app.component.ts — Composant racine de l'application Angular.
 *
 * Contient uniquement le router-outlet pour le rendu des routes.
 * Le layout (sidebar, navbar) sera ajouté à l'étape 9.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class AppComponent { }
