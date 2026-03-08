import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Exercise } from './exercise.service';

export interface ProgramExercise {
    id?: string;
    exercise: Exercise;
    exerciseOrder: number;
    targetSets: number;
    targetReps: string;
    restTimeSeconds: number;
}

export interface ProgramDay {
    id?: string;
    name: string;
    dayOrder: number;
    exercises: ProgramExercise[];
}

export interface WorkoutProgram {
    id: string;
    name: string;
    description: string | null;
    createdBy: string;
    days: ProgramDay[];
}

export interface CreateProgramRequest {
    name: string;
    description?: string;
    days: {
        name: string;
        dayOrder: number;
        exercises: {
            exerciseId: string;
            exerciseOrder: number;
            targetSets: number;
            targetReps: string;
            restTimeSeconds: number;
        }[];
    }[];
}

@Injectable({ providedIn: 'root' })
export class ProgramService {
    private readonly apiUrl = `${environment.apiUrl}/programs`;

    constructor(private http: HttpClient) { }

    listPrograms(): Observable<WorkoutProgram[]> {
        return this.http.get<WorkoutProgram[]>(this.apiUrl);
    }

    getProgram(id: string): Observable<WorkoutProgram> {
        return this.http.get<WorkoutProgram>(`${this.apiUrl}/${id}`);
    }

    createProgram(request: CreateProgramRequest): Observable<WorkoutProgram> {
        return this.http.post<WorkoutProgram>(this.apiUrl, request);
    }

    deleteProgram(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
