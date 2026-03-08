import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    category: string;
    description: string | null;
    imageUrl: string | null;
    isCustom: boolean;
}

export interface CreateExerciseRequest {
    name: string;
    muscleGroup: string;
    category: string;
    description?: string;
}

/** Labels français pour les groupes musculaires */
export const MUSCLE_GROUPS: Record<string, string> = {
    chest: 'Pectoraux', back: 'Dos', shoulders: 'Épaules',
    biceps: 'Biceps', triceps: 'Triceps', legs: 'Jambes',
    core: 'Abdominaux', full_body: 'Full Body'
};

/** Labels français pour les catégories */
export const CATEGORIES: Record<string, string> = {
    barbell: 'Barre', dumbbell: 'Haltères', machine: 'Machine',
    cable: 'Poulie', bodyweight: 'Poids du corps', cardio: 'Cardio',
    stretching: 'Étirement'
};

@Injectable({ providedIn: 'root' })
export class ExerciseService {
    private readonly apiUrl = `${environment.apiUrl}/exercises`;

    constructor(private http: HttpClient) { }

    listAll(muscleGroup?: string): Observable<Exercise[]> {
        let params = new HttpParams();
        if (muscleGroup) params = params.set('muscle', muscleGroup);
        return this.http.get<Exercise[]>(this.apiUrl, { params });
    }

    getById(id: string): Observable<Exercise> {
        return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
    }

    createCustom(request: CreateExerciseRequest): Observable<Exercise> {
        return this.http.post<Exercise>(this.apiUrl, request);
    }

    deleteCustom(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
