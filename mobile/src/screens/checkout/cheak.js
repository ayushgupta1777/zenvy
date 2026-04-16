// ============================================
// mobile/src/screens/checkout/CheckoutScreen.js
// COMPLETE WORKING VERSION - No external styles needed
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../../redux/slices/orderSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const CheckoutScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Mock addresses
  const addresses = [
    {
      id: '1',
      name: 'Home',
      phone: '9876543210',
      addressLine1: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true
    },
    {
      id: '2',
      name: 'Office',
      phone: '9876543210',
      addressLine1: '456 Business Park, Floor 3',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      isDefault: false
    }
  ];

  useEffect(() => {
    console.log('ðŸ”„ CheckoutScreen mounted');
    dispatch(fetchCart());
    
    const defaultAddr = addresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      setSelectedAddress(defaultAddr);
      console.log('âœ… Default address set:', defaultAddr.name);
    }
  }, []);

  // Calculate pricing
  const shippingCost = totalPrice > 500 ? 0 : 50;
  const tax = Math.round(totalPrice * 0.03);
  const finalTotal = totalPrice + shippingCost + tax;

  const paymentMethods = [
    { id: 'cod', label: 'Cash on Delivery', icon: 'cash-outline', description: 'Pay when you receive' },
    { id: 'online', label: 'UPI / Cards / Net Banking', icon: 'card-outline', description: 'Pay now securely' },
  ];

  const validateCheckout = () => {
    console.log('ðŸ” Validating checkout...');
    console.log('   Items count:', items.length);
    console.log('   Selected address:', selectedAddress ? selectedAddress.name : 'null');
    
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return false;
    }

    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return false;
    }

    console.log('âœ… Validation passed!');
    return true;
  };


const handleProceedToConfirm = () => {
  console.log('ðŸ”µ Continue button clicked!');
  console.log('ðŸ“Š Current state:', {
    itemsCount: items.length,
    selectedAddress: selectedAddress,
    showConfirmModal: showConfirmModal
  });
  
  if (validateCheckout()) {
    console.log('âœ… Opening confirmation modal...');
    setShowConfirmModal(true);
    
    // Check if state actually updated
    setTimeout(() => {
      console.log('â±ï¸ Modal state after 100ms:', showConfirmModal);
    }, 100);
  } else {
    console.log('âŒ Validation failed');
  }
};

