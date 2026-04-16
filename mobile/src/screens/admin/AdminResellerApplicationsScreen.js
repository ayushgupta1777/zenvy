import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const AdminResellerApplicationsScreen = ({ navigation }) => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/admin/resellers/applications');
            if (response.data.success) {
                setApplications(response.data.data.applications);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            Alert.alert('Error', 'Failed to load applications');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchApplications();
        setIsRefreshing(false);
    };

    const handleReview = async (userId, status) => {
        Alert.alert(
            'Confirm Action',
            `Are you sure you want to ${status} this application?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: status.charAt(0).toUpperCase() + status.slice(1),
                    style: status === 'approved' ? 'default' : 'destructive',
                    onPress: () => submitReview(userId, status)
                }
            ]
        );
    };

    const submitReview = async (userId, status) => {
        try {
            setIsProcessing(true);
            const response = await api.put(`/admin/resellers/applications/${userId}/review`, {
                status,
                note: status === 'approved' ? 'Application approved by admin' : 'Application rejected'
            });

            if (response.data.success) {
                Alert.alert('Success', `Application ${status} successfully`);
                fetchApplications();
            }
        } catch (error) {
            console.error('Review failed:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to review application');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name?.charAt(0) || 'U'}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <Text style={styles.date}>Applied: {new Date(item.resellerApplication?.appliedAt).toLocaleDateString()}</Text>
                </View>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Bank Name:</Text>
                    <Text style={styles.detailValue}>{item.resellerApplication?.bankName || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>A/C Number:</Text>
                    <Text style={styles.detailValue}>{item.resellerApplication?.accountNumber || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>IFSC Code:</Text>
                    <Text style={styles.detailValue}>{item.resellerApplication?.ifscCode || 'N/A'}</Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.btn, styles.rejectBtn]}
                    onPress={() => handleReview(item._id, 'rejected')}
                    disabled={isProcessing}
                >
                    <Icon name="close-circle-outline" size={20} color="#C81E1E" />
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.approveBtn]}
                    onPress={() => handleReview(item._id, 'approved')}
                    disabled={isProcessing}
                >
                    <Icon name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reseller Applications</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={applications}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    !isLoading && (
                        <View style={styles.emptyContainer}>
                            <Icon name="people-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No pending applications</Text>
                        </View>
                    )
                }
            />

            {isProcessing && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        elevation: 2
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    listContent: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    avatarText: { fontSize: 20, fontWeight: '700', color: '#4F46E5' },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    userEmail: { fontSize: 14, color: '#6B7280' },
    date: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
    detailsContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16
    },
    detailItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    detailLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    detailValue: { fontSize: 12, color: '#111827', fontWeight: '600' },
    actionButtons: { flexDirection: 'row', gap: 12 },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8
    },
    rejectBtn: { backgroundColor: '#FDE8E8', borderWidth: 1, borderColor: '#F98080' },
    approveBtn: { backgroundColor: '#10B981' },
    rejectText: { color: '#C81E1E', fontWeight: '700', fontSize: 14 },
    approveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, color: '#9CA3AF', fontSize: 16 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default AdminResellerApplicationsScreen;
