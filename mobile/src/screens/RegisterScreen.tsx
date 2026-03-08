/**
 * RegisterScreen — Écran d'inscription IronPath (React Native).
 *
 * Design Apple épuré. KeyboardAvoidingView pour iOS.
 * Champs : prénom, nom, email, mot de passe.
 * Validation inline avec messages en français.
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

const COLORS = {
    bg: '#FFFFFF',
    surface: '#F5F5F7',
    border: '#E5E5EA',
    textPrimary: '#1D1D1F',
    textSecondary: '#6E6E73',
    accent: '#0071E3',
    danger: '#FF3B30',
};

/** Nombre minimum de caractères pour le mot de passe */
const MIN_PASSWORD_LENGTH = 8;

interface RegisterScreenProps {
    onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, isLoading, error, clearError } = useAuthStore();

    const handleRegister = async () => {
        clearError();

        // Validations côté client
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
            return;
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            Alert.alert('Mot de passe trop court', `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
            return;
        }

        try {
            await register(email.trim().toLowerCase(), password, firstName.trim(), lastName.trim());
        } catch {
            // L'erreur est gérée par le store
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
                <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>🏋️</Text>
                    <Text style={styles.logoText}>IronPath</Text>
                </View>

                <Text style={styles.subtitle}>Créez votre compte pour commencer</Text>

                {error && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                    </View>
                )}

                {/* Prénom et Nom sur la même ligne */}
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
                        <Text style={styles.label}>Prénom</Text>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Jean"
                            placeholderTextColor={COLORS.textSecondary}
                            autoComplete="given-name"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 6 }]}>
                        <Text style={styles.label}>Nom</Text>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Dupont"
                            placeholderTextColor={COLORS.textSecondary}
                            autoComplete="family-name"
                        />
                    </View>
                </View>

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

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="8 caractères minimum"
                        placeholderTextColor={COLORS.textSecondary}
                        secureTextEntry
                        autoComplete="new-password"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Créer mon compte</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onNavigateToLogin} style={styles.linkContainer}>
                    <Text style={styles.linkText}>
                        Déjà un compte ?{' '}
                        <Text style={styles.linkAccent}>Se connecter</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scrollContent: {
        flexGrow: 1, justifyContent: 'center',
        paddingHorizontal: 24, paddingVertical: 48,
    },
    logoContainer: { alignItems: 'center', marginBottom: 8 },
    logoIcon: { fontSize: 48, marginBottom: 8 },
    logoText: {
        fontSize: 32, fontWeight: '700',
        color: COLORS.textPrimary, letterSpacing: -0.5,
    },
    subtitle: {
        textAlign: 'center', color: COLORS.textSecondary,
        fontSize: 16, marginBottom: 32,
    },
    errorBanner: {
        backgroundColor: '#FFF2F2', borderWidth: 1,
        borderColor: '#FFD1D1', borderRadius: 12,
        padding: 12, marginBottom: 20,
    },
    errorText: { color: COLORS.danger, fontSize: 14 },
    row: { flexDirection: 'row' },
    inputGroup: { marginBottom: 20 },
    label: {
        fontSize: 14, fontWeight: '500',
        color: COLORS.textPrimary, marginBottom: 6,
    },
    input: {
        padding: 12, fontSize: 16,
        borderWidth: 1, borderColor: COLORS.border,
        borderRadius: 12, backgroundColor: COLORS.surface,
        color: COLORS.textPrimary,
    },
    button: {
        backgroundColor: COLORS.accent, paddingVertical: 14,
        borderRadius: 12, alignItems: 'center', justifyContent: 'center',
        marginTop: 8, minHeight: 48,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    linkContainer: { marginTop: 24, alignItems: 'center' },
    linkText: { fontSize: 14, color: COLORS.textSecondary },
    linkAccent: { color: COLORS.accent, fontWeight: '500' },
});