// Also add this useEffect to track modal state changes:
useEffect(() => {
  console.log('ðŸŽ­ Modal visibility changed:', showConfirmModal);
}, [showConfirmModal]);
  

  const handleConfirmOrder = async () => {
    console.log('ðŸ”µ Confirming order...');
    setShowConfirmModal(false);
    setIsProcessing(true);

    const orderData = {
      shippingAddress: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2 || '',
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        country: 'India'
      },
      paymentMethod: paymentMethod
    };

    console.log('ðŸ“¦ Order data:', orderData);

    try {
      const result = await dispatch(createOrder(orderData));
      console.log('ðŸ“¥ Order Result:', result);
      
      setIsProcessing(false);

      // result.payload IS the orders array directly from orderSlice
      if (result.payload && Array.isArray(result.payload)) {
        const orders = result.payload;
        console.log('âœ… Orders created:', orders.length);
        
        if (paymentMethod === 'online') {
          Alert.alert(
            'Payment Required',
            'You will be redirected to payment gateway',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Pay Now', onPress: () => handlePayment(orders[0]) }
            ]
          );
        } else {
          showOrderSuccess(orders[0]);
        }
      } else {
        console.error('âŒ Invalid order response:', result);
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('âŒ Order creation failed:', error);
      setIsProcessing(false);
      Alert.alert(
        'Order Failed',
        error.message || 'Failed to place order. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePayment = (order) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      showOrderSuccess(order);
    }, 2000);
  };

  const showOrderSuccess = (order) => {
    console.log('ðŸŽ‰ Order success!', order.orderNo);
    Alert.alert(
      'ðŸŽ‰ Order Placed Successfully!',
      `Order #${order.orderNo}\n\nYour order has been confirmed and will be delivered soon.`,
      [
        { text: 'Continue Shopping', onPress: () => navigation.navigate('Home') },
        { text: 'View Order', onPress: () => navigation.navigate('Orders', {
            screen: 'OrderDetails',
            params: { orderId: order._id }
          })
        }
      ]
    );
    dispatch(fetchCart());
  };

  console.log('ðŸŽ¨ Rendering CheckoutScreen with', items.length, 'items');

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryItems}>{items.length} items</Text>
            {items.slice(0, 2).map((item) => (
              <View key={item._id} style={styles.summaryItemRow}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {item.product?.title || 'Product'}
                </Text>
                <Text style={styles.summaryItemQty}>x{item.quantity}</Text>
              </View>
            ))}
            {items.length > 2 && (
              <Text style={styles.summaryMore}>+{items.length - 2} more items</Text>
            )}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity>
              <Text style={styles.addNewText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressCard,
                selectedAddress?.id === address.id && styles.addressCardSelected
              ]}
              onPress={() => {
                console.log('ðŸ“ Address selected:', address.name);
                setSelectedAddress(address);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.addressRadio}>
                <Icon
                  name={selectedAddress?.id === address.id ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selectedAddress?.id === address.id ? '#4F46E5' : '#9CA3AF'}
                />
              </View>
              <View style={styles.addressDetails}>
                <View style={styles.addressNameRow}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressText}>{address.addressLine1}</Text>
                <Text style={styles.addressText}>
                  {address.city}, {address.state} - {address.pincode}
                </Text>
                <Text style={styles.addressPhone}>Phone: {address.phone}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                paymentMethod === method.id && styles.paymentCardSelected
              ]}
              onPress={() => {
                console.log('ðŸ’³ Payment method selected:', method.id);
                setPaymentMethod(method.id);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.paymentRadio}>
                <Icon
                  name={paymentMethod === method.id ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={paymentMethod === method.id ? '#4F46E5' : '#9CA3AF'}
                />
              </View>
              <Icon name={method.icon} size={24} color="#4F46E5" style={{ marginRight: 12 }} />
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentLabel}>{method.label}</Text>
                <Text style={styles.paymentDescription}>{method.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal ({items.length} items)</Text>
              <Text style={styles.priceValue}>â‚¹{totalPrice}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Shipping</Text>
              {shippingCost === 0 ? (
                <Text style={styles.priceFree}>FREE</Text>
              ) : (
                <Text style={styles.priceValue}>â‚¹{shippingCost}</Text>
              )}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (GST 3%)</Text>
              <Text style={styles.priceValue}>â‚¹{tax}</Text>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceTotalLabel}>Total Amount</Text>
              <Text style={styles.priceTotalValue}>â‚¹{finalTotal}</Text>
            </View>
          </View>

          {shippingCost > 0 && totalPrice < 500 && (
            <View style={styles.shippingNote}>
              <Icon name="information-circle-outline" size={16} color="#4F46E5" />
              <Text style={styles.shippingNoteText}>
                Add â‚¹{500 - totalPrice} more to get FREE shipping
              </Text>
            </View>
          )}
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <View style={styles.termsBox}>
            <Icon name="shield-checkmark-outline" size={20} color="#10B981" />
            <Text style={styles.termsText}>
              By placing this order, you agree to our Terms & Conditions
            </Text>
          </View>
        </View>

        {/* Extra padding for bottom button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar - FIXED POSITION */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerAmount}>â‚¹{finalTotal}</Text>
        </View>

 <TouchableOpacity
  style={[styles.continueBtn, isProcessing && styles.continueBtnDisabled]}
  onPress={() => {
    console.log('ðŸ”¥ DIRECT MODAL OPEN TEST');
    setShowConfirmModal(true); // Direct call, no validation
  }}
  disabled={isProcessing}
  activeOpacity={0.8}
>
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.continueBtnText}>Continue</Text>
              <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Order</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Items */}
              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Items ({items.length})</Text>
                {items.map((item) => (
                  <View key={item._id} style={styles.confirmItem}>
                    <Text style={styles.confirmItemName} numberOfLines={1}>
                      {item.product?.title}
                    </Text>
                    <Text style={styles.confirmItemPrice}>
                      â‚¹{item.price} x {item.quantity}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Address */}
              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Delivering to</Text>
                <Text style={styles.confirmValue}>{selectedAddress?.name}</Text>
                <Text style={styles.confirmValueSmall}>
                  {selectedAddress?.addressLine1}, {selectedAddress?.city}
                </Text>
                <Text style={styles.confirmValueSmall}>
                  {selectedAddress?.state} - {selectedAddress?.pincode}
                </Text>
              </View>

              {/* Payment */}
              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Payment Method</Text>
                <Text style={styles.confirmValue}>
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </Text>
              </View>

              {/* Total */}
              <View style={styles.confirmSection}>
                <View style={styles.confirmTotalRow}>
                  <Text style={styles.confirmTotalLabel}>Total Amount</Text>
                  <Text style={styles.confirmTotalValue}>â‚¹{finalTotal}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={handleConfirmOrder}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.modalBtnConfirmText}>
                      {paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
                    </Text>
                    <Icon name="checkmark-circle" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.processingText}>
              {paymentMethod === 'cod' ? 'Placing your order...' : 'Processing payment...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addNewText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Order Summary
  summaryBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  summaryItems: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  summaryItemQty: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  summaryMore: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Address Cards
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addressCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  addressRadio: {
    marginRight: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // Payment Methods
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  paymentRadio: {
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  paymentDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  // Price Breakdown
  priceBreakdown: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  priceFree: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  priceTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
  },
  shippingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  shippingNoteText: {
    fontSize: 13,
    color: '#4F46E5',
    marginLeft: 8,
  },

  // Terms
  termsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
  },
  termsText: {
    fontSize: 13,
    color: '#059669',
    marginLeft: 8,
    flex: 1,
  },

  // Footer - FIXED
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerPrice: {
    flex: 1,
    justifyContent: 'center',
  },
  footerLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  continueBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  continueBtnDisabled: {
    opacity: 0.6,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  confirmationModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  confirmSection: {
    marginBottom: 20,
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  confirmValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  confirmValueSmall: {
    fontSize: 14,
    color: '#4B5563',
  },
  confirmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  confirmItemName: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  confirmItemPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  confirmTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 8,
  },
  confirmTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  confirmTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalBtnConfirm: {
    flex: 2,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Processing
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#111827',
  },
});

export default CheckoutScreen;