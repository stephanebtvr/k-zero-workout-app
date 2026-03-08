import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { statsService, UserStatsSummary, HeatmapData, OneRmProgression } from '../services/statsService';
import { apiRequest } from '../services/api';

const screenWidth = Dimensions.get('window').width;

interface Exercise {
  id: string;
  name: string;
}

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<UserStatsSummary | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [oneRmProgression, setOneRmProgression] = useState<OneRmProgression[]>([]);

  const [loading1RM, setLoading1RM] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [sumData, heatData, exData] = await Promise.all([
        statsService.getSummary(),
        statsService.getHeatmap(),
        apiRequest('/exercises') as Promise<Exercise[]>
      ]);
      setSummary(sumData);
      setHeatmap(heatData);

      const sortedEx = exData.sort((a: Exercise, b: Exercise) => a.name.localeCompare(b.name));
      setExercises(sortedEx);

      if (sortedEx.length > 0) {
        setSelectedExercise(sortedEx[0].id);
        fetch1RM(sortedEx[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const fetch1RM = async (exerciseId: string) => {
    setLoading1RM(true);
    setSelectedExercise(exerciseId);
    try {
      const data = await statsService.getOneRmProgression(exerciseId);
      setOneRmProgression(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading1RM(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0071E3" />
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: "#1D1D1F",
    backgroundGradientTo: "#1D1D1F",
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#0071E3"
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Tableau de bord</Text>

      {summary && (
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>SÉANCES</Text>
            <Text style={styles.cardValue}>{summary.totalWorkouts}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>VOLUME (KG)</Text>
            <Text style={styles.cardValue}>{Math.round(summary.totalVolumeKg)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>SÉRIES</Text>
            <Text style={styles.cardValue}>{summary.totalSets}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>RÉPÉTITIONS</Text>
            <Text style={styles.cardValue}>{summary.totalReps}</Text>
          </View>
        </View>
      )}

      {/* 1RM Progression */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Progression 1RM</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {exercises.map(ex => (
            <TouchableOpacity
              key={ex.id}
              style={[styles.chip, selectedExercise === ex.id && styles.chipActive]}
              onPress={() => fetch1RM(ex.id)}
            >
              <Text style={[styles.chipText, selectedExercise === ex.id && styles.chipTextActive]}>
                {ex.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading1RM ? (
          <ActivityIndicator color="#0071E3" style={{ marginVertical: 30 }} />
        ) : oneRmProgression.length > 0 ? (
          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: oneRmProgression.map(d => d.date.substring(5)), // MM-DD
                datasets: [{ data: oneRmProgression.map(d => d.estimated1RM) }]
              }}
              width={screenWidth - 48} // margin 24*2
              height={220}
              yAxisSuffix="kg"
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune donnée 1RM disponible.</Text>
          </View>
        )}
      </View>

      {/* Heatmap / Frequency (Utilisons un BarChart) */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Fréquence d'entraînement</Text>
        {heatmap.length > 0 ? (
          <View style={styles.chartWrapper}>
            <BarChart
              data={{
                labels: heatmap.map(d => d.date.substring(5)),
                datasets: [{ data: heatmap.map(d => d.count) }]
              }}
              width={screenWidth - 48}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`
              }}
              style={{ borderRadius: 16 }}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune activité enregistrée.</Text>
          </View>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0071E3',
  },
  chartSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  chipContainer: {
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#1D1D1F',
  },
  chipText: {
    color: '#1D1D1F',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chartWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyState: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    color: '#8E8E93',
    fontStyle: 'italic',
  }
});
