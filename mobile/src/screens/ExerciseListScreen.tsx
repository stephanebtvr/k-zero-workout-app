import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { apiRequest } from '../services/api';

const COLORS = {
    bg: '#FFFFFF', surface: '#F5F5F7', border: '#E5E5EA',
    textPrimary: '#1D1D1F', textSecondary: '#6E6E73', accent: '#0071E3',
};

interface Exercise {
    id: string; name: string; muscleGroup: string; category: string;
    description: string | null; isCustom: boolean;
}

const MUSCLE_LABELS: Record<string, string> = {
    chest: 'Pectoraux', back: 'Dos', shoulders: 'Épaules', biceps: 'Biceps',
    triceps: 'Triceps', legs: 'Jambes', core: 'Abdos', full_body: 'Full Body',
};

const CATEGORY_LABELS: Record<string, string> = {
    barbell: 'Barre', dumbbell: 'Haltères', machine: 'Machine',
    cable: 'Poulie', bodyweight: 'Poids du corps',
};

const EMOJIS: Record<string, string> = {
    chest: '🫁', back: '🔙', shoulders: '💪', biceps: '💪',
    triceps: '💪', legs: '🦵', core: '🎯', full_body: '🏋️',
};

export default function ExerciseListScreen() {
    const { accessToken } = useAuthStore();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { loadExercises(); }, [selectedMuscle]);

    const loadExercises = async () => {
        setIsLoading(true);
        try {
            const endpoint = selectedMuscle ? `/exercises?muscle=${selectedMuscle}` : '/exercises';
            const data = await apiRequest<Exercise[]>(endpoint, {}, accessToken);
            setExercises(data);
        } catch { /* silent */ }
        finally { setIsLoading(false); }
    };

    const renderChip = (key: string | null, label: string) => (
        <TouchableOpacity key={key || 'all'}
            style={[styles.chip, selectedMuscle === key && styles.chipActive]}
            onPress={() => setSelectedMuscle(key)} activeOpacity={0.7}>
            <Text style={[styles.chipText, selectedMuscle === key && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderExercise = ({ item }: { item: Exercise }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.emoji}>{EMOJIS[item.muscleGroup] || '🏋️'}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardBadge}>{CATEGORY_LABELS[item.category] || item.category}</Text>
                </View>
            </View>
            {item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
            <View style={styles.cardFooter}>
                <Text style={styles.cardMuscle}>{MUSCLE_LABELS[item.muscleGroup] || item.muscleGroup}</Text>
                {item.isCustom && <Text style={styles.customBadge}>Custom</Text>}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Exercices</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
                {renderChip(null, 'Tous')}
                {Object.entries(MUSCLE_LABELS).map(([k, v]) => renderChip(k, v))}
            </ScrollView>
            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
            ) : (
                <FlatList data={exercises} renderItem={renderExercise} keyExtractor={i => i.id}
                    contentContainerStyle={{ paddingBottom: 40 }} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 60 },
    title: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, paddingHorizontal: 24, marginBottom: 16 },
    filterBar: { paddingHorizontal: 20, marginBottom: 16, maxHeight: 44 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, backgroundColor: COLORS.bg },
    chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    chipText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
    chipTextActive: { color: '#FFF' },
    card: { marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
    emoji: { fontSize: 28 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
    cardBadge: { fontSize: 12, color: COLORS.accent, marginTop: 2 },
    cardDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardMuscle: { fontSize: 12, color: COLORS.textSecondary },
    customBadge: { fontSize: 11, fontWeight: '600', color: '#34C759' },
});
