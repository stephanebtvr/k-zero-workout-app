/**
 * App.tsx — Point d'entrée de l'application mobile IronPath.
 *
 * Gère la navigation conditionnelle :
 * - Authentifié → Écran principal (placeholder, sera remplacé par les tabs)
 * - Non authentifié → Login / Register
 *
 * Tente un refresh automatique au démarrage si un refresh token existe.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from './src/stores/authStore';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

export default function App() {
  const { isAuthenticated, tryAutoRefresh, logout } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Tente un refresh automatique au lancement de l'app
  useEffect(() => {
    const init = async () => {
      await tryAutoRefresh();
      setIsReady(true);
    };
    init();
  }, []);

  // Écran de chargement pendant le refresh initial
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0071E3" />
      </View>
    );
  }

  // Navigation conditionnelle basée sur l'état d'authentification
  if (!isAuthenticated) {
    if (showRegister) {
      return <RegisterScreen onNavigateToLogin={() => setShowRegister(false)} />;
    }
    return <LoginScreen onNavigateToRegister={() => setShowRegister(true)} />;
  }

  // Placeholder pour l'écran principal (sera remplacé par les tabs)
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.welcomeText}>🏋️ Bienvenue sur IronPath !</Text>
      <Text style={styles.subText}>Les fonctionnalités arrivent bientôt...</Text>
      <Text style={styles.logoutLink} onPress={logout}>Se déconnecter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#6E6E73',
    marginBottom: 32,
  },
  logoutLink: {
    fontSize: 16,
    color: '#0071E3',
    fontWeight: '500',
  },
});
