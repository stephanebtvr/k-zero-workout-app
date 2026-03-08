import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserStatsSummary {
    totalWorkouts: number;
    totalVolumeKg: number;
    totalSets: number;
    totalReps: number;
}

export interface HeatmapData {
    date: string;
    count: number;
}

export interface OneRmProgression {
    date: string;
    estimated1RM: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/stats`;

    getSummary(): Observable<UserStatsSummary> {
        return this.http.get<UserStatsSummary>(`${this.apiUrl}/summary`);
    }

    getHeatmap(): Observable<HeatmapData[]> {
        return this.http.get<HeatmapData[]>(`${this.apiUrl}/heatmap`);
    }

    getOneRmProgression(exerciseId: string): Observable<OneRmProgression[]> {
        return this.http.get<OneRmProgression[]>(`${this.apiUrl}/1rm-progression`, { params: { exerciseId } });
    }
}
