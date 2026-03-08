import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Exercise } from './exercise.service';

export interface WorkoutSet {
    id: string;
    setOrder: number;
    weightKg: number;
    reps: number;
    isWarmup: boolean;
    isCompleted: boolean;
    estimated1RM: number | null; // Répétition Maximale calculée par le back
}

export interface WorkoutSessionExercise {
    id: string;
    exercise: Exercise;
    orderIndex: number;
    notes: string | null;
    sets: WorkoutSet[];
}

export interface Workout {
    id: string;
    programDayId: string | null;
    name: string;
    startTime: string; // ISO Instant
    endTime: string | null;
    isOngoing: boolean;
    durationMinutes: number;
    notes: string | null;
    sessionExercises: WorkoutSessionExercise[];
}

export interface UpdateSetRequest {
    setId: string | null;
    exerciseId: string;
    weightKg: number;
    reps: number;
    isWarmup: boolean;
    isCompleted: boolean;
    setOrder: number;
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
    private readonly apiUrl = `${environment.apiUrl}/workouts`;

    constructor(private http: HttpClient) { }

    getHistory(): Observable<Workout[]> {
        return this.http.get<Workout[]>(`${this.apiUrl}/history`);
    }

    getActiveWorkout(): Observable<Workout | null> {
        return this.http.get<Workout | null>(`${this.apiUrl}/active`);
    }

    startWorkout(name: string, programDayId?: string): Observable<Workout> {
        return this.http.post<Workout>(`${this.apiUrl}/start`, { name, programDayId });
    }

    addExerciseToWorkout(workoutId: string, exerciseId: string): Observable<Workout> {
        return this.http.post<Workout>(`${this.apiUrl}/${workoutId}/exercises/${exerciseId}`, {});
    }

    updateSet(workoutId: string, request: UpdateSetRequest): Observable<Workout> {
        return this.http.put<Workout>(`${this.apiUrl}/${workoutId}/sets`, request);
    }

    deleteSet(workoutId: string, exerciseId: string, setId: string): Observable<Workout> {
        return this.http.delete<Workout>(`${this.apiUrl}/${workoutId}/exercises/${exerciseId}/sets/${setId}`);
    }

    finishWorkout(workoutId: string): Observable<Workout> {
        return this.http.post<Workout>(`${this.apiUrl}/${workoutId}/finish`, {});
    }

    cancelWorkout(workoutId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${workoutId}`);
    }
}
