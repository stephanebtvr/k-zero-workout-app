/**
 * LoginScreen — Écran de connexion IronPath (React Native).
 *
 * Design Apple épuré avec KeyboardAvoidingView pour iOS.
 * Utilise le store Zustand pour l'authentification.
 * Validation inline des champs email et password.
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

/** Couleurs du design system Apple */
const COLORS = {
    bg: '#FFFFFF',
    surface: '#F5F5F7',
    border: '#E5E5EA',
    textPrimary: '#1D1D1F',
    textSecondary: '#6E6E73',
    accent: '#0071E3',
    danger: '#FF3B30',
};

interface LoginScreenProps {
    onNavigateToRegister: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();

    /**
     * Gère la soumission du formulaire de connexion.
     * Valide les champs avant d'appeler le store.
     */
    const handleLogin = async () => {
        clearError();

        if (!email.trim() || !password.trim()) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
            return;
        }

        try {
            await login(email.trim().toLowerCase(), password);
        } catch {
            // L'erreur est gérée par le store (state.error)
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>🏋️</Text>
                    <Text style={styles.logoText}>IronPath</Text>
                </View>

                <Text style={styles.subtitle}>Connectez-vous pour suivre vos performances</Text>

                {/* Message d'erreur */}
                {error && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                    </View>
                )}

                {/* Champ email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Adresse email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="votre@email.com"
                        placeholderTextColor={COLORS.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                    />
                </View>

                {/* Champ mot de passe */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.textSecondary}
                        secureTextEntry
                        autoComplete="password"
                    />
                </View>

                {/* Bouton connexion */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Se connecter</Text>
                    )}
                </TouchableOpacity>

                {/* Lien inscription */}
                <TouchableOpacity onPress={onNavigateToRegister} style={styles.linkContainer}>
                    <Text style={styles.linkText}>
                        Pas encore de compte ?{' '}
                        <Text style={styles.linkAccent}>S'inscrire</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    logoIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontSize: 16,
        marginBottom: 32,
    },
    errorBanner: {
        backgroundColor: '#FFF2F2',
        borderWidth: 1,
        borderColor: '#FFD1D1',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: 14,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    input: {
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        color: COLORS.textPrimary,
    },
    button: {
        backgroundColor: COLORS.accent,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        minHeight: 48,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    linkContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    linkAccent: {
        color: COLORS.accent,
        fontWeight: '500',
    },
});
