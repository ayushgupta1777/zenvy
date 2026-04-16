import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const GeneralSettingsScreen = ({ navigation }) => {
    const [isCodEnabled, setIsCodEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/settings/isCodEnabled');
            if (response.data.success) {
                // If value is null (not set), default to true
                setIsCodEnabled(response.data.data.value ?? true);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // Don't alert here as we have a default
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleCod = async (value) => {
        try {
            setIsSaving(true);
            const response = await api.put('/settings', {
                key: 'isCodEnabled',
                value: value,
                description: 'Global control for Cash on Delivery payment option'
            });

            if (response.data.success) {
                setIsCodEnabled(value);
                // Instant feedback is handled by the Switch, but we confirm success
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update COD settings. Please try again.');
            // Revert switch on error
            setIsCodEnabled(!value);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>General Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Options</Text>
                    <Text style={styles.sectionSubtitle}>
                        Control global payment methods available to customers
                    </Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View style={styles.iconBox}>
                                <Icon name="cash-outline" size={22} color="#4F46E5" />
                            </View>
                            <View>
                                <Text style={styles.settingLabel}>Cash on Delivery (COD)</Text>
                                <Text style={styles.settingDescription}>
                                    {isCodEnabled ? 'Currently visible at checkout' : 'Currently hidden from checkout'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isCodEnabled}
                            onValueChange={handleToggleCod}
                            disabled={isSaving}
                            trackColor={{ false: '#E5E7EB', true: '#A5B4FC' }}
                            thumbColor={isCodEnabled ? '#4F46E5' : '#F3F4F6'}
                        />
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Icon name="information-circle-outline" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>
                        Changes take effect instantly for all customers across the app.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {isSaving && (
                <View style={styles.savingOverlay}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.savingText}>Updating...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    content: { flex: 1 },
    section: {
        backgroundColor: '#fff',
        marginTop: 12,
        padding: 20
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
        marginBottom: 20
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    settingLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
    settingDescription: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 20,
        marginTop: 16
    },
    infoText: { fontSize: 12, color: '#6B7280', flex: 1 },
    savingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12
    },
    savingText: { color: '#fff', fontSize: 14, fontWeight: '600' }
});

export default GeneralSettingsScreen;
