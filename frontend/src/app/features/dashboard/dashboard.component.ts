import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { StatsService, UserStatsSummary, OneRmProgression } from '../../core/services/stats.service';
import { ExerciseService, Exercise } from '../../core/services/exercise.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, FormsModule],
    template: `
    <div class="dashboard-container apple-style">
      <header class="header">
        <h1>Tableau de bord</h1>
        <p class="subtitle">Vos statistiques et votre progression</p>
      </header>

      <section class="summary-cards" *ngIf="summary()">
        <div class="card val-card">
          <div class="card-title">Séances</div>
          <div class="card-value">{{ summary()?.totalWorkouts }}</div>
        </div>
        <div class="card val-card">
          <div class="card-title">Volume levé</div>
          <div class="card-value">{{ summary()?.totalVolumeKg | number:'1.0-1' }} <span class="unit">kg</span></div>
        </div>
        <div class="card val-card">
          <div class="card-title">Séries complétées</div>
          <div class="card-value">{{ summary()?.totalSets }}</div>
        </div>
        <div class="card val-card">
          <div class="card-title">Répétitions</div>
          <div class="card-value">{{ summary()?.totalReps }}</div>
        </div>
      </section>

      <section class="charts-section">
        <div class="chart-card">
          <div class="chart-header">
            <h2>Progression 1RM</h2>
            <select class="apple-select" [ngModel]="selectedExerciseId()" (ngModelChange)="onExerciseSelect($event)">
              <option value="" disabled>Sélectionner un exercice</option>
              <option *ngFor="let ex of exercises()" [value]="ex.id">{{ ex.name }}</option>
            </select>
          </div>
          
          <div class="chart-wrapper" *ngIf="lineChartData()">
            <canvas baseChart
              [data]="lineChartData()!"
              [options]="lineChartOptions"
              [type]="'line'">
            </canvas>
          </div>
          
          <div class="empty-state" *ngIf="!lineChartData() && selectedExerciseId()">
            <p>Aucune donnée de progression pour cet exercice.</p>
          </div>
          <div class="empty-state" *ngIf="!selectedExerciseId()">
            <p>Sélectionnez un exercice pour voir votre progression.</p>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h2>Fréquence d'entraînement</h2>
          </div>
          <div class="chart-wrapper" *ngIf="barChartData()">
            <canvas baseChart
              [data]="barChartData()!"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
           <div class="empty-state" *ngIf="!barChartData()">
            <p>Aucune donnée disponible.</p>
          </div>
        </div>
      </section>
    </div>
  `,
    styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease-out;
    }
    .header { margin-bottom: 32px; }
    h1 { font-size: 2.2rem; font-weight: 700; margin: 0 0 8px; color: var(--app-text); }
    .subtitle { color: var(--app-text-secondary); font-size: 1.1rem; margin: 0; }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .card {
      background: var(--app-surface);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      border: 1px solid var(--app-border);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .card-title { font-size: 0.95rem; font-weight: 600; color: var(--app-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .card-value { font-size: 2.5rem; font-weight: 700; color: var(--app-primary); }
    .unit { font-size: 1.2rem; font-weight: 600; color: var(--app-text-secondary); }

    .charts-section {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    @media(min-width: 900px) {
      .charts-section { grid-template-columns: 1fr 1fr; }
    }
    .chart-card {
      background: var(--app-surface);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      border: 1px solid var(--app-border);
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .chart-header h2 { font-size: 1.4rem; font-weight: 600; margin: 0; color: var(--app-text); }
    
    .apple-select {
      appearance: none;
      background: var(--app-bg);
      border: 1px solid var(--app-border);
      border-radius: 10px;
      padding: 8px 16px;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--app-text);
      cursor: pointer;
      outline: none;
      transition: all 0.2s;
    }
    .apple-select:focus { border-color: var(--app-primary); box-shadow: 0 0 0 3px rgba(0,113,227,0.1); }
    
    .chart-wrapper {
      position: relative;
      width: 100%;
      height: 300px;
    }
    .empty-state {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--app-text-secondary);
      font-style: italic;
      background: var(--app-bg);
      border-radius: 12px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent implements OnInit {
    private statsService = inject(StatsService);
    private exerciseService = inject(ExerciseService);

    summary = signal<UserStatsSummary | null>(null);
    exercises = signal<Exercise[]>([]);
    selectedExerciseId = signal<string>('');

    lineChartData = signal<ChartData<'line'> | null>(null);
    barChartData = signal<ChartData<'bar'> | null>(null);

    // Options communes Chart.js (Style Apple)
    public lineChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(29, 29, 31, 0.8)',
                titleFont: { size: 13, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
                bodyFont: { size: 14, weight: 'bold', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context: any) => `${context.parsed.y} kg`
                }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: '-apple-system...' } } },
            y: { border: { display: false }, grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: false, suggestedMin: 0 }
        },
        elements: {
            line: { tension: 0.4 }, // Smooth curves
            point: { radius: 4, hoverRadius: 6 }
        }
    };

    public barChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(29, 29, 31, 0.8)',
                cornerRadius: 8,
                padding: 12,
                displayColors: false
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: { border: { display: false }, grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true, ticks: { stepSize: 1 } }
        },
        elements: {
            bar: { borderRadius: 6, borderSkipped: false }
        }
    };

    ngOnInit(): void {
        this.loadSummary();
        this.loadHeatmap();
        this.loadExercises();
    }

    private loadSummary() {
        this.statsService.getSummary().subscribe(data => this.summary.set(data));
    }

    private loadHeatmap() {
        this.statsService.getHeatmap().subscribe(data => {
            if (data && data.length > 0) {
                // Grouper par date ou traiter simplement
                this.barChartData.set({
                    labels: data.map(d => d.date), // Les dates YYYY-MM-DD
                    datasets: [
                        {
                            data: data.map(d => d.count),
                            backgroundColor: '#0071E3',
                            hoverBackgroundColor: '#005bb5',
                            barThickness: 'flex',
                            maxBarThickness: 40
                        }
                    ]
                });
            }
        });
    }

    private loadExercises() {
        this.exerciseService.listAll().subscribe(exs => {
            // Trier alphabétiquement
            exs.sort((a, b) => a.name.localeCompare(b.name));
            this.exercises.set(exs);

            // Sélectionner le premier par défaut si dispo
            if (exs.length > 0) {
                const polyArticular = exs.find(e => ['Pectoraux', 'Dos', 'Jambes'].includes(e.muscleGroup));
                const defaultId = polyArticular ? polyArticular.id : exs[0].id;
                this.selectedExerciseId.set(defaultId);
                this.load1RmProgression(defaultId);
            }
        });
    }

    onExerciseSelect(exId: string) {
        this.selectedExerciseId.set(exId);
        this.load1RmProgression(exId);
    }

    private load1RmProgression(exerciseId: string) {
        this.statsService.getOneRmProgression(exerciseId).subscribe(data => {
            if (data && data.length > 0) {
                this.lineChartData.set({
                    labels: data.map(d => d.date),
                    datasets: [
                        {
                            data: data.map(d => d.estimated1RM),
                            borderColor: '#34C759',
                            backgroundColor: 'rgba(52, 199, 89, 0.1)',
                            fill: true,
                            borderWidth: 3,
                            pointBackgroundColor: '#FFFFFF',
                            pointBorderColor: '#34C759',
                            pointBorderWidth: 2
                        }
                    ]
                });
            } else {
                this.lineChartData.set(null);
            }
        });
    }
}
