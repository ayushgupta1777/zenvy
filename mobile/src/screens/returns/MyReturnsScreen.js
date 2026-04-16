// 3. MY RETURNS SCREEN
// screens/returns/MyReturnsScreen.js


import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';
import CustomHeader from '../../components/CustomHeader';


const MyReturnsScreen = ({ navigation }) => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await api.get('/returns');
      setReturns(response.data.data.returns);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#F59E0B',
      approved: '#3B82F6',
      rejected: '#EF4444',
      pickup_scheduled: '#8B5CF6',
      picked_up: '#0EA5E9',
      received: '#10B981',
      refunded: '#059669',
      cancelled: '#6B7280'
    };
    return colorMap[status] || '#6B7280';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (returns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="arrow-back-circle-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No Return Requests</Text>
        <Text style={styles.emptySubtitle}>You haven't made any return requests yet</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <CustomHeader title="My Returns" showBack={true} />
      <ScrollView style={styles.container}>
        {returns.map((returnRequest) => (
          <TouchableOpacity
            key={returnRequest._id}
            style={styles.returnCard}
            onPress={() => navigation.navigate('ReturnDetails', { returnId: returnRequest._id })}
          >
            <View style={styles.returnHeader}>
              <Text style={styles.returnNo}>Return #{returnRequest.returnNo}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(returnRequest.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(returnRequest.status) }]}>
                  {returnRequest.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.returnOrder}>Order #{returnRequest.order.orderNo}</Text>
            <Text style={styles.returnAmount}>Refund Amount: ₹{returnRequest.refundAmount}</Text>
            <Text style={styles.returnDate}>
              Requested on {new Date(returnRequest.createdAt).toLocaleDateString()}
            </Text>

            <View style={styles.returnFooter}>
              <Icon name="chevron-forward" size={20} color="#4F46E5" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 14, color: '#6B7280' },
  headerCard: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderNo: { fontSize: 20, fontWeight: '700', color: '#111827' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  trackingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  trackingDetails: { flex: 1 },
  trackingLabel: { fontSize: 12, color: '#6B7280' },
  trackingNumber: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 2 },
  courierInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courierName: { fontSize: 14, color: '#4B5563' },
  timelineCard: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  timeline: { marginLeft: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 24 },
  timelineIconContainer: { alignItems: 'center', marginRight: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E5E7EB', marginBottom: 4 },
  timelineDotActive: { backgroundColor: '#4F46E5', width: 16, height: 16, borderRadius: 8 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB' },
  timelineContent: { flex: 1 },
  eventStatus: { fontSize: 14, fontWeight: '600', color: '#111827' },
  eventDescription: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  eventLocation: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  eventTime: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  noTracking: { alignItems: 'center', padding: 32 },
  noTrackingText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 16 },
  actionsCard: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: '#EEF2FF', borderRadius: 8, marginBottom: 12 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  deliveryCard: { backgroundColor: '#fff', padding: 24, alignItems: 'center', marginBottom: 12 },
  deliveryTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 12 },
  deliveryDate: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  returnButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#FEE2E2', borderRadius: 8 },
  returnButtonText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  headerInfo: { backgroundColor: '#fff', padding: 24, alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 12 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginBottom: 8 },
  itemCardSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  checkbox: { marginRight: 12 },
  itemImage: { width: 60, height: 60, borderRadius: 6 },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemPrice: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  reasonOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginBottom: 8 },
  reasonOptionSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  reasonText: { fontSize: 14, color: '#111827' },
  textArea: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 14, textAlignVertical: 'top' },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, margin: 16 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  returnCard: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 8 },
  returnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  returnNo: { fontSize: 16, fontWeight: '700', color: '#111827' },
  returnOrder: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  returnAmount: { fontSize: 14, fontWeight: '600', color: '#10B981', marginBottom: 4 },
  returnDate: { fontSize: 12, color: '#9CA3AF' },
  returnFooter: { alignItems: 'flex-end', marginTop: 8 }
});

export default MyReturnsScreen;