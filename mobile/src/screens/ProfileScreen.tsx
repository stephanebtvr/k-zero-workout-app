/**
 * ProfileScreen — Écran de profil utilisateur IronPath (React Native).
 *
 * Affiche l'avatar, les informations du profil, un formulaire d'édition,
 * et un bouton de déconnexion.
 */
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { apiRequest } from '../services/api';

const COLORS = {
    bg: '#FFFFFF', surface: '#F5F5F7', border: '#E5E5EA',
    textPrimary: '#1D1D1F', textSecondary: '#6E6E73',
    accent: '#0071E3', danger: '#FF3B30',
};

interface UserProfile {
    id: string; email: string; firstName: string; lastName: string;
    birthDate: string | null; heightCm: number | null; avatarUrl: string | null;
}

export default function ProfileScreen() {
    const { accessToken, logout, user } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [heightCm, setHeightCm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await apiRequest<UserProfile>('/users/me', {}, accessToken);
            setProfile(data);
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setHeightCm(data.heightCm?.toString() || '');
        } catch (error: any) {
            Alert.alert('Erreur', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const request: any = {};
            if (firstName.trim()) request.firstName = firstName.trim();
            if (lastName.trim()) request.lastName = lastName.trim();
            if (heightCm) request.heightCm = parseInt(heightCm);

            const data = await apiRequest<UserProfile>('/users/me', {
                method: 'PUT', body: JSON.stringify(request),
            }, accessToken);
            setProfile(data);
            Alert.alert('✓', 'Profil mis à jour');
        } catch (error: any) {
            Alert.alert('Erreur', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = () => {
        if (!profile) return '?';
        return (profile.firstName[0] + profile.lastName[0]).toUpperCase();
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Mon Profil</Text>

            {/* Avatar */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{getInitials()}</Text>
                </View>
            </View>

            {/* Email (non modifiable) */}
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>

            {/* Formulaire */}
            <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
                    <Text style={styles.label}>Prénom</Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 6 }]}>
                    <Text style={styles.label}>Nom</Text>
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Taille (cm)</Text>
                <TextInput style={styles.input} value={heightCm} onChangeText={setHeightCm}
                    keyboardType="numeric" placeholder="175" placeholderTextColor={COLORS.textSecondary} />
            </View>

            <TouchableOpacity style={[styles.btnPrimary, isSaving && styles.btnDisabled]}
                onPress={handleSave} disabled={isSaving} activeOpacity={0.8}>
                {isSaving ? (
                    <ActivityIndicator color="#FFF" size="small" />
                ) : (
                    <Text style={styles.btnPrimaryText}>Enregistrer</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnLogout} onPress={logout} activeOpacity={0.8}>
                <Text style={styles.btnLogoutText}>Se déconnecter</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, paddingTop: 60 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    title: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 32 },

    avatarSection: { alignItems: 'center', marginBottom: 32 },
    avatarCircle: {
        width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.surface,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border,
    },
    avatarInitials: { fontSize: 32, fontWeight: '600', color: COLORS.textSecondary },

    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 24,
    },
    infoLabel: { fontSize: 14, color: COLORS.textSecondary },
    infoValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },

    formRow: { flexDirection: 'row' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 6 },
    input: {
        padding: 12, fontSize: 16, borderWidth: 1, borderColor: COLORS.border,
        borderRadius: 12, backgroundColor: COLORS.surface, color: COLORS.textPrimary,
    },

    btnPrimary: {
        backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginTop: 8, minHeight: 48,
    },
    btnDisabled: { opacity: 0.6 },
    btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

    btnLogout: {
        paddingVertical: 14, borderRadius: 12, alignItems: 'center',
        borderWidth: 1, borderColor: COLORS.border, marginTop: 16,
    },
    btnLogoutText: { color: COLORS.danger, fontSize: 16, fontWeight: '500' },
});
