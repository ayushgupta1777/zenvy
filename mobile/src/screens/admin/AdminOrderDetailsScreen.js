import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Modal, Image, Linking, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { getImageUrl } from '../../services/api';

const AdminOrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/admin/orders/${orderId}`);
      setOrder(response.data.data.order);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setIsProcessing(true);
      await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      fetchOrder();
      setShowStatusModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setIsProcessing(false);
    }
  };

  const createShipment = () => {
    navigation.navigate('CreateShipment', { orderId });
  };

  const generateLabel = async () => {
    try {
      setIsProcessing(true);
      const response = await api.get(`/shiprocket/label/${orderId}`);
      const labelUrl = response.data.data.labelUrl;

      if (!labelUrl) {
        throw new Error('Label URL not found in response');
      }

      openDocument(labelUrl);
    } catch (error) {
      console.error('Label generation error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate label');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateInvoice = async () => {
    try {
      setIsProcessing(true);
      const response = await api.get(`/shiprocket/invoice/${orderId}`);
      const invoiceUrl = response.data.data.invoiceUrl;

      if (!invoiceUrl) {
        throw new Error('Invoice URL not found in response');
      }

      openDocument(invoiceUrl);
    } catch (error) {
      console.error('Invoice generation error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePackingSlip = async () => {
    try {
      setIsProcessing(true);
      const response = await api.get(`/shiprocket/packing-slip/${orderId}`);
      const packingSlipUrl = response.data.data.packingSlipUrl;

      if (!packingSlipUrl) {
        throw new Error('Packing slip URL not found in response');
      }

      openDocument(packingSlipUrl);
    } catch (error) {
      console.error('Packing slip generation error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate packing slip');
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePremiumPickList = async () => {
    const pickListUrl = `https://newrajfancystore.adsngrow.in/api/shiprocket/pick-list/${orderId}`;
    Linking.openURL(pickListUrl).catch(err => {
      console.error("Failed to open URL:", err);
      Alert.alert("Error", "Could not open Premium Pick List");
    });
  };

  const openDocument = (url) => {
    // CRITICAL FIX: Android often opens PDFs as raw text. 
    // We use Google Docs Viewer as a proxy to ensure it renders correctly on mobile.
    const finalUrl = Platform.OS === 'android' 
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`
      : url;

    Linking.openURL(finalUrl).catch(err => {
      console.error("Failed to open URL:", err);
      Alert.alert("Error", "Could not open document. Please try a different browser.");
    });
  };

  const schedulePickup = async () => {
    Alert.alert(
      'Schedule Pickup',
      'This will schedule a pickup with the courier. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Schedule',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await api.post(`/shiprocket/schedule-pickup/${orderId}`);
              Alert.alert('Success', 'Pickup scheduled successfully');
              fetchOrder();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to schedule pickup');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const trackShipment = async () => {
    try {
      setIsProcessing(true);
      // We navigate to OrderTracking screen which is common for user and admin
      navigation.navigate('OrderTracking', {
        orderId: orderId
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to open tracking');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelShipment = async () => {
    Alert.alert(
      'Cancel Shipment',
      'This will cancel the shipment in Shiprocket. This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await api.delete(`/shiprocket/shipment/${orderId}`);
              Alert.alert('Success', 'Shipment cancelled');
              fetchOrder();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel shipment');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This will restore stock and notify the customer.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await api.put(`/admin/orders/${orderId}/cancel`, {
                reason: 'Admin cancelled order'
              });
              Alert.alert('Success', 'Order has been cancelled');
              fetchOrder();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const statusFlow = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'];
  const currentIndex = statusFlow.indexOf(order.orderStatus);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNo}</Text>
        <TouchableOpacity onPress={() => setShowStatusModal(true)}>
          <Icon name="pencil" size={22} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timeline}>
            {statusFlow.map((status, index) => (
              <View key={status} style={styles.timelineItem}>
                <View style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineDot,
                      index <= currentIndex && styles.timelineDotActive
                    ]}
                  >
                    <Icon
                      name={index <= currentIndex ? 'checkmark' : 'ellipse'}
                      size={index <= currentIndex ? 16 : 12}
                      color={index <= currentIndex ? '#fff' : '#D1D5DB'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.timelineLabel,
                      index <= currentIndex && styles.timelineLabelActive
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
                {index < statusFlow.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      index < currentIndex && styles.timelineLineActive
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          <View style={styles.statusButtonsRow}>
            <TouchableOpacity
              style={styles.updateStatusBtn}
              onPress={() => setShowStatusModal(true)}
            >
              <Icon name="create-outline" size={20} color="#4F46E5" />
              <Text style={styles.updateStatusText}>Update Status</Text>
            </TouchableOpacity>

            {!['delivered', 'cancelled', 'returned', 'refunded', 'completed'].includes(order.orderStatus) && (
              <TouchableOpacity
                style={[styles.updateStatusBtn, styles.cancelOrderBtn]}
                onPress={handleCancelOrder}
              >
                <Icon name="close-circle-outline" size={20} color="#EF4444" />
                <Text style={styles.cancelOrderText}>Cancel Order</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Shiprocket Actions */}
        {order.orderStatus !== 'cancelled' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Actions</Text>

            {!order.shiprocket?.shipmentId ? (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={createShipment}
                disabled={isProcessing}
              >
                <Icon name="rocket-outline" size={24} color="#4F46E5" />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Create Shipment</Text>
                  <Text style={styles.actionSubtitle}>
                    Generate AWB and schedule pickup
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : (
              <>
                {/* Shipment Info */}
                <View style={styles.shipmentInfo}>
                  <View style={styles.shipmentRow}>
                    <Text style={styles.shipmentLabel}>AWB Number</Text>
                    <Text style={styles.shipmentValue}>
                      {order.shiprocket.awb || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.shipmentRow}>
                    <Text style={styles.shipmentLabel}>Courier</Text>
                    <Text style={styles.shipmentValue}>
                      {order.shiprocket.courierName || 'N/A'}
                    </Text>
                  </View>
                  {order.shiprocket.pickupScheduledDate && (
                    <View style={styles.shipmentRow}>
                      <Text style={styles.shipmentLabel}>Pickup Date</Text>
                      <Text style={styles.shipmentValue}>
                        {new Date(order.shiprocket.pickupScheduledDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions Grid */}
                <View style={styles.actionsSection}>
                  <Text style={styles.subSectionTitle}>Documents (Printable)</Text>
                  <View style={styles.actionsGrid}>
                    <TouchableOpacity
                      style={styles.gridAction}
                      onPress={generateLabel}
                      disabled={isProcessing}
                    >
                      <Icon name="barcode-outline" size={28} color="#4F46E5" />
                      <Text style={styles.gridActionText}>Label</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.gridAction}
                      onPress={generateInvoice}
                      disabled={isProcessing}
                    >
                      <Icon name="receipt-outline" size={28} color="#4F46E5" />
                      <Text style={styles.gridActionText}>Invoice</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.gridAction}
                      onPress={generatePackingSlip}
                      disabled={isProcessing}
                    >
                      <Icon name="list-outline" size={28} color="#4F46E5" />
                      <Text style={styles.gridActionText}>Packing Slip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.gridAction, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
                      onPress={generatePremiumPickList}
                      disabled={isProcessing}
                    >
                      <Icon name="star" size={28} color="#16A34A" />
                      <Text style={[styles.gridActionText, { color: '#16A34A' }]}>Premium Pick-List</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subSectionTitle}>Logistics & Tracking</Text>
                  <View style={styles.actionsGrid}>
                    <TouchableOpacity
                      style={styles.gridAction}
                      onPress={schedulePickup}
                      disabled={isProcessing}
                    >
                      <Icon name="calendar-outline" size={28} color="#10B981" />
                      <Text style={styles.gridActionText}>Schedule Pickup</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.gridAction}
                      onPress={trackShipment}
                      disabled={isProcessing}
                    >
                      <Icon name="navigate-outline" size={28} color="#F59E0B" />
                      <Text style={styles.gridActionText}>Track Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.gridAction, styles.gridActionDanger]}
                      onPress={cancelShipment}
                      disabled={isProcessing}
                    >
                      <Icon name="close-circle-outline" size={28} color="#EF4444" />
                      <Text style={[styles.gridActionText, { color: '#EF4444' }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{order.user?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{order.user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.shippingAddress.phone}`)}>
              <Text style={[styles.infoValue, { color: '#4F46E5', textDecorationLine: 'underline' }]}>
                {order.shippingAddress.phone}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressBox}>
            <Icon name="location" size={20} color="#4F46E5" />
            <View style={styles.addressContent}>
              <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.addressLine1}
              </Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </Text>
              <Text style={styles.addressText}>
                Pincode: {order.shippingAddress.pincode}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items - WITH PRODUCT IMAGES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              {/* Product Image */}
              {item.product?.images && item.product.images[0] && (
                <TouchableOpacity onPress={() => {
                  setSelectedImageUrl(getImageUrl(item.product.images[0]));
                  setShowImageModal(true);
                }}>
                  <Image
                    source={{ uri: getImageUrl(item.product.images[0]) }}
                    style={styles.itemImage}
                  />
                </TouchableOpacity>
              )}

              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product?.title}
                </Text>

                {/* Item Details */}
                <View style={styles.itemMetaRow}>
                  <View style={styles.itemMetaBox}>
                    <Text style={styles.itemMetaLabel}>Qty</Text>
                    <Text style={styles.itemMetaValue}>{item.quantity}</Text>
                  </View>

                  <View style={styles.itemMetaBox}>
                    <Text style={styles.itemMetaLabel}>Unit Price</Text>
                    <Text style={styles.itemMetaValue}>₹{item.price}</Text>
                  </View>

                  <View style={styles.itemMetaBox}>
                    <Text style={styles.itemMetaLabel}>Total</Text>
                    <Text style={styles.itemMetaValue}>₹{item.finalPrice}</Text>
                  </View>
                </View>

                {/* SKU if available */}
                {(item.sku || item.product?.sku) && (
                  <View style={styles.skuBadge}>
                    <Text style={styles.itemSku}>SKU: {item.sku || item.product.sku}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{order.subtotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <Text style={styles.priceValue}>
              {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax</Text>
            <Text style={styles.priceValue}>₹{order.tax}</Text>
          </View>
          {order.coupon && order.coupon.code && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: '#10B981', fontWeight: '600' }]}>
                Discount ({order.coupon.code})
              </Text>
              <Text style={[styles.priceValue, { color: '#10B981' }]}>
                -₹{order.coupon.discountAmount}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.total}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {statusFlow.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    order.orderStatus === status && styles.statusOptionActive
                  ]}
                  onPress={() => updateOrderStatus(status)}
                  disabled={isProcessing}
                >
                  <Icon
                    name={order.orderStatus === status ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={order.orderStatus === status ? '#4F46E5' : '#D1D5DB'}
                  />
                  <Text style={[
                    styles.statusOptionText,
                    order.orderStatus === status && styles.statusOptionTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        </View>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageOverlay}>
          <TouchableOpacity
            style={styles.closeImageBtn}
            onPress={() => setShowImageModal(false)}
          >
            <Icon name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>
          {selectedImageUrl && (
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center' },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  timeline: { marginBottom: 16 },
  timelineItem: { marginBottom: 12 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  timelineDotActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  timelineLabel: { fontSize: 14, color: '#6B7280', paddingRight: 4 },
  timelineLabelActive: { color: '#4F46E5', fontWeight: '600' },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 15,
    marginVertical: 4
  },
  timelineLineActive: { backgroundColor: '#4F46E5' },
  updateStatusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4F46E5'
  },
  updateStatusText: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  cancelOrderBtn: {
    borderColor: '#EF4444',
  },
  cancelOrderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444'
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    gap: 12
  },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  actionSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  shipmentInfo: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16
  },
  shipmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  shipmentLabel: { fontSize: 14, color: '#6B7280' },
  shipmentValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  actionsSection: {
    gap: 12
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  gridAction: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  gridActionDanger: {
    borderColor: '#FEE2E2'
  },
  gridActionText: { fontSize: 11, fontWeight: '700', color: '#111827', textAlign: 'center' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  addressBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 8
  },
  addressContent: { flex: 1 },
  addressName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },

  // Updated Item Card Styles with Image
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },

  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },

  itemContent: {
    flex: 1,
    justifyContent: 'space-between'
  },

  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8
  },

  itemMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },

  itemMetaBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },

  itemMetaLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600'
  },

  itemMetaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 2
  },

  itemSku: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '700'
  },

  skuBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  priceLabel: { fontSize: 14, color: '#6B7280', paddingRight: 4 },
  priceValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#4F46E5' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalBody: { padding: 20 },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB'
  },
  statusOptionActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#4F46E5'
  },
  statusOptionText: { fontSize: 15, color: '#6B7280' },
  statusOptionTextActive: { color: '#4F46E5', fontWeight: '600' },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  processingBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center'
  },
  processingText: {
    fontSize: 16,
    color: '#111827',
    marginTop: 12
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullImage: {
    width: '95%',
    height: '80%',
    borderRadius: 12
  },
  closeImageBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10
  }
});

export default AdminOrderDetailsScreen;