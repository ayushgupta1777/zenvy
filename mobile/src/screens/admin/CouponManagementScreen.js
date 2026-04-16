import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, StyleSheet, ActivityIndicator,
    Alert, Switch, FlatList, Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const CouponManagementScreen = ({ navigation }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        minOrderAmount: '0',
        maxDiscountAmount: '',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: '',
        perUserLimit: '1',
        isActive: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await api.get('/coupons');
            setCoupons(response.data.data.coupons);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            if (!formData.code || !formData.discountAmount || !formData.expiryDate) {
                Alert.alert('Error', 'Please fill all required fields');
                return;
            }

            const payload = {
                ...formData,
                discountAmount: parseFloat(formData.discountAmount),
                minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                perUserLimit: parseInt(formData.perUserLimit) || 1
            };

            if (isEditing) {
                await api.put(`/coupons/${currentCoupon._id}`, payload);
                Alert.alert('Success', 'Coupon updated successfully');
            } else {
                await api.post('/coupons', payload);
                Alert.alert('Success', 'Coupon created successfully');
            }

            setModalVisible(false);
            fetchCoupons();
            resetForm();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Coupon',
            'Are you sure you want to delete this coupon?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/coupons/${id}`);
                            fetchCoupons();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete coupon');
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (coupon) => {
        setCurrentCoupon(coupon);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountAmount: String(coupon.discountAmount),
            minOrderAmount: String(coupon.minOrderAmount),
            maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : '',
            expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
            perUserLimit: String(coupon.perUserLimit),
            isActive: coupon.isActive
        });
        setIsEditing(true);
        setModalVisible(true);
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountAmount: '',
            minOrderAmount: '0',
            maxDiscountAmount: '',
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            usageLimit: '',
            perUserLimit: '1',
            isActive: true
        });
        setIsEditing(false);
        setCurrentCoupon(null);
    };

    const renderCouponItem = ({ item }) => (
        <View style={styles.couponCard}>
            <View style={styles.couponHeader}>
                <View>
                    <Text style={styles.couponCode}>{item.code}</Text>
                    <Text style={styles.discountText}>
                        {item.discountType === 'percentage' ? `${item.discountAmount}% OFF` : `₹${item.discountAmount} OFF`}
                    </Text>
                </View>
                <Switch
                    value={item.isActive}
                    onValueChange={async (value) => {
                        try {
                            await api.put(`/coupons/${item._id}`, { isActive: value });
                            fetchCoupons();
                        } catch (error) {
                            Alert.alert('Error', 'Update failed');
                        }
                    }}
                    trackColor={{ false: '#E5E7EB', true: '#A5B4FC' }}
                    thumbColor={item.isActive ? '#4F46E5' : '#F3F4F6'}
                />
            </View>

            <View style={styles.couponBody}>
                <View style={styles.infoRow}>
                    <Icon name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>Expires: {new Date(item.expiryDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="stats-chart-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>Used: {item.usedCount} {item.usageLimit ? `/ ${item.usageLimit}` : '(No Limit)'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Icon name="cash-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>Min Order: ₹{item.minOrderAmount}</Text>
                </View>
            </View>

            <View style={styles.couponActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
                    <Icon name="pencil" size={18} color="#4F46E5" />
                    <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
                    <Icon name="trash-outline" size={18} color="#EF4444" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vouchers & Coupons</Text>
                <TouchableOpacity onPress={() => { resetForm(); setModalVisible(true); }}>
                    <Icon name="add-circle" size={28} color="#4F46E5" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#4F46E5" />
            ) : (
                <FlatList
                    data={coupons}
                    renderItem={renderCouponItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="ticket-outline" size={60} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No coupons found</Text>
                            <Text style={styles.emptySubtext}>Create your first coupon to get started</Text>
                        </View>
                    }
                />
            )}

            {/* Create/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{isEditing ? 'Edit Coupon' : 'Create New Coupon'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Coupon Code*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. SAVE10"
                                    value={formData.code}
                                    onChangeText={text => setFormData({ ...formData, code: text.toUpperCase() })}
                                    autoCapitalize="characters"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Discount Type*</Text>
                                    <View style={styles.typeSelector}>
                                        <TouchableOpacity
                                            style={[styles.typeBtn, formData.discountType === 'percentage' && styles.typeBtnActive]}
                                            onPress={() => setFormData({ ...formData, discountType: 'percentage' })}
                                        >
                                            <Text style={[styles.typeBtnText, formData.discountType === 'percentage' && styles.typeBtnTextActive]}>%</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.typeBtn, formData.discountType === 'fixed' && styles.typeBtnActive]}
                                            onPress={() => setFormData({ ...formData, discountType: 'fixed' })}
                                        >
                                            <Text style={[styles.typeBtnText, formData.discountType === 'fixed' && styles.typeBtnTextActive]}>₹</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Amount*</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10 or 200"
                                        keyboardType="numeric"
                                        value={formData.discountAmount}
                                        onChangeText={text => setFormData({ ...formData, discountAmount: text })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Min. Order Amount (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={formData.minOrderAmount}
                                    onChangeText={text => setFormData({ ...formData, minOrderAmount: text })}
                                />
                            </View>

                            {formData.discountType === 'percentage' && (
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Max Discount (₹ - Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 500"
                                        keyboardType="numeric"
                                        value={formData.maxDiscountAmount}
                                        onChangeText={text => setFormData({ ...formData, maxDiscountAmount: text })}
                                    />
                                </View>
                            )}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Expiry Date* (YYYY-MM-DD)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="2024-12-31"
                                    value={formData.expiryDate}
                                    onChangeText={text => setFormData({ ...formData, expiryDate: text })}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Global Usage Limit</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Unlimited"
                                        keyboardType="numeric"
                                        value={formData.usageLimit}
                                        onChangeText={text => setFormData({ ...formData, usageLimit: text })}
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Per User Limit</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1"
                                        keyboardType="numeric"
                                        value={formData.perUserLimit}
                                        onChangeText={text => setFormData({ ...formData, perUserLimit: text })}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOrUpdate}>
                                <Text style={styles.submitBtnText}>{isEditing ? 'Update Coupon' : 'Create Coupon'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
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
    listContent: { padding: 16, paddingBottom: 40 },
    couponCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4
    },
    couponHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    couponCode: { fontSize: 18, fontWeight: '800', color: '#4F46E5', letterSpacing: 1 },
    discountText: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
    couponBody: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 12,
        gap: 8,
        marginBottom: 16
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 13, color: '#374151' },
    couponActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        gap: 20
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    editBtnText: { color: '#4F46E5', fontWeight: '600' },
    deleteBtnText: { color: '#EF4444', fontWeight: '600' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptySubtext: { fontSize: 14, color: '#6B7280', marginTop: 8 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
    modalContainer: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, maxHeight: '80%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalForm: { padding: 20 },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 15 },
    row: { flexDirection: 'row' },
    typeSelector: { flexDirection: 'row', height: 48, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
    typeBtn: { flex: 1, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
    typeBtnActive: { backgroundColor: '#4F46E5' },
    typeBtnText: { fontSize: 18, fontWeight: '700', color: '#6B7280' },
    typeBtnTextActive: { color: '#fff' },
    submitBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 20 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default CouponManagementScreen;
