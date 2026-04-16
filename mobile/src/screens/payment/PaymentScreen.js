// ============================================
// mobile/src/screens/payment/PaymentScreen.js
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';
import { styles } from '../../styling/screens/payment/PaymentScreenPremiumStyles';

const PaymentScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('processing'); // processing, success, failed
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Simulate payment processing
    // In real app, integrate Razorpay SDK here
    processPayment();
  }, []);

  const processPayment = async () => {
    try {
      // Simulate payment gateway delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock payment success (90% success rate for testing)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        // Update order payment status
        await api.put(`/orders/${order._id}/payment`, {
          paymentStatus: 'completed',
          paymentId: `PAY${Date.now()}`,
          razorpayPaymentId: `razorpay_${Math.random().toString(36).substr(2, 9)}`
        });

        setPaymentStatus('success');
        showSuccessAnimation();
      } else {
        setPaymentStatus('failed');
        showFailAnimation();
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      showFailAnimation();
    }
  };

  const showSuccessAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true
      })
    ]).start();
  };

  const showFailAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  };

  const handleContinue = () => {
    if (paymentStatus === 'success') {
      navigation.reset({
        index: 0,
        routes: [
          { name: 'Main' },
          {
            name: 'Orders',
            params: {
              screen: 'OrderDetails',
              params: { orderId: order._id }
            }
          }
        ]
      });
    } else {
      navigation.goBack();
    }
  };

  const handleRetry = () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    fadeAnim.setValue(0);
    scaleAnim.setValue(0);
    processPayment();
  };

  if (isProcessing) {
    return (
      <View style={styles['payment-premium-processing-screen']}>
        <View style={styles['payment-premium-processing-animation']}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
        <Text style={styles['payment-premium-processing-title']}>
          Processing Payment
        </Text>
        <Text style={styles['payment-premium-processing-subtitle']}>
          Please wait while we process your payment...
        </Text>
        <Text style={styles['payment-premium-processing-amount']}>₹{order.total}</Text>
        
        <View style={styles['payment-premium-secure-badge']}>
          <Icon name="shield-checkmark" size={18} color="#10B981" />
          <Text style={styles['payment-premium-secure-text']}>Secure Payment</Text>
        </View>
      </View>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <View style={styles['payment-premium-result-screen']}>
        <Animated.View
          style={[
            styles['payment-premium-success-animation'],
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles['payment-premium-success-circle']}>
            <View style={styles['payment-premium-success-circle-inner']}>
              <Icon name="checkmark" size={50} color="#fff" />
            </View>
          </View>
        </Animated.View>

        <Text style={styles['payment-premium-result-title']}>Payment Successful!</Text>
        <Text style={styles['payment-premium-result-subtitle']}>
          Your order has been confirmed
        </Text>

        <View style={styles['payment-premium-order-info-box']}>
          <View style={styles['payment-premium-info-row']}>
            <Text style={styles['payment-premium-info-label']}>Order Number</Text>
            <Text style={styles['payment-premium-info-value']}>#{order.orderNo}</Text>
          </View>
          <View style={styles['payment-premium-divider']} />
          <View style={styles['payment-premium-info-row']}>
            <Text style={styles['payment-premium-info-label']}>Amount Paid</Text>
            <Text style={styles['payment-premium-info-value-highlight']}>₹{order.total}</Text>
          </View>
          <View style={styles['payment-premium-divider']} />
          <View style={styles['payment-premium-info-row']}>
            <Text style={styles['payment-premium-info-label']}>Payment Method</Text>
            <Text style={styles['payment-premium-info-value']}>Online Payment</Text>
          </View>
        </View>

        <View style={styles['payment-premium-delivery-estimate']}>
          <Icon name="time-outline" size={20} color="#0A84FF" />
          <Text style={styles['payment-premium-delivery-text']}>
            Expected delivery in 5-7 business days
          </Text>
        </View>

        <View style={styles['payment-premium-action-buttons']}>
          <TouchableOpacity 
            style={styles['payment-premium-btn-view-order']} 
            onPress={handleContinue}
          >
            <Text style={styles['payment-premium-btn-view-order-text']}>
              View Order Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles['payment-premium-btn-continue-shopping']}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles['payment-premium-btn-continue-shopping-text']}>
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Payment Failed
  return (
    <View style={styles['payment-premium-result-screen']}>
      <Animated.View 
        style={[
          styles['payment-premium-fail-animation'],
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles['payment-premium-fail-circle']}>
          <View style={styles['payment-premium-fail-circle-inner']}>
            <Icon name="close" size={50} color="#fff" />
          </View>
        </View>
      </Animated.View>

      <Text style={styles['payment-premium-result-title-fail']}>Payment Failed</Text>
      <Text style={styles['payment-premium-result-subtitle']}>
        We couldn't process your payment
      </Text>

      <View style={styles['payment-premium-error-info-box']}>
        <Icon name="information-circle-outline" size={24} color="#EF4444" />
        <Text style={styles['payment-premium-error-message']}>
          Your payment was declined. Please check your payment details and try again.
        </Text>
      </View>

      <View style={styles['payment-premium-order-info-box']}>
        <View style={styles['payment-premium-info-row']}>
          <Text style={styles['payment-premium-info-label']}>Order Number</Text>
          <Text style={styles['payment-premium-info-value']}>#{order.orderNo}</Text>
        </View>
        <View style={styles['payment-premium-divider']} />
        <View style={styles['payment-premium-info-row']}>
          <Text style={styles['payment-premium-info-label']}>Amount</Text>
          <Text style={styles['payment-premium-info-value']}>₹{order.total}</Text>
        </View>
      </View>

      <View style={styles['payment-premium-action-buttons']}>
        <TouchableOpacity 
          style={styles['payment-premium-btn-retry']} 
          onPress={handleRetry}
        >
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles['payment-premium-btn-retry-text']}>Retry Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles['payment-premium-btn-cancel']} 
          onPress={handleContinue}
        >
          <Text style={styles['payment-premium-btn-cancel-text']}>Cancel Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentScreen;