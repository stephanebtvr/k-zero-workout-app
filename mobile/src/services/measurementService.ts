import { apiRequest } from './api';

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

export const measurementService = {
    getAll: async (): Promise<Measurement[]> => {
        return await apiRequest<Measurement[]>('/measurements', { method: 'GET' });
    },

    save: async (request: CreateOrUpdateMeasurementRequest): Promise<Measurement> => {
        return await apiRequest<Measurement>('/measurements', {
            method: 'POST',
            body: JSON.stringify(request)
        });
    },

    delete: async (id: string): Promise<void> => {
        await apiRequest<void>(`/measurements/${id}`, { method: 'DELETE' });
    }
};
