import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MeasurementService, Measurement, CreateOrUpdateMeasurementRequest } from '../../core/services/measurement.service';

@Component({
    selector: 'app-measurements',
    standalone: true,
    imports: [CommonModule, FormsModule, BaseChartDirective],
    template: `
    <div class="measurements-container apple-style">
      <header class="header">
        <h1>Mensurations</h1>
        <p class="subtitle">Suivez l'évolution de votre corps</p>
      </header>

      <div class="split-layout">
        <section class="form-section">
          <div class="apple-card">
            <h2>Nouvelle mesure</h2>
            <form (ngSubmit)="onSubmit()" class="meas-form">
              <div class="form-group">
                <label>Date</label>
                <input type="date" [(ngModel)]="newMeasurement.date" name="date" required class="apple-input">
              </div>

              <div class="metrics-grid">
                <div class="form-group">
                  <label>Poids (kg)</label>
                  <input type="number" step="0.1" [(ngModel)]="newMeasurement.weightKg" name="weightKg" class="apple-input" placeholder="Ex: 75.5">
                </div>
                <div class="form-group">
                  <label>Masse grasse (%)</label>
                  <input type="number" step="0.1" [(ngModel)]="newMeasurement.bodyFatPercentage" name="bodyFat" class="apple-input" placeholder="Ex: 15.0">
                </div>
                <div class="form-group">
                  <label>Poitrine (cm)</label>
                  <input type="number" step="0.5" [(ngModel)]="newMeasurement.chestCm" name="chestCm" class="apple-input" placeholder="Ex: 100">
                </div>
                <div class="form-group">
                  <label>Taille / Ventre (cm)</label>
                  <input type="number" step="0.5" [(ngModel)]="newMeasurement.waistCm" name="waistCm" class="apple-input" placeholder="Ex: 85">
                </div>
                <div class="form-group">
                  <label>Bras (cm)</label>
                  <input type="number" step="0.5" [(ngModel)]="newMeasurement.armsCm" name="armsCm" class="apple-input" placeholder="Ex: 38">
                </div>
                <div class="form-group">
                  <label>Cuisses (cm)</label>
                  <input type="number" step="0.5" [(ngModel)]="newMeasurement.legsCm" name="legsCm" class="apple-input" placeholder="Ex: 60">
                </div>
                <div class="form-group">
                  <label>Mollets (cm)</label>
                  <input type="number" step="0.5" [(ngModel)]="newMeasurement.calvesCm" name="calvesCm" class="apple-input" placeholder="Ex: 37">
                </div>
              </div>

              <div class="form-group full-width">
                <label>Notes</label>
                <textarea [(ngModel)]="newMeasurement.notes" name="notes" class="apple-input" placeholder="Commentaires..."></textarea>
              </div>

              <button type="submit" class="apple-btn primary" [disabled]="isSubmitting()">
                {{ isSubmitting() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </form>
          </div>
        </section>

        <section class="charts-section">
          <div class="apple-card">
            <div class="chart-header">
              <h2>Évolution du poids</h2>
            </div>
            <div class="chart-wrapper" *ngIf="weightChartData()">
              <canvas baseChart
                [data]="weightChartData()!"
                [options]="lineChartOptions"
                [type]="'line'">
              </canvas>
            </div>
            <div class="empty-state" *ngIf="!weightChartData()">
              <p>Pas assez de données pour afficher le graphique.</p>
            </div>
          </div>
        </section>
      </div>

      <section class="history-section">
        <h2>Historique</h2>
        <div class="table-container" *ngIf="measurements().length > 0; else noHistory">
          <table class="apple-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Poids</th>
                <th>Body Fat</th>
                <th>Bras</th>
                <th>Taille</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of measurements()">
                <td>{{ m.date | date:'dd/MM/yyyy' }}</td>
                <td>{{ m.weightKg ? m.weightKg + ' kg' : '-' }}</td>
                <td>{{ m.bodyFatPercentage ? m.bodyFatPercentage + ' %' : '-' }}</td>
                <td>{{ m.armsCm ? m.armsCm + ' cm' : '-' }}</td>
                <td>{{ m.waistCm ? m.waistCm + ' cm' : '-' }}</td>
                <td>
                  <button class="icon-btn delete" (click)="deleteMeasurement(m.id)" title="Supprimer">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noHistory>
          <p class="empty-text">Aucune mensuration enregistrée.</p>
        </ng-template>
      </section>

    </div>
  `,
    styles: [`
    .measurements-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease-out;
    }
    .header { margin-bottom: 32px; }
    h1 { font-size: 2.2rem; font-weight: 700; margin: 0 0 8px; color: var(--app-text); }
    .subtitle { color: var(--app-text-secondary); font-size: 1.1rem; margin: 0; }
    
    .split-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    @media(min-width: 900px) {
      .split-layout { grid-template-columns: 400px 1fr; }
    }

    .apple-card {
      background: var(--app-surface);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      border: 1px solid var(--app-border);
    }
    .apple-card h2 { font-size: 1.4rem; font-weight: 600; margin: 0 0 20px; color: var(--app-text); }

    .meas-form { display: flex; flex-direction: column; gap: 16px; }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: 1 / -1; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--app-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    
    .apple-input {
      background: var(--app-bg);
      border: 1px solid var(--app-border);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 1rem;
      color: var(--app-text);
      transition: all 0.2s;
    }
    .apple-input:focus { border-color: var(--app-primary); box-shadow: 0 0 0 3px rgba(0,113,227,0.1); outline: none; }
    textarea.apple-input { resize: vertical; min-height: 80px; }

    .apple-btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .apple-btn.primary { background: var(--app-primary); color: white; margin-top: 8px; }
    .apple-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,113,227,0.3); }
    .apple-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .chart-wrapper { position: relative; width: 100%; height: 350px; }
    .empty-state { height: 350px; display: flex; align-items: center; justify-content: center; color: var(--app-text-secondary); font-style: italic; background: var(--app-bg); border-radius: 12px; }

    /* Table styles */
    .history-section h2 { font-size: 1.6rem; margin-bottom: 20px; color: var(--app-text); }
    .table-container { background: var(--app-surface); border-radius: 16px; overflow: hidden; border: 1px solid var(--app-border); }
    .apple-table { width: 100%; border-collapse: collapse; text-align: left; }
    .apple-table th, .apple-table td { padding: 14px 16px; border-bottom: 1px solid var(--app-border); }
    .apple-table th { background: var(--app-bg); color: var(--app-text-secondary); font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .apple-table td { color: var(--app-text); font-size: 0.95rem; }
    .apple-table tr:last-child td { border-bottom: none; }
    
    .icon-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--app-text-secondary); padding: 4px; border-radius: 6px; transition: all 0.2s; }
    .icon-btn.delete:hover { color: var(--app-danger); background: rgba(255, 59, 48, 0.1); }
    .empty-text { color: var(--app-text-secondary); font-style: italic; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MeasurementsComponent implements OnInit {
    private service = inject(MeasurementService);

    measurements = signal<Measurement[]>([]);
    weightChartData = signal<ChartData<'line'> | null>(null);

    isSubmitting = signal(false);

    newMeasurement: CreateOrUpdateMeasurementRequest = {
        date: new Date().toISOString().split('T')[0]
    };

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
            x: { grid: { display: false } },
            y: { border: { display: false }, grid: { color: 'rgba(0,0,0,0.05)' } }
        },
        elements: {
            line: { tension: 0.4 },
            point: { radius: 4, hoverRadius: 6 }
        }
    };

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.service.getAll().subscribe(data => {
            // Les données viennent triées par date DESC du backend (logiquement).
            // On va les garder comme ça pour le tableau, mais pour le chart il faut ASC.
            this.measurements.set(data);
            this.updateChart(data);
        });
    }

    updateChart(data: Measurement[]) {
        const withWeight = data.filter(m => m.weightKg != null)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (withWeight.length >= 2) {
            this.weightChartData.set({
                labels: withWeight.map(w => {
                    const d = new Date(w.date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                }),
                datasets: [{
                    data: withWeight.map(w => w.weightKg!),
                    borderColor: '#0071E3',
                    backgroundColor: 'rgba(0, 113, 227, 0.1)',
                    fill: true,
                    borderWidth: 3,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#0071E3',
                    pointBorderWidth: 2
                }]
            });
        } else {
            this.weightChartData.set(null);
        }
    }

    onSubmit() {
        this.isSubmitting.set(true);
        // Nettoyer les champs vides pour ne pas envoyer ""
        const payload = { ...this.newMeasurement };

        this.service.save(payload).subscribe({
            next: () => {
                this.loadData();
                // Reset partiel
                this.newMeasurement = {
                    date: new Date().toISOString().split('T')[0]
                };
                this.isSubmitting.set(false);
            },
            error: (err) => {
                console.error(err);
                this.isSubmitting.set(false);
            }
        });
    }

    deleteMeasurement(id: string) {
        if (confirm('Supprimer cette relevé ?')) {
            this.service.delete(id).subscribe(() => this.loadData());
        }
    }
}
