import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../styling/screens/orders/OrderSuccessScreenPremiumStyles';

const OrderSuccessScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  // 1. Extra Defensive Param Check
  const { order } = route?.params || {};

  // Safety fallback if order is missing to prevent total crash
  if (!order || !order.orderNo) {
    console.warn('[OrderSuccess] Missing order details in route params');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <Icon name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16 }}>Something went wrong</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
          Order placed but could not display details details.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 24, backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Back to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Safe Property Access
  const orderId = order?._id || '';
  const orderNo = order?.orderNo || 'N/A';
  const total = order?.total || 0;
  const paymentMethod = order?.paymentMethod || 'cod';
  const city = order?.shippingAddress?.city || 'City';
  const state = order?.shippingAddress?.state || 'State';

  return (
    <View style={styles['order-success-premium-screen']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#4F46E5', '#7165E3', '#C026D3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ 
            alignItems: 'center', 
            width: '100%', 
            paddingBottom: 40,
            paddingTop: insets.top + 20 
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Icon */}
          <View style={styles['order-success-premium-animation']}>
            <View style={styles['order-success-premium-circle']}>
              <View style={styles['order-success-premium-circle-inner']}>
                <Icon name="checkmark" size={60} color="#4F46E5" />
              </View>
            </View>
          </View>

          <Text style={styles['order-success-premium-title']}>
            Order Successful!
          </Text>

          <Text style={styles['order-success-premium-subtitle']}>
            Your shopping experience just got better
          </Text>

          {/* Details Card */}
          <View style={styles['order-success-premium-details-card']}>
            <View style={styles['order-success-premium-detail-row']}>
              <Text style={styles['order-success-premium-detail-label']}>Order Number</Text>
              <Text style={styles['order-success-premium-detail-value']}>#{orderNo}</Text>
            </View>

            <View style={styles['order-success-premium-divider']} />

            <View style={styles['order-success-premium-detail-row']}>
              <Text style={styles['order-success-premium-detail-label']}>Paid Amount</Text>
              <Text style={styles['order-success-premium-detail-value-highlight']}>₹{total}</Text>
            </View>

            <View style={styles['order-success-premium-divider']} />

            <View style={styles['order-success-premium-detail-row']}>
              <Text style={styles['order-success-premium-detail-label']}>Method</Text>
              <View style={styles['order-success-premium-payment-badge']}>
                <Icon
                  name={paymentMethod === 'cod' ? 'cash' : 'card'}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles['order-success-premium-detail-value']}>
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                </Text>
              </View>
            </View>

            <View style={styles['order-success-premium-divider']} />

            <View style={styles['order-success-premium-detail-row']}>
              <Text style={styles['order-success-premium-detail-label']}>Status</Text>
              <Text style={styles['order-success-premium-detail-value']}>Confirmed</Text>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles['order-success-premium-delivery-info']}>
            <View style={styles['order-success-premium-delivery-icon-wrapper']}>
              <Icon name="location" size={24} color="#FFFFFF" />
            </View>
            <View style={styles['order-success-premium-delivery-info-text']}>
              <Text style={styles['order-success-premium-delivery-info-title']}>
                Shipment to
              </Text>
              <Text style={styles['order-success-premium-delivery-info-address']} numberOfLines={1}>
                {city}, {state}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles['order-success-premium-action-buttons']}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles['order-success-premium-btn-track-order']}
              onPress={() => navigation.reset({
                index: 0,
                routes: [
                  { name: 'Main' },
                  {
                    name: 'Orders',
                    params: {
                      screen: 'OrderDetails',
                      params: { orderId: orderId }
                    }
                  }
                ]
              })}
            >
              <Icon name="receipt-outline" size={24} color="#4F46E5" />
              <Text style={styles['order-success-premium-btn-track-order-text']}>
                Manage Order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles['order-success-premium-btn-continue-shopping']}
              onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }]
              })}
            >
              <Text style={styles['order-success-premium-btn-continue-shopping-text']}>
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles['order-success-premium-help-section']}>
            <Icon name="shield-checkmark-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles['order-success-premium-help-text']}>
              Premium Secured Purchase
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default OrderSuccessScreen;