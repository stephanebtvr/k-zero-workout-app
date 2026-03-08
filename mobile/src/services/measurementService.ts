import api from './api';

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
        const response = await api.get<Measurement[]>('/measurements');
        return response.data;
    },

    save: async (request: CreateOrUpdateMeasurementRequest): Promise<Measurement> => {
        const response = await api.post<Measurement>('/measurements', request);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/measurements/${id}`);
    }
};
