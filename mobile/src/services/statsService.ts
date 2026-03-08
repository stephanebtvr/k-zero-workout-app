import { apiRequest } from './api';

export interface UserStatsSummary {
    totalWorkouts: number;
    totalVolumeKg: number;
    totalSets: number;
    totalReps: number;
}

export interface HeatmapData {
    date: string; // YYYY-MM-DD
    count: number;
}

export interface OneRmProgression {
    date: string; // YYYY-MM-DD
    estimated1RM: number;
}

export const statsService = {
    getSummary: async (): Promise<UserStatsSummary> => {
        return await apiRequest('/stats/summary');
    },

    getHeatmap: async (): Promise<HeatmapData[]> => {
        return await apiRequest('/stats/heatmap');
    },

    getOneRmProgression: async (exerciseId: string): Promise<OneRmProgression[]> => {
        return await apiRequest(`/stats/1rm-progression?exerciseId=${exerciseId}`);
    }
};
