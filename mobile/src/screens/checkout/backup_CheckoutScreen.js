import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
  TextInput,
  Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../../redux/slices/orderSlice';
import { fetchCart } from '../../redux/slices/cartSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { getImageUrl } from '../../services/api';

const CheckoutScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isCodEnabled, setIsCodEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    fetchAddresses();
    fetchCodStatus();
  }, []);

  const fetchCodStatus = async () => {
    try {
      const response = await api.get('/settings/isCodEnabled');
      if (response.data.success) {
        const enabled = response.data.data.value ?? true;
        setIsCodEnabled(enabled);
        if (!enabled && paymentMethod === 'cod') {
          setPaymentMethod('upi');
        }
      }
    } catch (error) {
      console.error('Failed to fetch COD status:', error);
    }
  };

  // Prevent back button during processing
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isProcessing) {
        Alert.alert('Please Wait', 'Order is being processed...');
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isProcessing]);

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const response = await api.get('/addresses');
      const fetchedAddresses = response.data.data.addresses || [];

      setAddresses(fetchedAddresses);

      const defaultAddr = fetchedAddresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      } else if (fetchedAddresses.length > 0) {
        setSelectedAddress(fetchedAddresses[0]);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      Alert.alert('Error', 'Failed to load addresses. Please try again.');
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Check empty cart
  useEffect(() => {
    if (!items || items.length === 0) {
      Alert.alert(
        'Cart is Empty',
        'Your cart is empty. Please add items before checkout.',
        [
          {
            text: 'Go to Shop',
            onPress: () => navigation.replace('CartMain')
          }
        ]
      );
    }
  }, [items]);

  const shippingCost = totalPrice > 500 ? 0 : 50;
  const tax = Math.round(totalPrice * 0.18);
  const discount = appliedCoupon ? appliedCoupon.appliedDiscount : 0;
  const finalTotal = totalPrice + shippingCost + tax - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    try {
      setIsValidatingCoupon(true);
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        orderAmount: totalPrice
      });

      if (response.data.success) {
        setAppliedCoupon(response.data.data);
        Alert.alert('Success', `Coupon "${response.data.data.code}" applied! You saved ₹${response.data.data.appliedDiscount}`);
      }
    } catch (error) {
      Alert.alert('Coupon Error', error.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const paymentMethods = [
    {
      id: 'cod',
      label: 'Cash on Delivery',
      icon: 'cash-outline',
      description: 'Pay when you receive',
      enabled: isCodEnabled
    },
    {
      id: 'upi',
      label: 'UPI / Cards / Net Banking',
      icon: 'card-outline',
      description: 'Pay now securely',
      enabled: true
    },
  ].filter(m => m.enabled);

  const validateCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return false;
    }

    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return false;
    }

    if (!selectedAddress.name || !selectedAddress.phone || !selectedAddress.city) {
      Alert.alert('Error', 'Selected address is incomplete. Please update it.');
      return false;
    }

    return true;
  };

  const handleProceedToConfirm = () => {
    if (validateCheckout()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmOrder = async () => {
    if (isProcessing) return; // Prevent double submission

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
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.code : null
    };

    try {
      console.log('Creating order with data:', orderData);

      const result = await dispatch(createOrder(orderData)).unwrap();

      console.log('Order created successfully:', result);

      // CRITICAL FIX: Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      if (paymentMethod === 'cod') {
        // Navigate to OrderSuccess (in Cart stack)
        navigation.replace('OrderSuccess', { order: result });
      } else {
        // Navigate to PaymentGateway (in Cart stack)
        navigation.replace('PaymentGateway', { order: result });
      }

    } catch (error) {
      console.error('Order creation failed:', error);
      setIsProcessing(false);
      Alert.alert(
        'Order Failed',
        error?.message || 'Failed to place order. Please try again.',
        [
          { text: 'OK' }
        ]
      );
    }
  };

  const handleAddNewAddress = () => {
    navigation.navigate('Profile', {
      screen: 'Addresses'
    });
  };

  const handleEditAddress = (address) => {
    navigation.navigate('Profile', {
      screen: 'Addresses'
    });
  };

  // Refresh addresses when screen gets focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAddresses();
    });
    return unsubscribe;
  }, [navigation]);

  if (isLoadingAddresses) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary ({items.length} items)</Text>
          {items.slice(0, 3).map((item) => (
            <View key={item._id} style={styles.itemRow}>
              <View style={styles.itemImageContainer}>
                <Image
                  source={{ uri: getImageUrl(item.product?.images?.[0]) || 'https://via.placeholder.com/150' }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product?.title}
                </Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.finalPrice * item.quantity}</Text>
            </View>
          ))}
          {items.length > 3 && (
            <Text style={styles.moreItems}>+{items.length - 3} more items</Text>
          )}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={handleAddNewAddress}>
              <Text style={styles.addNewText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.noAddressBox}>
              <Icon name="location-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noAddressText}>No addresses saved</Text>
              <TouchableOpacity
                style={styles.addFirstAddressBtn}
                onPress={handleAddNewAddress}
              >
                <Text style={styles.addFirstAddressText}>Add Your First Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map((address) => (
              <View key={address._id} style={styles.addressCardContainer}>
                <TouchableOpacity
                  style={[
                    styles.addressCard,
                    selectedAddress?._id === address._id && styles.addressCardSelected
                  ]}
                  onPress={() => setSelectedAddress(address)}
                  activeOpacity={0.7}
                >
                  <View style={styles.addressRadio}>
                    <Icon
                      name={selectedAddress?._id === address._id ? 'radio-button-on' : 'radio-button-off'}
                      size={24}
                      color={selectedAddress?._id === address._id ? '#4F46E5' : '#9CA3AF'}
                    />
                  </View>
                  <View style={styles.addressDetails}>
                    <View style={styles.addressNameRow}>
                      <Text style={styles.addressName}>{address.name}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Icon name="checkmark-circle" size={12} color="#fff" />
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressPhone}>{address.phone}</Text>
                    <Text style={styles.addressText}>{address.addressLine1}</Text>
                    {address.addressLine2 && (
                      <Text style={styles.addressText}>{address.addressLine2}</Text>
                    )}
                    <Text style={styles.addressText}>
                      {address.city}, {address.state} - {address.pincode}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
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
              onPress={() => setPaymentMethod(method.id)}
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

        {/* Coupon / Voucher Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apply Coupon</Text>
          <View style={styles.couponInputContainer}>
            <View style={styles.inputWrapper}>
              <Icon name="ticket-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.couponInput}
                placeholder="Enter Coupon Code"
                placeholderTextColor="#9CA3AF"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                editable={!appliedCoupon && !isValidatingCoupon}
              />
            </View>
            {appliedCoupon ? (
              <TouchableOpacity
                style={styles.removeCouponBtn}
                onPress={handleRemoveCoupon}
              >
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.applyBtn, !couponCode.trim() && styles.applyBtnDisabled]}
                onPress={handleApplyCoupon}
                disabled={!couponCode.trim() || isValidatingCoupon}
              >
                {isValidatingCoupon ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.applyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          {appliedCoupon && (
            <View style={styles.successBox}>
              <Icon name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.successText}>
                Coupon "{appliedCoupon.code}" applied successfully!
              </Text>
            </View>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{totalPrice}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <Text style={[styles.priceValue, shippingCost === 0 && styles.priceFree]}>
              {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (18% GST)</Text>
            <Text style={styles.priceValue}>₹{tax}</Text>
          </View>

          {appliedCoupon && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: '#10B981', fontWeight: '600' }]}>
                Discount ({appliedCoupon.code})
              </Text>
              <Text style={[styles.priceValue, { color: '#10B981' }]}>
                -₹{appliedCoupon.appliedDiscount}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total to Pay</Text>
            <Text style={styles.priceTotalValue}>₹{finalTotal}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerAmount}>₹{finalTotal}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            (isProcessing || addresses.length === 0) && styles.checkoutBtnDisabled
          ]}
          onPress={handleProceedToConfirm}
          disabled={isProcessing || addresses.length === 0}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.checkoutBtnText}>
                {addresses.length === 0 ? 'Add Address First' : 'Continue'}
              </Text>
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
              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Items ({items.length})</Text>
                {items.map((item) => (
                  <View key={item._id} style={styles.confirmItem}>
                    <View style={styles.confirmItemImageContainer}>
                      <Image
                        source={{ uri: getImageUrl(item.product?.images?.[0]) || 'https://via.placeholder.com/150' }}
                        style={styles.confirmItemImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.confirmItemInfo}>
                      <Text style={styles.confirmItemName} numberOfLines={1}>
                        {item.product?.title}
                      </Text>
                      <Text style={styles.confirmItemQty}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.confirmItemPrice}>
                      ₹{item.finalPrice * item.quantity}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Delivering to</Text>
                <Text style={styles.confirmValue}>{selectedAddress?.name}</Text>
                <Text style={styles.confirmValueSmall}>
                  {selectedAddress?.addressLine1}
                  {selectedAddress?.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}
                </Text>
                <Text style={styles.confirmValueSmall}>
                  {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
                </Text>
                <Text style={styles.confirmValueSmall}>
                  Phone: {selectedAddress?.phone}
                </Text>
              </View>

              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Payment Method</Text>
                <Text style={styles.confirmValue}>
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </Text>
              </View>

              <View style={styles.confirmSection}>
                {appliedCoupon && (
                  <View style={[styles.confirmTotalRow, { marginBottom: 8, backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.confirmTotalLabel, { fontSize: 14, color: '#065F46' }]}>Coupon Discount</Text>
                    <Text style={[styles.confirmTotalValue, { fontSize: 16, color: '#059669' }]}>-₹{appliedCoupon.appliedDiscount}</Text>
                  </View>
                )}
                <View style={styles.confirmTotalRow}>
                  <Text style={styles.confirmTotalLabel}>Total Amount</Text>
                  <Text style={styles.confirmTotalValue}>₹{finalTotal}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowConfirmModal(false)}
                disabled={isProcessing}
              >
                <Text style={styles.modalBtnCancelText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtnConfirm, isProcessing && styles.modalBtnConfirmDisabled]}
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
              {paymentMethod === 'cod' ? 'Placing your order...' : 'Processing...'}
            </Text>
            <Text style={styles.processingSubtext}>Please do not close the app</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280'
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  addNewText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  itemImage: {
    width: '100%',
    height: '100%'
  },
  itemInfo: {
    flex: 1
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500'
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827'
  },
  moreItems: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic'
  },
  noAddressBox: {
    alignItems: 'center',
    paddingVertical: 40
  },
  noAddressText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20
  },
  addFirstAddressBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  addFirstAddressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  addressCardContainer: {
    marginBottom: 12
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  addressCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF'
  },
  addressRadio: {
    marginRight: 12,
    paddingTop: 2
  },
  addressDetails: {
    flex: 1
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8
  },
  addressName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827'
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  defaultText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700'
  },
  addressPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6
  },
  addressText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 2,
    lineHeight: 18
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  paymentCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF'
  },
  paymentRadio: { marginRight: 12 },
  paymentDetails: { flex: 1 },
  paymentLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  paymentDescription: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  priceLabel: { fontSize: 14, color: '#6B7280' },
  priceValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  priceFree: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10
  },
  priceTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  priceTotalValue: { fontSize: 18, fontWeight: '700', color: '#4F46E5' },

  // Coupon Styles
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  inputIcon: { marginRight: 8 },
  couponInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600'
  },
  applyBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  applyBtnDisabled: {
    backgroundColor: '#9CA3AF'
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  },
  removeCouponBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeCouponText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700'
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 6
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600'
  },

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
    shadowRadius: 4
  },
  footerPrice: {
    flex: 1,
    justifyContent: 'center'
  },
  footerLabel: { fontSize: 13, color: '#6B7280' },
  footerAmount: { fontSize: 20, fontWeight: '700', color: '#111827' },
  checkoutBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150
  },
  checkoutBtnDisabled: {
    opacity: 0.5
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end'
  },
  confirmationModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827'
  },
  modalContent: {
    padding: 20,
    maxHeight: 400
  },
  confirmSection: {
    marginBottom: 20
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8
  },
  confirmValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  confirmValueSmall: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20
  },
  confirmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12
  },
  confirmItemImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  confirmItemImage: {
    width: '100%',
    height: '100%'
  },
  confirmItemInfo: {
    flex: 1
  },
  confirmItemQty: {
    fontSize: 12,
    color: '#6B7280'
  },
  confirmItemName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500'
  },
  confirmItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827'
  },
  confirmTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 8
  },
  confirmTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  confirmTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5'
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center'
  },
  modalBtnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280'
  },
  modalBtnConfirm: {
    flex: 2,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBtnConfirmDisabled: {
    opacity: 0.6
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  processingBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '600'
  },
  processingSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280'
  }
});

export default CheckoutScreen;