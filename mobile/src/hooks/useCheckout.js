import { useState, useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { fetchCart, updateCartItem } from '../redux/slices/cartSlice';
import { createOrder } from '../redux/slices/orderSlice';

const useCheckout = (navigation) => {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isCodEnabled, setIsCodEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      const response = await api.get('/addresses');
      const fetched = response.data.data.addresses || [];
      setAddresses(fetched);
      const defaultAddr = fetched.find(a => a.isDefault) || fetched[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    } catch (error) {
      console.error('Fetch addresses error:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  const fetchCodStatus = useCallback(async () => {
    try {
      const response = await api.get('/settings/isCodEnabled');
      if (response.data.success) {
        const enabled = response.data.data.value ?? true;
        setIsCodEnabled(enabled);
        if (!enabled && paymentMethod === 'cod') setPaymentMethod('upi');
      }
    } catch (error) {
      console.error('Fetch COD status error:', error);
    }
  }, [paymentMethod]);

  useEffect(() => {
    dispatch(fetchCart());
    fetchAddresses();
    fetchCodStatus();
  }, [dispatch, fetchAddresses, fetchCodStatus]);

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return Alert.alert('Error', 'Enter coupon code');
    setIsValidatingCoupon(true);
    try {
      const response = await api.post('/coupons/validate', { code: couponCode, orderAmount: totalPrice });
      setAppliedCoupon(response.data.data);
      Alert.alert('Success', `Coupon applied! Saved ₹${response.data.data.appliedDiscount}`);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress) return Alert.alert('Error', 'Select an address');
    setIsProcessing(true);
    try {
      const orderData = {
        shippingAddress: selectedAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code
      };
      const result = await dispatch(createOrder(orderData)).unwrap();
      setIsProcessing(false);
      
      const navOrder = { _id: result._id, orderNo: result.orderNo, total: result.total, paymentMethod: result.paymentMethod };
      if (paymentMethod === 'cod') {
        navigation.replace('OrderSuccess', { order: navOrder });
      } else {
        navigation.navigate('PaymentGateway', { order: navOrder, amount: result.total });
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Order Failed', error.message || 'Failed to place order');
    }
  };

  return {
    items,
    totalPrice,
    user,
    addresses,
    selectedAddress,
    setSelectedAddress,
    paymentMethod,
    setPaymentMethod,
    isCodEnabled,
    isProcessing,
    isLoadingAddresses,
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    isValidatingCoupon,
    handleApplyCoupon,
    handleConfirmOrder,
    refreshAddresses: fetchAddresses
  };
};

export default useCheckout;
