import api from './api';

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
        const response = await api.get<UserStatsSummary>('/stats/summary');
        return response.data;
    },

    getHeatmap: async (): Promise<HeatmapData[]> => {
        const response = await api.get<HeatmapData[]>('/stats/heatmap');
        return response.data;
    },

    getOneRmProgression: async (exerciseId: string): Promise<OneRmProgression[]> => {
        const response = await api.get<OneRmProgression[]>('/stats/1rm-progression', {
            params: { exerciseId }
        });
        return response.data;
    }
};
