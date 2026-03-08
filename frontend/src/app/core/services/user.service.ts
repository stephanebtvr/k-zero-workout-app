/**
 * UserService — Service Angular pour la gestion du profil utilisateur.
 *
 * Communique avec les endpoints /users/me du backend.
 * Le JWT est injecté automatiquement par l'intercepteur.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Profil complet de l'utilisateur */
export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string | null;
    heightCm: number | null;
    avatarUrl: string | null;
    createdAt: string;
}

/** DTO de mise à jour du profil */
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    heightCm?: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    /**
     * Récupère le profil de l'utilisateur connecté.
     */
    getProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.apiUrl}/me`);
    }

    /**
     * Met à jour le profil de l'utilisateur connecté.
     */
    updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
        return this.http.put<UserProfile>(`${this.apiUrl}/me`, request);
    }

    /**
     * Met à jour l'avatar de l'utilisateur.
     */
    uploadAvatar(avatarUrl: string): Observable<UserProfile> {
        return this.http.post<UserProfile>(`${this.apiUrl}/me/avatar`, { avatarUrl });
    }
}
