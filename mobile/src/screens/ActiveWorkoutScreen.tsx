import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { apiRequest } from '../services/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const COLORS = {
    bg: '#FFFFFF', surface: '#F5F5F7', border: '#E5E5EA',
    textPrimary: '#1D1D1F', textSecondary: '#6E6E73', accent: '#0071E3',
    success: '#34C759', successBg: '#E5F1E8', danger: '#FF3B30'
};

// Types simplifiés basés sur le DTO backend
interface WorkoutSet {
    id: string; setOrder: number; weightKg: number; reps: number;
    isWarmup: boolean; isCompleted: boolean; estimated1RM: number | null;
}
interface SessionExercise {
    id: string; exercise: { name: string; muscleGroup: string };
    orderIndex: number; sets: WorkoutSet[];
}
interface Workout {
    id: string; name: string; startTime: string; sessionExercises: SessionExercise[];
}

export default function ActiveWorkoutScreen() {
    const { accessToken } = useAuthStore();
    const navigation = useNavigation();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [duration, setDuration] = useState(0);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (workout) {
            const start = new Date(workout.startTime).getTime();
            interval = setInterval(() => {
                setDuration(Math.floor((Date.now() - start) / 60000));
            }, 60000);
            setDuration(Math.floor((Date.now() - start) / 60000));
        }
        return () => clearInterval(interval);
    }, [workout]);

    const loadActiveWorkout = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest<Workout>('/workouts/active', {}, accessToken);
            setWorkout(data || null); // Le backend renvoie 204 No Content si rien
        } catch { setWorkout(null); }
        finally { setIsLoading(false); }
    }, [accessToken]);

    useFocusEffect(useCallback(() => { loadActiveWorkout(); }, [loadActiveWorkout]));

    const startFreeWorkout = async () => {
        setIsLoading(true);
        try {
            const name = `Séance libre (${new Date().toLocaleDateString()})`;
            const data = await apiRequest<Workout>('/workouts/start', { method: 'POST', body: JSON.stringify({ name }) }, accessToken);
            setWorkout(data);
        } catch { Alert.alert('Erreur', 'Impossible de démarrer la séance.'); }
        finally { setIsLoading(false); }
    };

    const updateSet = async (exId: string, set: WorkoutSet, updates: Partial<WorkoutSet>) => {
        if (!workout) return;
        try {
            const updatedSet = { ...set, ...updates };
            // Optimistic update
            setWorkout(prev => {
                if (!prev) return prev;
                const newExs = prev.sessionExercises.map(ex => {
                    if (ex.id !== exId) return ex;
                    return { ...ex, sets: ex.sets.map(s => s.id === set.id ? updatedSet : s) };
                });
                return { ...prev, sessionExercises: newExs };
            });

            const data = await apiRequest<Workout>(`/workouts/${workout.id}/sets`, {
                method: 'PUT',
                body: JSON.stringify({
                    setId: set.id, exerciseId: exId, weightKg: updatedSet.weightKg, reps: updatedSet.reps,
                    isWarmup: updatedSet.isWarmup, isCompleted: updatedSet.isCompleted, setOrder: updatedSet.setOrder
                })
            }, accessToken);
            setWorkout(data); // Sync with backend (inclus le calcul 1RM)
        } catch { loadActiveWorkout(); /* rollback on error */ }
    };

    const addSet = async (exId: string, order: number) => {
        if (!workout) return;
        try {
            const data = await apiRequest<Workout>(`/workouts/${workout.id}/sets`, {
                method: 'PUT',
                body: JSON.stringify({ setId: null, exerciseId: exId, weightKg: 0, reps: 0, isWarmup: false, isCompleted: false, setOrder: order })
            }, accessToken);
            setWorkout(data);
        } catch { }
    };

    const finishWorkout = () => {
        Alert.alert('Terminer', 'Voulez-vous terminer cette séance ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Oui', onPress: async () => {
                    if (!workout) return;
                    try {
                        await apiRequest(`/workouts/${workout.id}/finish`, { method: 'POST' }, accessToken);
                        Alert.alert('Bravo !', 'Séance terminée avec succès.');
                        setWorkout(null);
                        // navigation.navigate('Dashboard' as never);
                    } catch { Alert.alert('Erreur', 'Impossible de terminer.'); }
                }
            }
        ]);
    };

    if (isLoading) return <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />;

    if (!workout) return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏋️‍♂️</Text>
            <Text style={styles.emptyTitle}>Aucune séance en cours</Text>
            <Text style={styles.emptyText}>Lancez-vous et commencez à tracker vos performances.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={startFreeWorkout}>
                <Text style={styles.primaryBtnText}>Démarrer une séance libre</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>EN COURS</Text>
                    </View>
                    <Text style={styles.title}>{workout.name}</Text>
                    <Text style={styles.timer}>⏱️ {duration} min</Text>
                </View>
                <TouchableOpacity style={styles.finishBtn} onPress={finishWorkout}>
                    <Text style={styles.finishBtnText}>Terminer</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {workout.sessionExercises.map((ex, exIdx) => (
                    <View key={ex.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.exName}>{ex.exercise.name}</Text>
                            <Text style={styles.muscleBadge}>{ex.exercise.muscleGroup}</Text>
                        </View>

                        <View style={styles.tableBlock}>
                            <View style={styles.tableRowHeader}>
                                <Text style={[styles.colSet, styles.headerText]}>SET</Text>
                                <Text style={[styles.colInput, styles.headerText]}>KG</Text>
                                <Text style={[styles.colInput, styles.headerText]}>REPS</Text>
                                <Text style={[styles.colCheck, styles.headerText]}>✓</Text>
                            </View>

                            {ex.sets.map((set, setIdx) => (
                                <View key={set.id} style={styles.tableRow}>
                                    <Text style={styles.colSet}>{setIdx + 1}</Text>
                                    <TextInput
                                        style={[styles.colInput, styles.inputBox, set.isCompleted && styles.inputCompleted]}
                                        keyboardType="numeric"
                                        value={set.weightKg ? set.weightKg.toString() : ''}
                                        onChangeText={t => updateSet(ex.id, set, { weightKg: parseFloat(t) || 0 })}
                                        editable={!set.isCompleted}
                                    />
                                    <TextInput
                                        style={[styles.colInput, styles.inputBox, set.isCompleted && styles.inputCompleted]}
                                        keyboardType="numeric"
                                        value={set.reps ? set.reps.toString() : ''}
                                        onChangeText={t => updateSet(ex.id, set, { reps: parseInt(t, 10) || 0 })}
                                        editable={!set.isCompleted}
                                    />
                                    <TouchableOpacity
                                        style={[styles.colCheck, styles.checkBtn, set.isCompleted && styles.checkBtnActive]}
                                        onPress={() => updateSet(ex.id, set, { isCompleted: !set.isCompleted })}>
                                        <Text style={[styles.checkIcon, set.isCompleted && styles.checkIconActive]}>✓</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(ex.id, ex.sets.length + 1)}>
                                <Text style={styles.addSetText}>+ Ajouter une série</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {/* Placeholder pour ajouter un exercice */}
                <TouchableOpacity style={styles.addExBtn} onPress={() => Alert.alert('Info', 'Menu d\'ajout d\'exercice à implémenter')}>
                    <Text style={styles.addExText}>+ Ajouter un exercice</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 60 },
    header: { paddingHorizontal: 24, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 6 },
    liveText: { fontSize: 12, fontWeight: '700', color: COLORS.success, letterSpacing: 0.5 },
    title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
    timer: { fontSize: 16, fontWeight: '500', color: COLORS.textSecondary },
    finishBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    finishBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

    scrollContent: { paddingBottom: 60 },
    card: { marginHorizontal: 24, marginBottom: 16, padding: 16, borderRadius: 16, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    exName: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
    muscleBadge: { fontSize: 12, backgroundColor: COLORS.surface, color: COLORS.textSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },

    tableBlock: { width: '100%' },
    tableRowHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
    tableRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    headerText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },

    colSet: { width: 40, textAlign: 'center', fontWeight: '600', color: COLORS.textSecondary },
    colInput: { flex: 1, marginHorizontal: 4 },
    colCheck: { width: 44, alignItems: 'center' },

    inputBox: {
        backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
        paddingVertical: 10, textAlign: 'center', fontSize: 16, fontWeight: '600', color: COLORS.textPrimary
    },
    inputCompleted: { backgroundColor: COLORS.successBg, color: COLORS.success, borderColor: COLORS.successBg },

    checkBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
    checkBtnActive: { backgroundColor: COLORS.success },
    checkIcon: { color: COLORS.border, fontSize: 18, fontWeight: '700' },
    checkIconActive: { color: '#FFF' },

    addSetBtn: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
    addSetText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },

    addExBtn: { marginHorizontal: 24, paddingVertical: 16, backgroundColor: 'rgba(0,113,227,0.05)', borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,113,227,0.1)', borderStyle: 'dashed' },
    addExText: { color: COLORS.accent, fontWeight: '600', fontSize: 15 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, paddingHorizontal: 40 },
    emptyIcon: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
    emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    primaryBtn: { width: '100%', backgroundColor: COLORS.accent, padding: 16, borderRadius: 12, alignItems: 'center' },
    primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});
