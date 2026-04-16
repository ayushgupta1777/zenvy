import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, Modal, TextInput, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const AdminWithdrawalsScreen = ({ navigation }) => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modal for processing
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [utrNumber, setUtrNumber] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/admin/resellers/withdrawals');
            if (response.data.success) {
                setWithdrawals(response.data.data.withdrawals);
            }
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error);
            Alert.alert('Error', 'Failed to load withdrawal requests');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchWithdrawals();
        setIsRefreshing(false);
    };

    const handleProcess = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setUtrNumber('');
        setRejectionReason('');
        setIsModalVisible(true);
    };

    const submitAction = async (action) => {
        if (action === 'complete' && !utrNumber.trim()) {
            Alert.alert('Required', 'Please enter UTR/Reference number for completed transfer');
            return;
        }
        if (action === 'reject' && !rejectionReason.trim()) {
            Alert.alert('Required', 'Please enter reason for rejection');
            return;
        }

        try {
            setIsProcessing(true);
            const response = await api.put(`/admin/resellers/withdrawals/${selectedWithdrawal._id}/process`, {
                action,
                utrNumber: action === 'complete' ? utrNumber : undefined,
                rejectionReason: action === 'reject' ? rejectionReason : undefined
            });

            if (response.data.success) {
                Alert.alert('Success', `Withdrawal ${action === 'complete' ? 'completed' : 'rejected'} successfully`);
                setIsModalVisible(false);
                fetchWithdrawals();
            }
        } catch (error) {
            console.error('Processing failed:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to process withdrawal');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderWithdrawalItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user?.name || 'Unknown User'}</Text>
                    <Text style={styles.userEmail}>{item.user?.email}</Text>
                </View>
                <Text style={styles.amount}>₹{item.amount}</Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <Icon name="time-outline" size={14} color="#6B7280" />
                    <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>

                <View style={[styles.statusBadge, item.status === 'pending' ? styles.pendingBadge : item.status === 'completed' ? styles.completedBadge : styles.rejectedBadge]}>
                    <Text style={[styles.statusText, item.status === 'pending' ? styles.pendingText : item.status === 'completed' ? styles.completedText : styles.rejectedText]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            {item.status === 'pending' && (
                <TouchableOpacity
                    style={styles.processButton}
                    onPress={() => handleProcess(item)}
                >
                    <Text style={styles.processButtonText}>Process Payout</Text>
                    <Icon name="chevron-forward" size={16} color="#4F46E5" />
                </TouchableOpacity>
            )}

            {item.status === 'completed' && item.utrNumber && (
                <Text style={styles.utrText}>UTR: {item.utrNumber}</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Withdrawal Requests</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={withdrawals}
                keyExtractor={(item) => item._id}
                renderItem={renderWithdrawalItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    !isLoading && (
                        <View style={styles.emptyContainer}>
                            <Icon name="cash-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No withdrawal requests found</Text>
                        </View>
                    )
                }
            />

            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Process Withdrawal</Text>
                        <Text style={styles.modalSubtitle}>Amount: ₹{selectedWithdrawal?.amount}</Text>

                        <Text style={styles.label}>Transaction ID / UTR (For Approval)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter UTR number"
                            value={utrNumber}
                            onChangeText={setUtrNumber}
                        />

                        <Text style={styles.label}>Rejection Reason (For Rejection)</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Enter reason if rejecting"
                            multiline
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setIsModalVisible(false)}
                                disabled={isProcessing}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, styles.rejectBtn]}
                                onPress={() => submitAction('reject')}
                                disabled={isProcessing}
                            >
                                <Text style={styles.rejectBtnText}>Reject</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, styles.approveBtn]}
                                onPress={() => submitAction('complete')}
                                disabled={isProcessing}
                            >
                                {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.approveBtnText}>Approve</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
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
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    userName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    userEmail: { fontSize: 12, color: '#6B7280' },
    amount: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    date: { fontSize: 12, color: '#6B7280' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    pendingBadge: { backgroundColor: '#FEF3C7' },
    completedBadge: { backgroundColor: '#DEF7EC' },
    rejectedBadge: { backgroundColor: '#FDE8E8' },
    statusText: { fontSize: 10, fontWeight: '700' },
    pendingText: { color: '#D97706' },
    completedText: { color: '#057A55' },
    rejectedText: { color: '#C81E1E' },
    processButton: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4
    },
    processButtonText: { color: '#4F46E5', fontWeight: '600' },
    utrText: { marginTop: 8, fontSize: 12, color: '#4B5563', fontFamily: 'monospace' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, color: '#9CA3AF', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
    modalSubtitle: { fontSize: 16, color: '#4F46E5', fontWeight: '600', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#111827',
        marginBottom: 16
    },
    modalButtons: { flexDirection: 'row', gap: 8 },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#F3F4F6' },
    cancelBtnText: { color: '#4B5563', fontWeight: '600' },
    rejectBtn: { backgroundColor: '#FDE8E8' },
    rejectBtnText: { color: '#C81E1E', fontWeight: '600' },
    approveBtn: { backgroundColor: '#10B981' },
    approveBtnText: { color: '#fff', fontWeight: '600' }
});

export default AdminWithdrawalsScreen;
