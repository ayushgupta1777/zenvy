import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
  RefreshControl,
  StatusBar,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  Layout, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  interpolateColor
} from 'react-native-reanimated';
import api from '../../services/api';
import CustomHeader from '../../components/CustomHeader';

const { width } = Dimensions.get('window');

// Skeleton Component
const Skeleton = ({ style }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[style, animatedStyle, { backgroundColor: '#E2E8F0' }]} />;
};

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get(`/orders/${orderId}/tracking`);
      setOrder(response.data.data.order);
      setTracking(response.data.data.shiprocketTracking);
    } catch (error) {
      console.error('Failed to fetch tracking:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(() => fetchTracking(false), 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchTracking]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTracking(false);
  };

  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle' },
    { key: 'packed', label: 'Packed', icon: 'cube' },
    { key: 'shipped', label: 'Shipped', icon: 'airplane' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'bicycle' },
    { key: 'delivered', label: 'Delivered', icon: 'home' },
  ];

  const getStepStatus = (stepKey) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
    const currentStatus = order?.status || 'pending';
    
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentStatus === 'cancelled') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getReassuringMessage = () => {
    const status = order?.status;
    switch (status) {
      case 'pending':
      case 'confirmed':
        return "Your order is confirmed and will be processed soon.";
      case 'processing':
      case 'packed':
        return "Great news! Your order is being packed and prepared for shipping.";
      case 'shipped':
        return "Your package is on its way! It has been handed over to our courier.";
      case 'out_for_delivery':
        return "Get ready! Your order is out for delivery and will reach you soon.";
      case 'delivered':
        return "Enjoy your purchase! Your order has been successfully delivered.";
      case 'cancelled':
        return "This order has been cancelled.";
      default:
        return "We're tracking your order carefully.";
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Track Order" showBack={true} />
        <View style={{ padding: 20 }}>
          <Skeleton style={{ height: 120, borderRadius: 20, marginBottom: 20 }} />
          <Skeleton style={{ height: 300, borderRadius: 20, marginBottom: 20 }} />
          <Skeleton style={{ height: 150, borderRadius: 20 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <CustomHeader title="Track Order" showBack={true} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
        }
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
          
          {/* Status Overview Card */}
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.orderLabel}>ORDER ID</Text>
                <Text style={styles.orderIdText}>#{order.orderNo}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.dividerLight} />
            <Text style={styles.reassuringMessage}>{getReassuringMessage()}</Text>
          </LinearGradient>

          {/* Progress Tracker */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Progress</Text>
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => {
                const status = getStepStatus(step.key);
                const isLast = index === steps.length - 1;

                return (
                  <View key={step.key} style={styles.stepWrapper}>
                    <View style={styles.stepLeft}>
                      <View style={[
                        styles.stepIconContainer,
                        status === 'completed' && styles.stepIconCompleted,
                        status === 'current' && styles.stepIconCurrent,
                      ]}>
                        <Icon 
                          name={status === 'completed' ? 'checkmark' : step.icon} 
                          size={20} 
                          color={status === 'upcoming' ? '#94A3B8' : '#FFF'} 
                        />
                      </View>
                      {!isLast && (
                        <View style={[
                          styles.stepLine,
                          status === 'completed' && styles.stepLineCompleted
                        ]} />
                      )}
                    </View>
                    <View style={styles.stepRight}>
                      <Text style={[
                        styles.stepLabel,
                        status === 'current' && styles.stepLabelCurrent,
                        status === 'upcoming' && styles.stepLabelUpcoming
                      ]}>
                        {step.label}
                      </Text>
                      {status === 'current' && (
                        <Text style={styles.stepSublabel}>Working on it...</Text>
                      )}
                      {order[`${step.key}At`] && (
                        <Text style={styles.stepTime}>
                          {new Date(order[`${step.key}At`]).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Shipment Details */}
          {(order.trackingNumber || order.courierName) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Courier Details</Text>
              <View style={styles.row}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>COURIER PARTNER</Text>
                  <Text style={styles.infoValue}>{order.courierName || 'Pending'}</Text>
                </View>
                <View style={[styles.infoBox, { alignItems: 'flex-end' }]}>
                  <Text style={styles.infoLabel}>TRACKING ID</Text>
                  <View style={styles.trackingIdRow}>
                    <Text style={styles.infoValue}>{order.trackingNumber || 'N/A'}</Text>
                    {order.trackingNumber && (
                      <TouchableOpacity onPress={() => Linking.openURL(`https://shiprocket.co/tracking/${order.trackingNumber}`)}>
                        <Icon name="copy-outline" size={16} color="#4F46E5" style={{ marginLeft: 6 }} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Shipping Address */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
               <Icon name="location-sharp" size={20} color="#4F46E5" />
               <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}>Shipping Address</Text>
            </View>
            <Text style={styles.addressText}>
                {order.shippingAddress?.name}{"\n"}
                {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}{"\n"}
                {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </Text>
          </View>

          {/* Call to Actions */}
          <View style={styles.footerActions}>
            <TouchableOpacity 
                style={styles.supportBtn}
                onPress={() => navigation.navigate('OrderDetails', { orderId })}
            >
                <Icon name="document-text-outline" size={20} color="#4F46E5" />
                <Text style={styles.supportBtnText}>View Full Invoice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.supportBtn}
                onPress={() => Linking.openURL('tel:+917240992230')}
            >
                <Icon name="headset-outline" size={20} color="#4F46E5" />
                <Text style={styles.supportBtnText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  headerCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  orderIdText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 16,
  },
  reassuringMessage: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  stepsContainer: {
    paddingLeft: 8,
  },
  stepWrapper: {
    flexDirection: 'row',
    minHeight: 60,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepIconCompleted: {
    backgroundColor: '#22C55E',
  },
  stepIconCurrent: {
    backgroundColor: '#4F46E5',
    transform: [{ scale: 1.1 }],
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#22C55E',
  },
  stepRight: {
    paddingBottom: 24,
    flex: 1,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepLabelCurrent: {
    color: '#4F46E5',
  },
  stepLabelUpcoming: {
    color: '#94A3B8',
  },
  stepSublabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontStyle: 'italic',
  },
  stepTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  trackingIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    fontWeight: '500',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  supportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  supportBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  }
});

export default OrderTrackingScreen;