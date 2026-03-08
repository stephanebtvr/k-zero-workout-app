import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { apiRequest } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = {
    bg: '#FFFFFF', surface: '#F5F5F7', border: '#E5E5EA',
    textPrimary: '#1D1D1F', textSecondary: '#6E6E73', accent: '#0071E3',
    danger: '#FF3B30'
};

interface WorkoutProgram {
    id: string;
    name: string;
    description: string | null;
    days: any[];
}

export default function ProgramListScreen() {
    const { accessToken } = useAuthStore();
    const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadPrograms = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest<WorkoutProgram[]>('/programs', {}, accessToken);
            setPrograms(data);
        } catch { /* error handled silently */ }
        finally { setIsLoading(false); }
    }, [accessToken]);

    useFocusEffect(
        useCallback(() => {
            loadPrograms();
        }, [loadPrograms])
    );

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Supprimer',
            `Voulez-vous vraiment supprimer le programme "${name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiRequest(`/programs/${id}`, { method: 'DELETE' }, accessToken);
                            loadPrograms();
                        } catch {
                            Alert.alert('Erreur', 'Impossible de supprimer.');
                        }
                    }
                }
            ]
        );
    };

    const renderProgram = ({ item }: { item: WorkoutProgram }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.days.length} jours</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
                <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Programmes</Text>
                {/* Un bouton "Créer" pourrait aller ici vers une future route de builder */}
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
            ) : programs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📝</Text>
                    <Text style={styles.emptyTitle}>Aucun programme</Text>
                    <Text style={styles.emptyText}>Créez votre première routine sur l'application Web.</Text>
                </View>
            ) : (
                <FlatList
                    data={programs}
                    renderItem={renderProgram}
                    keyExtractor={p => p.id}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 60 },
    header: { paddingHorizontal: 24, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary },
    card: {
        marginHorizontal: 24, marginBottom: 16, padding: 20,
        borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
        backgroundColor: COLORS.bg, flexDirection: 'row', justifyContent: 'space-between'
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
    cardDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 20 },
    badge: {
        backgroundColor: 'rgba(0,113,227,0.1)', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 8, alignSelf: 'flex-start'
    },
    badgeText: { fontSize: 12, fontWeight: '600', color: COLORS.accent },
    deleteBtn: { padding: 8, justifyContent: 'flex-start' },
    deleteIcon: { fontSize: 18 },
    emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
    emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 }
});
