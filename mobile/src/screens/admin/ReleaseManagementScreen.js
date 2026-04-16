import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../services/api';

const ReleaseManagementScreen = ({ navigation }) => {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        version: '',
        updateUrl: '',
        releaseNotes: ''
    });

    const handlePublish = async () => {
        if (!form.version || !form.updateUrl) {
            Alert.alert('Error', 'Please fill in both Version and Update URL');
            return;
        }

        Alert.alert(
            'Confirm Release',
            `Are you sure you want to publish Version ${form.version}? This will send a push notification to ALL users.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Publish & Notify',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await axios.post(
                                `${BASE_URL}/api/settings/release-update`,
                                form,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );

                            if (response.data.success) {
                                Alert.alert('Success', response.data.message);
                                navigation.goBack();
                            }
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to publish release');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>App Release Management</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.infoCard}>
                    <Icon name="rocket" size={32} color="#4F46E5" />
                    <Text style={styles.infoText}>
                        Publish a new app version here. This will notify all users and prompt them to download the update.
                    </Text>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Latest Version Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 1.0.2"
                        value={form.version}
                        onChangeText={(text) => setForm({ ...form, version: text })}
                    />

                    <Text style={styles.label}>App Download URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Link to Play Store or APK file"
                        value={form.updateUrl}
                        onChangeText={(text) => setForm({ ...form, updateUrl: text })}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Release Notes (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What's new in this version?"
                        value={form.releaseNotes}
                        onChangeText={(text) => setForm({ ...form, releaseNotes: text })}
                        multiline
                        numberOfLines={4}
                    />

                    <View style={styles.summaryBox}>
                        <Icon name="information-circle-outline" size={20} color="#6366F1" />
                        <Text style={styles.summaryText}>
                            Current Version in use by this build: 0.0.1
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handlePublish}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Icon name="cloud-upload-outline" size={20} color="#FFF" />
                            <Text style={styles.buttonText}>Publish & Notify All Users</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0'
    },
    backBtn: {
        padding: 5
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginLeft: 12
    },
    content: {
        padding: 20
    },
    infoCard: {
        backgroundColor: '#EEF2FF',
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 15
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#4F46E5',
        lineHeight: 20,
        fontWeight: '500'
    },
    formSection: {
        gap: 15
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: -8
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#1E293B'
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    summaryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 10,
        gap: 8,
        marginTop: 5
    },
    summaryText: {
        fontSize: 13,
        color: '#64748B'
    },
    button: {
        backgroundColor: '#4F46E5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 10,
        marginTop: 30,
        marginBottom: 50,
        elevation: 2
    },
    buttonDisabled: {
        opacity: 0.7
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700'
    }
});

export default ReleaseManagementScreen;
