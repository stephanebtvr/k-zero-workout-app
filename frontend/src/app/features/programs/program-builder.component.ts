import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProgramService } from '../../core/services/program.service';
import { ExerciseService, Exercise } from '../../core/services/exercise.service';

@Component({
    selector: 'app-program-builder',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="builder-container">
      <div class="header">
        <h1 class="page-title">Créer un programme</h1>
        <button class="btn-secondary" routerLink="/programs">Annuler</button>
      </div>

      <form [formGroup]="programForm" (ngSubmit)="onSubmit()" class="builder-form">
        <!-- Infos globales -->
        <div class="form-section">
          <div class="form-group">
            <label>Nom du programme *</label>
            <input type="text" formControlName="name" placeholder="Ex: PPL 3 jours"
                   [class.invalid]="programForm.get('name')?.invalid && programForm.get('name')?.touched">
          </div>
          <div class="form-group">
            <label>Description (optionnelle)</label>
            <textarea formControlName="description" placeholder="Objectifs de la routine..." rows="2"></textarea>
          </div>
        </div>

        <!-- Jours (Days) -->
        <div formArrayName="days" class="days-container">
          <div class="days-header">
            <h3>Jours d'entraînement</h3>
            <button type="button" class="btn-text" (click)="addDay()">+ Ajouter un jour</button>
          </div>

          @for (dayCtrl of days.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="day-card">
              <div class="day-header">
                <input type="text" formControlName="name" placeholder="Nom du jour (ex: Push)" class="day-name-input">
                <button type="button" class="action-btn delete-btn" (click)="removeDay(i)">✕</button>
              </div>

              <!-- Exercices dans le jour -->
              <div formArrayName="exercises" class="exercises-container">
                @for (exCtrl of getDayExercises(i).controls; track $index; let j = $index) {
                  <div [formGroupName]="j" class="exercise-row">
                    <div class="ex-select-group">
                      <select formControlName="exerciseId" class="ex-select">
                        <option value="" disabled selected>Choisir un exercice...</option>
                        @for (exercise of availableExercises(); track exercise.id) {
                          <option [value]="exercise.id">{{ exercise.name }} ({{ getMuscleLabel(exercise.muscleGroup) }})</option>
                        }
                      </select>
                    </div>

                    <div class="ex-metrics">
                      <input type="number" formControlName="targetSets" placeholder="Séries" title="Séries" class="metric-input" min="1">
                      <span class="x-divider">×</span>
                      <input type="text" formControlName="targetReps" placeholder="Reps (ex: 8-12)" title="Répétitions" class="metric-input reps-input">
                      <div class="rest-group">
                        <input type="number" formControlName="restTimeSeconds" placeholder="90" title="Temps de repos (sec)" class="metric-input" min="0">
                        <span class="sec-label">s</span>
                      </div>
                      <button type="button" class="remove-ex-btn" (click)="removeExercise(i, j)">×</button>
                    </div>
                  </div>
                }
                <button type="button" class="btn-text add-ex-btn" (click)="addExercise(i)">+ Ajouter un exercice</button>
              </div>
            </div>
          }
          @if (days.length === 0) {
            <p class="error-text">Un programme doit contenir au moins un jour.</p>
          }
        </div>

        <button type="submit" class="btn-primary" [disabled]="programForm.invalid || isSubmitting()">
          {{ isSubmitting() ? 'Enregistrement...' : 'Enregistrer le programme' }}
        </button>
      </form>
    </div>
  `,
    styles: [`
    .builder-container { padding: 48px 24px; max-width: 800px; margin: 0 auto; padding-bottom: 80px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .page-title { font-size: 32px; font-weight: 700; color: var(--text-primary, #1D1D1F); letter-spacing: -0.5px; }

    .btn-primary {
      background: var(--accent, #0071E3); color: #FFF; border: none; padding: 14px 24px;
      border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;
      width: 100%; transition: background 0.2s; margin-top: 32px;
    }
    .btn-primary:disabled { background: var(--text-secondary, #A1A1A6); cursor: not-allowed; }
    .btn-secondary { background: var(--surface, #F5F5F7); color: var(--text-primary, #1D1D1F); border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: 500;}
    .btn-text { background: none; border: none; color: var(--accent, #0071E3); font-weight: 600; cursor: pointer; padding: 0; }

    .form-section { background: var(--bg, #FFF); padding: 24px; border-radius: 16px; border: 1px solid var(--border, #E5E5EA); margin-bottom: 24px; }
    .form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
    .form-group:last-child { margin-bottom: 0; }
    label { font-size: 14px; font-weight: 500; color: var(--text-secondary, #6E6E73); }
    input[type="text"], input[type="number"], textarea, select {
      padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border, #E5E5EA);
      background: var(--surface, #F5F5F7); color: var(--text-primary, #1D1D1F); font-size: 15px; outline: none; transition: border-color 0.2s;
    }
    input:focus, textarea:focus, select:focus { border-color: var(--accent, #0071E3); }
    input.invalid { border-color: #FF3B30; }

    .days-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .days-header h3 { font-size: 20px; font-weight: 600; color: var(--text-primary, #1D1D1F); }

    .day-card { background: var(--surface, #F5F5F7); padding: 16px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--border, #E5E5EA); }
    .day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; }
    .day-name-input { font-size: 16px !important; font-weight: 600; flex: 1; background: var(--bg, #FFF) !important; padding: 8px 12px !important;}

    .exercises-container { display: flex; flex-direction: column; gap: 8px; }
    .exercise-row { display: flex; gap: 12px; align-items: center; background: var(--bg, #FFF); padding: 8px; border-radius: 10px; flex-wrap: wrap; }
    .ex-select-group { flex: 1; min-width: 200px; }
    .ex-select { width: 100%; padding: 8px 12px !important; }

    .ex-metrics { display: flex; align-items: center; gap: 8px; }
    .metric-input { width: 60px; padding: 8px !important; text-align: center; }
    .reps-input { width: 80px; }
    .x-divider { color: var(--text-secondary, #6E6E73); font-weight: 600; }
    .rest-group { display: flex; align-items: center; background: var(--surface, #F5F5F7); border-radius: 8px; padding-right: 8px;}
    .rest-group .metric-input { border: none; background: transparent; }
    .sec-label { color: var(--text-secondary, #6E6E73); font-size: 12px; }

    .remove-ex-btn, .delete-btn { background: none; border: none; color: var(--text-secondary, #6E6E73); font-size: 18px; cursor: pointer; padding: 4px; border-radius: 6px; }
    .remove-ex-btn:hover, .delete-btn:hover { color: #FF3B30; background: rgba(255,59,48,0.1); }
    .add-ex-btn { margin-top: 8px; font-size: 14px; }
    .error-text { color: #FF3B30; font-size: 14px; margin-top: 8px; }

    :host-context(.dark) {
      .form-section, .exercise-row, .day-name-input { background: var(--surface, #1C1C1E) !important; border-color: var(--border, #38383A); }
      .day-card, input[type="text"], input[type="number"], textarea, select, .rest-group { background: #000 !important; border-color: var(--border, #38383A); }
    }
  `]
})
export class ProgramBuilderComponent implements OnInit {
    programForm: FormGroup;
    availableExercises = signal<Exercise[]>([]);
    isSubmitting = signal(false);

    // Mappings pour affichage rapide
    private muscleMap: Record<string, string> = {
        chest: 'Pec', back: 'Dos', shoulders: 'Épaules', biceps: 'Biceps',
        triceps: 'Triceps', legs: 'Jambes', core: 'Abdos', full_body: 'Full Body'
    };

    constructor(
        private fb: FormBuilder,
        private programService: ProgramService,
        private exerciseService: ExerciseService,
        private router: Router
    ) {
        this.programForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            days: this.fb.array([], Validators.minLength(1))
        });
    }

    ngOnInit() {
        this.exerciseService.listAll().subscribe(exs => this.availableExercises.set(exs));
        this.addDay(); // Ajoute un jour par défaut
    }

    getMuscleLabel(key: string): string { return this.muscleMap[key] || key; }

    get days() { return this.programForm.get('days') as FormArray; }

    getDayExercises(dayIndex: number) {
        return this.days.at(dayIndex).get('exercises') as FormArray;
    }

    addDay() {
        const dayForm = this.fb.group({
            name: ['', Validators.required],
            exercises: this.fb.array([])
        });
        this.days.push(dayForm);
    }

    removeDay(index: number) { this.days.removeAt(index); }

    addExercise(dayIndex: number) {
        const exForm = this.fb.group({
            exerciseId: ['', Validators.required],
            targetSets: [3, [Validators.required, Validators.min(1)]],
            targetReps: ['8-12', Validators.required],
            restTimeSeconds: [90, [Validators.required, Validators.min(0)]]
        });
        this.getDayExercises(dayIndex).push(exForm);
    }

    removeExercise(dayIndex: number, exIndex: number) {
        this.getDayExercises(dayIndex).removeAt(exIndex);
    }

    onSubmit() {
        if (this.programForm.invalid) {
            this.programForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        const formValue = this.programForm.value;

        // Mapper les données du formulaire vers le format API (en ajoutant les 'order')
        const request = {
            name: formValue.name,
            description: formValue.description,
            days: formValue.days.map((day: any, dIndex: number) => ({
                name: day.name,
                dayOrder: dIndex + 1,
                exercises: day.exercises.map((ex: any, eIndex: number) => ({
                    exerciseId: ex.exerciseId,
                    exerciseOrder: eIndex + 1,
                    targetSets: ex.targetSets,
                    targetReps: ex.targetReps,
                    restTimeSeconds: ex.restTimeSeconds
                }))
            }))
        };

        this.programService.createProgram(request).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.router.navigate(['/programs']);
            },
            error: () => {
                alert('Erreur lors de la création du programme. Vérifiez les champs.');
                this.isSubmitting.set(false);
            }
        });
    }
}
