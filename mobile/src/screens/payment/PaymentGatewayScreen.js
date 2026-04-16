import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, BackHandler, ScrollView
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const PaymentGatewayScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);
  
  // Payment state tracking
  const paymentAttempted = useRef(false);
  const paymentResultReceived = useRef(false);
  const razorpayModalOpen = useRef(false);

  const addDebugLog = (message, data = null) => {
    const log = `[${new Date().toLocaleTimeString()}] ${message}`;
    console.log(log, data || '');
    setDebugInfo(prev => [...prev, { 
      message, 
      data, 
      time: new Date().toLocaleTimeString() 
    }]);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isProcessing || razorpayModalOpen.current) {
        Alert.alert(
          'Payment in Progress',
          'Please complete or cancel the payment first.',
          [{ text: 'OK' }]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isProcessing]);

  const initiatePayment = async () => {
    // Prevent double payment attempts
    if (paymentAttempted.current) {
      addDebugLog('⚠️ Payment already attempted');
      return;
    }

    paymentAttempted.current = true;
    paymentResultReceived.current = false;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      addDebugLog('📝 Creating Razorpay order');

      const response = await api.post('/payments/create-order', {
        orderId: order._id
      });

      const { razorpayOrderId, amount, keyId } = response.data.data;

      addDebugLog('✅ Razorpay order created', { razorpayOrderId, amount });

      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        order_id: razorpayOrderId,
        name: 'New Raj Fancy',
        description: `Order #${order.orderNo}`,

        prefill: {
          email: order.user?.email || '',
          contact: order.shippingAddress?.phone || '',
          name: order.shippingAddress?.name || ''
        },

        theme: {
          color: '#4F46E5'
        },

        modal: {
          ondismiss: () => {
            addDebugLog('🚪 Modal dismissed');
            razorpayModalOpen.current = false;
            
            // CRITICAL FIX: Only handle dismiss if no result received yet
            // Wait 500ms to see if success/error callback fires
            setTimeout(() => {
              if (!paymentResultReceived.current) {
                addDebugLog('⚠️ Modal closed without payment result');
                handlePaymentCancellation();
              }
            }, 500);
          },
          escape: true,
          backdropclose: false
        },

        notes: {
          order_id: order._id,
          order_no: order.orderNo
        }
      };

      addDebugLog('🚀 Opening Razorpay checkout', {
        keyId,
        amount,
        orderId: razorpayOrderId
      });

      razorpayModalOpen.current = true;

      RazorpayCheckout.open(options)
        .then((data) => {
          paymentResultReceived.current = true;
          razorpayModalOpen.current = false;
          addDebugLog('✅ Payment SUCCESS callback received', data);
          handlePaymentSuccess(data);
        })
        .catch((error) => {
          paymentResultReceived.current = true;
          razorpayModalOpen.current = false;
          addDebugLog('❌ Payment ERROR callback received', {
            code: error.code,
            description: error.description,
            source: error.source,
            step: error.step,
            reason: error.reason,
            metadata: error.metadata
          });
          handlePaymentError(error);
        });

    } catch (error) {
      addDebugLog('❌ Payment initialization error', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      paymentAttempted.current = false;
      setIsProcessing(false);
      
      const errorMessage = error.response?.data?.message || 'Failed to initialize payment';
      setPaymentError(errorMessage);
      
      Alert.alert(
        'Payment Initialization Failed',
        `${errorMessage}\n\n⚠️ IMPORTANT: This could be due to:\n• Network issues\n• Invalid Razorpay credentials\n• Server configuration issues`,
        [
          {
            text: 'Show Debug',
            onPress: () => showDebugInfo()
          },
          {
            text: 'Retry',
            onPress: () => {
              paymentAttempted.current = false;
              setDebugInfo([]);
              initiatePayment();
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const handlePaymentSuccess = async (data) => {
    try {
      setIsProcessing(true);
      addDebugLog('🔐 Verifying payment signature on backend', data);

      // CRITICAL: Verify payment on backend BEFORE showing success
      const response = await api.post('/payments/verify', {
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
        orderId: order._id
      });

      addDebugLog('✅ Payment verified successfully on backend');
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsProcessing(false);

      // Navigate to success screen
      navigation.replace('OrderSuccess', {
        order: response.data.data.order
      });

    } catch (error) {
      addDebugLog('❌ Backend verification FAILED', {
        message: error.message,
        response: error.response?.data
      });

      setIsProcessing(false);

      // CRITICAL: Even though Razorpay says success, 
      // if backend verification fails, treat as failed payment
      Alert.alert(
        '⚠️ Payment Verification Failed',
        `Payment ID: ${data.razorpay_payment_id}\n\n` +
        `Your payment was processed by Razorpay but our server could not verify it.\n\n` +
        `This could mean:\n` +
        `• Payment signature mismatch\n` +
        `• Server connectivity issues\n\n` +
        `IMPORTANT: Please contact support immediately with the above Payment ID. ` +
        `Do not attempt payment again until this is resolved.`,
        [
          {
            text: 'Copy Payment ID',
            onPress: async () => {
              // In production, use Clipboard API
              Alert.alert('Payment ID', data.razorpay_payment_id);
            }
          },
          {
            text: 'Contact Support',
            onPress: () => {
              // Navigate to support or show contact info
              Alert.alert(
                'Please contact: newrajfancystore@gmail.com\nOr call: +91 724 099 2230'
              );
            }
          },
          {
            text: 'Go to Orders',
            onPress: () => navigation.navigate('Orders')
          }
        ],
        { cancelable: false }
      );

      // Record the verification failure
      try {
        await api.post('/payments/verification-failed', {
          orderId: order._id,
          razorpayData: data,
          error: error.response?.data || error.message
        });
      } catch (recordError) {
        addDebugLog('Failed to record verification failure', recordError);
      }
    }
  };

  const handlePaymentError = async (error) => {
    paymentAttempted.current = false;
    setIsProcessing(false);

    let errorTitle = 'Payment Failed';
    let errorMessage = error?.description || error?.reason || 'Payment could not be completed';
    let showTechnicalDetails = false;

    // Map Razorpay error codes to user-friendly messages
    if (error.code === 0) {
      // User cancelled
      errorTitle = 'Payment Cancelled';
      errorMessage = 'You cancelled the payment process.';
    } else if (error.code === 1) {
      // Network error
      errorTitle = 'Network Error';
      errorMessage = 'Unable to connect to payment gateway. Please check your internet connection.';
    } else if (error.code === 2) {
      // Payment failed
      errorTitle = 'Payment Failed';
      errorMessage = error.description || 'Your payment could not be processed.';
      
      // Check for specific failure reasons
      if (error.description?.toLowerCase().includes('insufficient')) {
        errorMessage = 'Insufficient balance in your account.';
      } else if (error.description?.toLowerCase().includes('invalid')) {
        errorMessage = 'Invalid payment details. Please check and try again.';
      } else if (error.description?.toLowerCase().includes('declined')) {
        errorMessage = 'Payment was declined by your bank. Please try a different payment method.';
      }
    } else {
      // Unknown error
      showTechnicalDetails = true;
      errorMessage = `${error.description || 'An unexpected error occurred'}\n\nError Code: ${error.code || 'Unknown'}`;
    }

    // Log the failure on backend
    try {
      await api.post('/payments/failure', {
        orderId: order._id,
        error: JSON.stringify({
          code: error.code,
          description: error.description,
          reason: error.reason,
          source: error.source,
          step: error.step
        })
      });
      addDebugLog('📝 Payment failure logged on backend');
    } catch (logError) {
      addDebugLog('⚠️ Failed to log payment failure', logError);
    }

    // Show appropriate alert based on error type
    const alertButtons = [];

    if (error.code === 0) {
      // Cancellation - offer retry or go back
      alertButtons.push(
        {
          text: 'Try Again',
          onPress: () => {
            setDebugInfo([]);
            initiatePayment();
          }
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: () => navigation.goBack()
        }
      );
    } else {
      // Failure - offer more options
      if (showTechnicalDetails) {
        alertButtons.push({
          text: 'Debug Info',
          onPress: () => showDebugInfo()
        });
      }
      
      alertButtons.push(
        {
          text: 'Retry Payment',
          onPress: () => {
            setDebugInfo([]);
            initiatePayment();
          }
        },
        {
          text: 'Use Different Method',
          onPress: () => navigation.goBack()
        }
      );
    }

    Alert.alert(errorTitle, errorMessage, alertButtons);
  };

  const handlePaymentCancellation = () => {
    paymentAttempted.current = false;
    setIsProcessing(false);

    Alert.alert(
      'Payment Not Completed',
      'The payment window was closed before completing the payment. Would you like to try again?',
      [
        {
          text: 'Yes, Try Again',
          onPress: () => {
            setDebugInfo([]);
            initiatePayment();
          }
        },
        {
          text: 'No, Go Back',
          style: 'cancel',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const showDebugInfo = () => {
    const debugText = debugInfo.map(log => 
      `[${log.time}] ${log.message}\n${log.data ? JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');

    Alert.alert(
      'Debug Information',
      debugText.substring(0, 500) + '...\n\n(Check console for full logs)',
      [
        {
          text: 'Copy to Clipboard',
          onPress: () => {
            // In production, copy to clipboard
            console.log('Full Debug Log:', debugText);
          }
        },
        { text: 'OK' }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        {isProcessing && !paymentError && (
          <>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.title}>
              {paymentResultReceived.current ? 'Verifying Payment...' : 'Ready to Pay'}
            </Text>
            <Text style={styles.subtitle}>
              {paymentResultReceived.current 
                ? 'Please wait while we securely verify your payment'
                : 'Click the button below to proceed with secure payment'}
            </Text>
          </>
        )}

        {paymentError && (
          <>
            <Icon name="alert-circle" size={64} color="#EF4444" />
            <Text style={styles.errorTitle}>Payment Setup Error</Text>
            <Text style={styles.errorText}>{paymentError}</Text>
          </>
        )}

        {!isProcessing && !paymentError && (
          <>
            <Icon name="card-outline" size={64} color="#4F46E5" />
            <Text style={styles.title}>Complete Your Payment</Text>
            <Text style={styles.subtitle}>
              Secure payment powered by Razorpay
            </Text>
          </>
        )}

        <View style={styles.orderInfo}>
          <Text style={styles.label}>Order Number</Text>
          <Text style={styles.value}>{order.orderNo}</Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.label}>Amount to Pay</Text>
          <Text style={styles.amount}>₹{order.total}</Text>
        </View>

        <View style={styles.secureNote}>
          <Icon name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.secureText}>
            256-bit SSL encryption • PCI DSS compliant
          </Text>
        </View>

        {/* IMPORTANT TEST MODE WARNING */}
        <View style={styles.testModeWarning}>
          <Icon name="warning" size={20} color="#DC2626" />
          <View style={styles.testModeTextContainer}>
            <Text style={styles.testModeTitle}>⚠️ TEST MODE ACTIVE</Text>
            <Text style={styles.testModeText}>
              • Use ONLY test card numbers{'\n'}
              • UPI/Google Pay/PhonePe will NOT work{'\n'}
              • Test cards: 4111 1111 1111 1111{'\n'}
              • CVV: Any 3 digits, Expiry: Any future date
            </Text>
          </View>
        </View>

        {__DEV__ && debugInfo.length > 0 && (
          <TouchableOpacity
            style={styles.debugBtn}
            onPress={showDebugInfo}
          >
            <Text style={styles.debugText}>
              Debug Logs ({debugInfo.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PAY NOW BUTTON */}
      <TouchableOpacity
        style={[
          styles.payBtn,
          (isProcessing || paymentAttempted.current) && styles.payBtnDisabled
        ]}
        onPress={initiatePayment}
        disabled={isProcessing || paymentAttempted.current}
        activeOpacity={0.8}
      >
        {isProcessing && paymentResultReceived.current ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.payBtnText}>Verifying...</Text>
          </>
        ) : (
          <>
            <Icon name="lock-closed" size={20} color="#fff" />
            <Text style={styles.payBtnText}>
              PAY ₹{order.total} SECURELY
            </Text>
          </>
        )}
      </TouchableOpacity>

      {!paymentResultReceived.current && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            if (razorpayModalOpen.current) {
              Alert.alert(
                'Payment in Progress',
                'Please complete or close the Razorpay payment window first.'
              );
              return;
            }

            Alert.alert(
              'Cancel Payment?',
              'Are you sure you want to go back? Your order will remain in pending status.',
              [
                { text: 'No, Continue', style: 'cancel' },
                {
                  text: 'Yes, Go Back',
                  onPress: () => navigation.goBack(),
                  style: 'destructive'
                }
              ]
            );
          }}
          disabled={isProcessing && paymentResultReceived.current}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 20,
    marginBottom: 8
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5'
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%'
  },
  secureText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 8,
    fontWeight: '500'
  },
  testModeWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    width: '100%'
  },
  testModeTextContainer: {
    flex: 1,
    marginLeft: 8
  },
  testModeTitle: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '700',
    marginBottom: 4
  },
  testModeText: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '500',
    lineHeight: 16
  },
  debugBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8
  },
  debugText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500'
  },
  payBtn: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  payBtnDisabled: {
    opacity: 0.6
  },
  payBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280'
  }
});

export default PaymentGatewayScreen;