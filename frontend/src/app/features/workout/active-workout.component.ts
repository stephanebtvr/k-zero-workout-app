import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WorkoutService, Workout, WorkoutSessionExercise, WorkoutSet } from '../../core/services/workout.service';

@Component({
    selector: 'app-active-workout',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="workout-container">
      @if (isLoading()) {
        <div class="loading-state">Chargement de la séance...</div>
      } @else if (workout()) {
        <div class="header">
          <div>
            <span class="pulse-dot"></span>
            <span class="live-label">Séance en cours</span>
          </div>
          <button class="btn-finish" (click)="finishWorkout()">Terminer</button>
        </div>

        <h1 class="workout-title">{{ workout()?.name }}</h1>
        <p class="workout-time">⏱️ {{ duration() }} min</p>

        <div class="exercises-list">
          @for (ex of workout()?.sessionExercises; track ex.id; let exIdx = $index) {
            <div class="exercise-card">
              <div class="ex-header">
                <h3>{{ ex.exercise.name }}</h3>
                <span class="muscle-badge">{{ ex.exercise.muscleGroup }}</span>
              </div>

              <!-- Tableau des Sets -->
              <div class="sets-table">
                <div class="set-row header-row">
                  <div class="col-set">Set</div>
                  <div class="col-weight">Poids (kg)</div>
                  <div class="col-reps">Reps</div>
                  <div class="col-check">✓</div>
                </div>

                @for (set of ex.sets; track set.id; let setIdx = $index) {
                  <div class="set-row" [class.completed]="set.isCompleted">
                    <div class="col-set">
                      <span class="set-number">{{ setIdx + 1 }}</span>
                    </div>
                    <div class="col-weight">
                      <input type="number" [(ngModel)]="set.weightKg" class="live-input" 
                             (change)="updateSet(ex.id, set)" [disabled]="set.isCompleted" min="0" step="0.5">
                    </div>
                    <div class="col-reps">
                      <input type="number" [(ngModel)]="set.reps" class="live-input" 
                             (change)="updateSet(ex.id, set)" [disabled]="set.isCompleted" min="0">
                    </div>
                    <div class="col-check">
                      <button class="check-btn" [class.active]="set.isCompleted" 
                              (click)="toggleSet(ex.id, set)">
                        {{ set.isCompleted ? '✓' : '' }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Affichage du 1RM sur les sets complétés -->
                  @if (set.isCompleted && set.estimated1RM) {
                    <div class="rm-badge">↳ Est. 1RM : {{ set.estimated1RM }} kg (Brzycki)</div>
                  }
                }
              </div>

              <button class="add-set-btn" (click)="addSet(ex.id, ex.sets.length)">+ Ajouter une série</button>
            </div>
          }
        </div>

        <!-- On pourrait ajouter un bouton "Ajouter un exercice" ici si besoin -->
        <button class="cancel-btn" (click)="cancelWorkout()">Annuler la séance (Supprimer)</button>

      } @else {
        <div class="empty-state">
          <h3>Aucune séance en cours</h3>
          <button class="btn-primary" routerLink="/programs">Démarrer depuis un programme</button>
          <button class="btn-secondary mt-2" (click)="startFreeWorkout()">Nouvelle séance libre</button>
        </div>
      }
    </div>
  `,
    styles: [`
    .workout-container { padding: 48px 24px; max-width: 600px; margin: 0 auto; padding-bottom: 100px; }
    
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .pulse-dot { display: inline-block; width: 10px; height: 10px; background: #34C759; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(52, 199, 89, 0); } 100% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); } }
    .live-label { font-weight: 600; color: #34C759; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .workout-title { font-size: 32px; font-weight: 700; color: var(--text-primary, #1D1D1F); margin-bottom: 8px; }
    .workout-time { font-size: 18px; color: var(--text-secondary, #6E6E73); font-weight: 500; margin-bottom: 32px; }

    .btn-finish { background: var(--accent, #0071E3); color: #FFF; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 600; cursor: pointer; }
    .cancel-btn { background: none; border: none; color: #FF3B30; font-weight: 600; cursor: pointer; width: 100%; margin-top: 32px; padding: 16px; border-radius: 12px; background: rgba(255,59,48,0.1); }

    .exercise-card { background: var(--bg, #FFF); border: 1px solid var(--border, #E5E5EA); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .ex-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .ex-header h3 { font-size: 18px; font-weight: 600; color: var(--text-primary, #1D1D1F); }
    .muscle-badge { background: var(--surface, #F5F5F7); padding: 4px 8px; border-radius: 6px; font-size: 12px; color: var(--text-secondary, #6E6E73); font-weight: 500; }

    .sets-table { width: 100%; display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .set-row { display: flex; align-items: center; gap: 12px; }
    .header-row { font-size: 12px; color: var(--text-secondary, #6E6E73); font-weight: 500; text-transform: uppercase; margin-bottom: 4px; }
    
    .col-set { width: 40px; text-align: center; font-weight: 600; color: var(--text-secondary, #6E6E73); }
    .col-weight, .col-reps { flex: 1; }
    .col-check { width: 48px; display: flex; justify-content: flex-end; }

    .live-input { 
      width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border, #E5E5EA); 
      background: var(--surface, #F5F5F7); text-align: center; font-size: 16px; font-weight: 600; color: var(--text-primary, #1D1D1F); outline: none;
    }
    .live-input:focus { border-color: var(--accent, #0071E3); background: var(--bg, #FFF); }
    .set-row.completed .live-input { background: #E5F1E8; color: #34C759; border-color: transparent; }

    .check-btn { 
      width: 36px; height: 36px; border-radius: 12px; border: 1px solid var(--border, #E5E5EA); 
      background: var(--surface, #F5F5F7); color: transparent; font-size: 18px; font-weight: 700; 
      cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .check-btn.active { background: #34C759; border-color: #34C759; color: #FFF; }

    .rm-badge { font-size: 12px; color: var(--accent, #0071E3); padding-left: 52px; font-weight: 500; }
    .add-set-btn { width: 100%; padding: 12px; background: none; border: 2px dashed var(--border, #E5E5EA); border-radius: 12px; color: var(--text-secondary, #6E6E73); font-weight: 600; cursor: pointer; }

    .empty-state { text-align: center; padding: 64px 24px; }
    .btn-primary { background: var(--accent, #0071E3); color: #FFF; border: none; padding: 14px 24px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; }
    .btn-secondary { background: var(--surface, #F5F5F7); color: var(--text-primary, #1D1D1F); border: none; padding: 14px 24px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; }
    .mt-2 { margin-top: 12px; }

    :host-context(.dark) {
      .exercise-card { background: var(--surface, #1C1C1E); border-color: var(--border, #38383A); }
      .live-input, .muscle-badge { background: #000; border-color: var(--border, #38383A); color: #FFF; }
      .add-set-btn { border-color: var(--border, #38383A); }
      .set-row.completed .live-input { background: rgba(52,199,89,0.15); }
    }
  `]
})
export class ActiveWorkoutComponent implements OnInit {
    workout = signal<Workout | null>(null);
    isLoading = signal(true);

    // Timer basique
    duration = computed(() => {
        const w = this.workout();
        if (!w) return 0;
        const start = new Date(w.startTime).getTime();
        const now = new Date().getTime();
        return Math.floor((now - start) / 60000); // en minutes
    });

    constructor(private workoutService: WorkoutService, private router: Router) { }

    ngOnInit() {
        this.checkActiveWorkout();
    }

    checkActiveWorkout() {
        this.isLoading.set(true);
        this.workoutService.getActiveWorkout().subscribe({
            next: (data) => {
                this.workout.set(data);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    startFreeWorkout() {
        this.isLoading.set(true);
        // Nom généré (ex: Séance du Soir)
        const name = `Séance libre (${new Date().toLocaleDateString()})`;
        this.workoutService.startWorkout(name).subscribe({
            next: (data) => {
                this.workout.set(data);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    updateSet(exerciseId: string, set: WorkoutSet) {
        if (!this.workout()) return;
        this.workoutService.updateSet(this.workout()!.id, {
            setId: set.id,
            exerciseId: exerciseId,
            weightKg: set.weightKg,
            reps: set.reps,
            isWarmup: set.isWarmup || false,
            isCompleted: set.isCompleted,
            setOrder: set.setOrder
        }).subscribe(data => this.workout.set(data));
    }

    toggleSet(exerciseId: string, set: WorkoutSet) {
        set.isCompleted = !set.isCompleted;
        this.updateSet(exerciseId, set);
    }

    addSet(exerciseId: string, currentSetCount: number) {
        if (!this.workout()) return;
        // Crée le set immédiatement, puis update
        const newOrder = currentSetCount + 1;
        this.workoutService.updateSet(this.workout()!.id, {
            setId: null,
            exerciseId: exerciseId,
            weightKg: 0,
            reps: 0,
            isWarmup: false,
            isCompleted: false,
            setOrder: newOrder
        }).subscribe(data => this.workout.set(data));
    }

    finishWorkout() {
        if (!this.workout()) return;
        if (confirm('Voulez-vous terminer cette séance ?')) {
            this.workoutService.finishWorkout(this.workout()!.id).subscribe(() => {
                alert('Séance terminée ! Bravo 👏');
                this.router.navigate(['/dashboard']);
            });
        }
    }

    cancelWorkout() {
        if (!this.workout()) return;
        if (confirm('Voulez-vous vraiment annuler (supprimer) cette séance en cours ?')) {
            this.workoutService.cancelWorkout(this.workout()!.id).subscribe(() => {
                this.workout.set(null);
                this.router.navigate(['/dashboard']);
            });
        }
    }
}
