import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { measurementService, Measurement, CreateOrUpdateMeasurementRequest } from '../services/measurementService';

const screenWidth = Dimensions.get('window').width;

export default function MeasurementScreen() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weightKg, setWeightKg] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [armsCm, setArmsCm] = useState('');
    const [waistCm, setWaistCm] = useState('');

    useEffect(() => {
        fetchMeasurements();
    }, []);

    const fetchMeasurements = async () => {
        try {
            setLoading(true);
            const data = await measurementService.getAll();
            setMeasurements(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Impossible de charger les mensurations');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!date) {
            Alert.alert('Erreur', 'La date est requise');
            return;
        }

        try {
            setSubmitting(true);
            const payload: CreateOrUpdateMeasurementRequest = {
                date,
                weightKg: weightKg ? parseFloat(weightKg) : undefined,
                bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
                armsCm: armsCm ? parseFloat(armsCm) : undefined,
                waistCm: waistCm ? parseFloat(waistCm) : undefined,
            };

            await measurementService.save(payload);

            // Reset form
            setWeightKg('');
            setBodyFat('');
            setArmsCm('');
            setWaistCm('');

            await fetchMeasurements();
            Alert.alert('Succès', 'Mensurations enregistrées');

        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Impossible de sauvegarder');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Suppression',
            'Voulez-vous vraiment supprimer ce relevé ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await measurementService.delete(id);
                            fetchMeasurements();
                        } catch (e) {
                            Alert.alert('Erreur', 'Impossible de supprimer');
                        }
                    }
                }
            ]
        );
    };

    // Prepare chart data (needs chronological order)
    const chartData = [...measurements]
        .filter(m => m.weightKg != null)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const chartConfig = {
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientTo: "#FFFFFF",
        color: (opacity = 1) => `rgba(0, 113, 227, ${opacity})`,
        strokeWidth: 3,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        propsForDots: { r: "4", strokeWidth: "2", stroke: "#0071E3" }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0071E3" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.headerTitle}>Mensurations</Text>

            {/* Formulaire simplifié */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Nouveau relevé</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date</Text>
                    <TextInput
                        style={styles.input}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Poids (kg)</Text>
                        <TextInput style={styles.input} value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" placeholder="75.5" />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>Body Fat (%)</Text>
                        <TextInput style={styles.input} value={bodyFat} onChangeText={setBodyFat} keyboardType="numeric" placeholder="15.0" />
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSave} disabled={submitting}>
                    {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Enregistrer</Text>}
                </TouchableOpacity>
            </View>

            {/* Graphique Poids */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Évolution du poids</Text>
                {chartData.length >= 2 ? (
                    <LineChart
                        data={{
                            labels: chartData.map(d => d.date.substring(5)),
                            datasets: [{ data: chartData.map(d => d.weightKg!) }]
                        }}
                        width={screenWidth - 80}
                        height={220}
                        yAxisSuffix=" kg"
                        chartConfig={chartConfig}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                ) : (
                    <Text style={styles.emptyText}>Pas assez de données pour le graphique.</Text>
                )}
            </View>

            {/* Historique récents (3 derniers) */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Historique récent</Text>
                {measurements.slice(0, 3).map((m, index) => (
                    <View key={m.id} style={[styles.historyRow, index > 0 && styles.historyRowBorder]}>
                        <View>
                            <Text style={styles.historyDate}>{m.date}</Text>
                            <Text style={styles.historyDetails}>
                                {m.weightKg ? `${m.weightKg} kg` : ''} {m.bodyFatPercentage ? ` • ${m.bodyFatPercentage}%` : ''}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(m.id)}>
                            <Text style={styles.deleteText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                {measurements.length === 0 && <Text style={styles.emptyText}>Aucun historique.</Text>}
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    content: { padding: 24, paddingTop: 60, paddingBottom: 60 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
    headerTitle: { fontSize: 34, fontWeight: '700', color: '#1D1D1F', marginBottom: 24 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F', marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase' },
    input: {
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1D1D1F',
    },
    button: { backgroundColor: '#0071E3', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    emptyText: { color: '#8E8E93', fontStyle: 'italic', textAlign: 'center', padding: 20 },

    historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    historyRowBorder: { borderTopWidth: 1, borderTopColor: '#E5E5EA' },
    historyDate: { fontSize: 16, fontWeight: '500', color: '#1D1D1F' },
    historyDetails: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
    deleteText: { fontSize: 18, color: '#FF3B30', padding: 8 }
});
