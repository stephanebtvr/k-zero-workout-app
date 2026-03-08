import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WorkoutService, Workout } from '../../core/services/workout.service';

@Component({
    selector: 'app-workout-history',
    standalone: true,
    imports: [CommonModule, DatePipe],
    template: `
    <div class="history-container">
      <h1 class="page-title">Historique</h1>

      @if (isLoading()) {
        <div class="loading-state">Chargement...</div>
      } @else if (workouts().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>Aucune séance</h3>
          <p>Démarrez une nouvelle séance pour commencer à remplir votre historique.</p>
        </div>
      } @else {
        <div class="timeline">
          @for (workout of workouts(); track workout.id) {
            <div class="history-card">
              <div class="card-header">
                <div>
                  <h3 class="workout-name">{{ workout.name }}</h3>
                  <div class="workout-meta">
                    <span>📅 {{ workout.startTime | date:'dd/MM/yyyy HH:mm' }}</span>
                    <span>⏱️ {{ workout.durationMinutes > 0 ? workout.durationMinutes + ' min' : 'En cours...' }}</span>
                  </div>
                </div>
                <!-- Badge avec la couleur (terminé ou en cours) -->
                @if (workout.isOngoing) {
                  <span class="status-badge ongoing">En cours</span>
                } @else {
                  <span class="status-badge done">Terminé</span>
                }
              </div>

              <div class="exercises-summary">
                <span class="summary-label">Exercices ({{ workout.sessionExercises.length }}) :</span>
                <p class="summary-list">
                  {{ getExercisesSummary(workout) }}
                </p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .history-container { padding: 48px 24px; max-width: 800px; margin: 0 auto; }
    .page-title { font-size: 32px; font-weight: 700; color: var(--text-primary, #1D1D1F); margin-bottom: 32px; letter-spacing: -0.5px; }

    .timeline { display: flex; flex-direction: column; gap: 16px; }

    .history-card { background: var(--bg, #FFF); border: 1px solid var(--border, #E5E5EA); border-radius: 16px; padding: 20px; transition: box-shadow 0.2s; }
    .history-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .workout-name { font-size: 18px; font-weight: 600; color: var(--text-primary, #1D1D1F); margin-bottom: 4px; }
    .workout-meta { display: flex; gap: 16px; font-size: 13px; color: var(--text-secondary, #6E6E73); font-weight: 500; }

    .status-badge { padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; }
    .status-badge.done { background: rgba(52,199,89,0.1); color: #34C759; }
    .status-badge.ongoing { background: rgba(0,113,227,0.1); color: #0071E3; }

    .exercises-summary { background: var(--surface, #F5F5F7); padding: 12px; border-radius: 12px; }
    .summary-label { font-size: 13px; font-weight: 600; color: var(--text-primary, #1D1D1F); display: block; margin-bottom: 4px; }
    .summary-list { font-size: 14px; color: var(--text-secondary, #6E6E73); line-height: 1.5; margin: 0; }

    .empty-state { text-align: center; padding: 64px 24px; background: var(--surface, #F5F5F7); border-radius: 16px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; font-weight: 600; color: var(--text-primary, #1D1D1F); margin-bottom: 8px; }
    .empty-state p { color: var(--text-secondary, #6E6E73); }
    .loading-state { text-align: center; color: var(--text-secondary, #6E6E73); padding: 48px 0; }

    :host-context(.dark) {
      .history-card { background: var(--surface, #1C1C1E); border-color: var(--border, #38383A); }
      .exercises-summary, .empty-state { background: #000; }
    }
  `]
})
export class WorkoutHistoryComponent implements OnInit {
    workouts = signal<Workout[]>([]);
    isLoading = signal(true);

    constructor(private workoutService: WorkoutService) { }

    ngOnInit() {
        this.loadHistory();
    }

    loadHistory() {
        this.workoutService.getHistory().subscribe({
            next: (data) => {
                this.workouts.set(data);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    getExercisesSummary(workout: Workout): string {
        if (workout.sessionExercises.length === 0) return 'Aucun exercice';
        return workout.sessionExercises.map(se => se.exercise.name).join(' • ');
    }
}
