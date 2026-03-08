import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProgramService, WorkoutProgram } from '../../core/services/program.service';

@Component({
    selector: 'app-program-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="programs-container">
      <div class="header">
        <h1 class="page-title">Mes Programmes</h1>
        <button class="btn-primary" routerLink="/programs/new">
          <span class="icon">+</span> Créer
        </button>
      </div>

      @if (isLoading()) {
        <div class="loading-state">Chargement de vos programmes...</div>
      } @else if (programs().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>Aucun programme</h3>
          <p>Créez votre première routine d'entraînement sur mesure.</p>
          <button class="btn-primary mt-4" routerLink="/programs/new">Créer un programme</button>
        </div>
      } @else {
        <div class="programs-grid">
          @for (program of programs(); track program.id) {
            <div class="program-card">
              <div class="card-content">
                <h3 class="program-title">{{ program.name }}</h3>
                @if (program.description) {
                  <p class="program-desc">{{ program.description }}</p>
                }
                <div class="program-meta">
                  <span class="meta-badge">{{ program.days.length }} jours</span>
                </div>
              </div>
              <div class="card-actions">
                <button class="action-btn delete-btn" (click)="deleteProgram(program.id)" title="Supprimer">
                  🗑️
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .programs-container { padding: 48px 24px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .page-title { font-size: 32px; font-weight: 700; color: var(--text-primary, #1D1D1F); letter-spacing: -0.5px; }

    .btn-primary {
      background: var(--accent, #0071E3); color: #FFF; border: none; padding: 10px 20px;
      border-radius: 20px; font-size: 15px; font-weight: 600; cursor: pointer;
      transition: background 0.2s; display: flex; align-items: center; gap: 6px;
    }
    .btn-primary:hover { background: #0077ED; }
    .mt-4 { margin-top: 16px; }

    .programs-grid { display: grid; gap: 16px; }

    .program-card {
      background: var(--bg, #FFF); border: 1px solid var(--border, #E5E5EA);
      border-radius: 16px; padding: 20px; display: flex; justify-content: space-between;
      transition: box-shadow 0.2s;
    }
    .program-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

    .program-title { font-size: 18px; font-weight: 600; color: var(--text-primary, #1D1D1F); margin-bottom: 4px; }
    .program-desc { font-size: 14px; color: var(--text-secondary, #6E6E73); margin-bottom: 12px; }
    .meta-badge {
      background: rgba(0,113,227,0.1); color: var(--accent, #0071E3);
      padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;
    }

    .card-actions { display: flex; align-items: flex-start; }
    .action-btn { background: none; border: none; font-size: 18px; cursor: pointer; padding: 8px; border-radius: 8px; transition: background 0.2s; }
    .delete-btn:hover { background: rgba(255,59,48,0.1); color: #FF3B30; }

    .empty-state { text-align: center; padding: 64px 24px; background: var(--surface, #F5F5F7); border-radius: 16px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; font-weight: 600; color: var(--text-primary, #1D1D1F); margin-bottom: 8px; }
    .empty-state p { color: var(--text-secondary, #6E6E73); }
    .loading-state { text-align: center; color: var(--text-secondary, #6E6E73); padding: 48px 0; }

    :host-context(.dark) .program-card { background: var(--surface, #1C1C1E); border-color: var(--border, #38383A); }
    :host-context(.dark) .empty-state { background: var(--surface, #1C1C1E); }
  `]
})
export class ProgramListComponent implements OnInit {
    programs = signal<WorkoutProgram[]>([]);
    isLoading = signal(true);

    constructor(private programService: ProgramService, private router: Router) { }

    ngOnInit() {
        this.loadPrograms();
    }

    loadPrograms() {
        this.isLoading.set(true);
        this.programService.listPrograms().subscribe({
            next: (data) => {
                this.programs.set(data);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    deleteProgram(id: string) {
        if (confirm('Voulez-vous vraiment supprimer ce programme ?')) {
            this.programService.deleteProgram(id).subscribe({
                next: () => this.loadPrograms(),
                error: (err) => alert('Erreur lors de la suppression')
            });
        }
    }
}
