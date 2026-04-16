import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const CreateShipmentScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShipping, setIsShipping] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [orderRes, settingsRes] = await Promise.all([
        api.get(`/admin/orders/${orderId}`),
        api.get('/shiprocket/settings')
      ]);
      setOrder(orderRes.data.data.order);
      setSettings(settingsRes.data.data.settings);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load shipment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShipment = async () => {
    try {
      setIsShipping(true);
      const response = await api.post(`/shiprocket/shipment/${orderId}`);
      
      if (response.data.success) {
        Alert.alert(
          'Success',
          'Shipment created successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Failed to create shipment';
      Alert.alert('Shipment Error', errorMsg);
    } finally {
      setIsShipping(false);
    }
  };

  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const pickupLocation = settings?.pickupLocations?.find(l => l.isDefault) || settings?.pickupLocations?.[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Shipment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order No:</Text>
              <Text style={styles.detailValue}>#{order.orderNo}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer:</Text>
              <Text style={styles.detailValue}>{order.user?.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Items:</Text>
              <Text style={styles.detailValue}>{order.items.length} Products</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Mode:</Text>
              <Text style={[styles.detailValue, { color: order.paymentMethod === 'cod' ? '#F59E0B' : '#10B981' }]}>
                {order.paymentMethod.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>{order.shippingAddress.name}</Text>
            <Text style={styles.addressText}>{order.shippingAddress.addressLine1}</Text>
            {order.shippingAddress.addressLine2 ? (
              <Text style={styles.addressText}>{order.shippingAddress.addressLine2}</Text>
            ) : null}
            <Text style={styles.addressText}>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </Text>
            <Text style={styles.addressText}>Phone: {order.shippingAddress.phone}</Text>
          </View>
        </View>

        {/* Package Dimensions (Defaults) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Package Details</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShiprocketSettings')}>
                <Text style={styles.editBtnText}>Edit Defaults</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dimensionCard}>
            <View style={styles.dimensionRow}>
                <View style={styles.dimItem}>
                    <Text style={styles.dimLabel}>Weight</Text>
                    <Text style={styles.dimValue}>{settings?.defaultWeight || 0.5} kg</Text>
                </View>
                <View style={styles.dimItem}>
                    <Text style={styles.dimLabel}>Length</Text>
                    <Text style={styles.dimValue}>{settings?.defaultLength || 10} cm</Text>
                </View>
                <View style={styles.dimItem}>
                    <Text style={styles.dimLabel}>Breadth</Text>
                    <Text style={styles.dimValue}>{settings?.defaultBreadth || 10} cm</Text>
                </View>
                <View style={styles.dimItem}>
                    <Text style={styles.dimLabel}>Height</Text>
                    <Text style={styles.dimValue}>{settings?.defaultHeight || 10} cm</Text>
                </View>
            </View>
            <Text style={styles.helperText}>
                Dimensions are pulled from your Shiprocket Settings.
            </Text>
          </View>
        </View>

        {/* Pickup Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Warehouse</Text>
          {pickupLocation ? (
            <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                    <Icon name="business" size={20} color="#4F46E5" />
                    <Text style={styles.locationName}>{pickupLocation.name}</Text>
                </View>
                <Text style={styles.locationAddress}>
                    {pickupLocation.address}, {pickupLocation.city} - {pickupLocation.pincode}
                </Text>
            </View>
          ) : (
             <View style={styles.errorCard}>
                <Icon name="warning" size={20} color="#EF4444" />
                <Text style={styles.errorText}>No pickup location configured!</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ShiprocketSettings')}>
                    <Text style={styles.fixLink}>Configure Now</Text>
                </TouchableOpacity>
             </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.shipBtn, (!pickupLocation || isShipping) && styles.shipBtnDisabled]}
          onPress={handleCreateShipment}
          disabled={!pickupLocation || isShipping}
        >
          {isShipping ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="airplane" size={22} color="#fff" />
              <Text style={styles.shipBtnText}>Confirm & Create Shipment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  section: { padding: 20, backgroundColor: '#fff', marginTop: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  editBtnText: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
  detailCard: { gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14, color: '#6B7280' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  addressCard: { gap: 4 },
  addressText: { fontSize: 14, color: '#374151' },
  dimensionCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 },
  dimensionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dimItem: { alignItems: 'center' },
  dimLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  dimValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  helperText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', fontStyle: 'italic' },
  locationCard: { backgroundColor: '#EEF2FF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE' },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  locationName: { fontSize: 15, fontWeight: '700', color: '#4338CA' },
  locationAddress: { fontSize: 13, color: '#4F46E5' },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12 },
  errorText: { fontSize: 14, color: '#DC2626', fontWeight: '600' },
  fixLink: { fontSize: 14, color: '#4F46E5', fontWeight: '700', marginLeft: 8 },
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  shipBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12
  },
  shipBtnDisabled: { backgroundColor: '#9CA3AF' },
  shipBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' }
});

export default CreateShipmentScreen;
