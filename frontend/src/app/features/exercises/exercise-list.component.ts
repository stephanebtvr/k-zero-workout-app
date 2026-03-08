import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseService, Exercise, MUSCLE_GROUPS, CATEGORIES } from '../../core/services/exercise.service';

@Component({
    selector: 'app-exercise-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="exercise-container">
      <h1 class="page-title">Exercices</h1>

      <!-- Filtres par groupe musculaire -->
      <div class="filter-bar">
        <button class="filter-chip" [class.active]="!selectedMuscle()"
          (click)="onFilter(null)">Tous</button>
        @for (entry of muscleEntries; track entry[0]) {
          <button class="filter-chip" [class.active]="selectedMuscle() === entry[0]"
            (click)="onFilter(entry[0])">{{ entry[1] }}</button>
        }
      </div>

      <!-- Liste des exercices -->
      <div class="exercise-grid">
        @for (exercise of exercises(); track exercise.id) {
          <div class="exercise-card">
            <div class="card-header">
              <span class="card-emoji">{{ getEmoji(exercise.muscleGroup) }}</span>
              <div>
                <h3 class="card-title">{{ exercise.name }}</h3>
                <span class="card-badge">{{ getCategoryLabel(exercise.category) }}</span>
              </div>
            </div>
            @if (exercise.description) {
              <p class="card-desc">{{ exercise.description }}</p>
            }
            <div class="card-footer">
              <span class="card-muscle">{{ getMuscleLabel(exercise.muscleGroup) }}</span>
              @if (exercise.isCustom) {
                <span class="card-custom">Custom</span>
              }
            </div>
          </div>
        }
      </div>

      @if (exercises().length === 0 && !isLoading()) {
        <p class="empty-state">Aucun exercice trouvé.</p>
      }
    </div>
  `,
    styles: [`
    .exercise-container { padding: 48px 24px; max-width: 800px; margin: 0 auto; }
    .page-title { font-size: 32px; font-weight: 700; color: var(--text-primary, #1D1D1F); letter-spacing: -0.5px; margin-bottom: 24px; }

    .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
    .filter-chip {
      padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;
      border: 1px solid var(--border, #E5E5EA); background: var(--bg, #FFF);
      color: var(--text-secondary, #6E6E73); cursor: pointer; transition: all 200ms ease;
    }
    .filter-chip.active {
      background: var(--accent, #0071E3); color: #FFF; border-color: var(--accent, #0071E3);
    }
    .filter-chip:hover:not(.active) { background: var(--surface, #F5F5F7); }

    .exercise-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; }

    .exercise-card {
      padding: 16px; border-radius: 12px; border: 1px solid var(--border, #E5E5EA);
      background: var(--bg, #FFF); transition: box-shadow 200ms ease;
    }
    .exercise-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

    .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .card-emoji { font-size: 28px; }
    .card-title { font-size: 16px; font-weight: 600; color: var(--text-primary, #1D1D1F); }
    .card-badge {
      display: inline-block; font-size: 12px; color: var(--accent, #0071E3);
      background: rgba(0,113,227,0.08); padding: 2px 8px; border-radius: 6px; margin-top: 2px;
    }
    .card-desc { font-size: 14px; color: var(--text-secondary, #6E6E73); line-height: 1.4; margin-bottom: 8px; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .card-muscle { font-size: 12px; color: var(--text-secondary, #6E6E73); }
    .card-custom {
      font-size: 11px; font-weight: 600; color: var(--success, #34C759);
      background: rgba(52,199,89,0.1); padding: 2px 8px; border-radius: 6px;
    }

    .empty-state { text-align: center; color: var(--text-secondary, #6E6E73); padding: 48px 0; }

    :host-context(.dark) .exercise-card { background: var(--surface, #1C1C1E); border-color: var(--border, #38383A); }
  `]
})
export class ExerciseListComponent implements OnInit {
    exercises = signal<Exercise[]>([]);
    selectedMuscle = signal<string | null>(null);
    isLoading = signal(true);
    muscleEntries = Object.entries(MUSCLE_GROUPS);

    private emojiMap: Record<string, string> = {
        chest: '🫁', back: '🔙', shoulders: '💪', biceps: '💪',
        triceps: '💪', legs: '🦵', core: '🎯', full_body: '🏋️'
    };

    constructor(private exerciseService: ExerciseService) { }

    ngOnInit() { this.loadExercises(); }

    onFilter(muscle: string | null) {
        this.selectedMuscle.set(muscle);
        this.loadExercises();
    }

    getMuscleLabel(key: string): string { return MUSCLE_GROUPS[key] || key; }
    getCategoryLabel(key: string): string { return CATEGORIES[key] || key; }
    getEmoji(muscle: string): string { return this.emojiMap[muscle] || '🏋️'; }

    private loadExercises() {
        this.isLoading.set(true);
        this.exerciseService.listAll(this.selectedMuscle() || undefined).subscribe({
            next: (data) => { this.exercises.set(data); this.isLoading.set(false); },
            error: () => this.isLoading.set(false)
        });
    }
}
