import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Measurement {
    id: string;
    date: string;
    weightKg?: number;
    bodyFatPercentage?: number;
    chestCm?: number;
    waistCm?: number;
    armsCm?: number;
    legsCm?: number;
    calvesCm?: number;
    notes?: string;
    bmi?: number;
}

export interface CreateOrUpdateMeasurementRequest {
    date: string;
    weightKg?: number;
    bodyFatPercentage?: number;
    chestCm?: number;
    waistCm?: number;
    armsCm?: number;
    legsCm?: number;
    calvesCm?: number;
    notes?: string;
}

@Injectable({ providedIn: 'root' })
export class MeasurementService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/measurements`;

    getAll(): Observable<Measurement[]> {
        return this.http.get<Measurement[]>(this.apiUrl);
    }

    save(request: CreateOrUpdateMeasurementRequest): Observable<Measurement> {
        return this.http.post<Measurement>(this.apiUrl, request);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
