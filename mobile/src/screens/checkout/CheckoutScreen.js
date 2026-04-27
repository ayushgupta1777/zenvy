import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Image, Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import CustomHeader from '../../components/CustomHeader';
import { getImageUrl } from '../../services/api';
import styles from './CheckoutScreen.Styles';
import useCheckout from '../../hooks/useCheckout';

const CheckoutScreen = ({ navigation }) => {
  const {
    items, totalPrice, user, addresses, selectedAddress, setSelectedAddress,
    paymentMethod, setPaymentMethod, isCodEnabled, isProcessing,
    isLoadingAddresses, couponCode, setCouponCode, appliedCoupon,
    isValidatingCoupon, handleApplyCoupon, handleConfirmOrder
  } = useCheckout(navigation);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const shippingCost = totalPrice > 500 ? 0 : 50;
  const tax = Math.round(totalPrice * 0.03);
  const discount = appliedCoupon ? appliedCoupon.appliedDiscount : 0;
  const finalTotal = totalPrice + shippingCost + tax - discount;

  const handleAddNewAddress = () => {
    navigation.navigate('Profile', { screen: 'Addresses', params: { fromCheckout: true } });
  };

  if (isLoadingAddresses) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4F46E5" /><Text style={styles.loadingText}>Loading checkout details...</Text></View>;

  return (
    <View style={styles.container}>
      <CustomHeader title="Checkout" showBack={!isProcessing} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary ({items.length} items)</Text>
          {items.slice(0, 3).map((item) => (
            <View key={item._id} style={styles.itemRow}>
              <Image source={{ uri: getImageUrl(item.product?.images?.[0]) }} style={styles.itemImage} />
              <View style={styles.itemInfo}><Text style={styles.itemName} numberOfLines={1}>{item.product?.title}</Text><Text style={styles.itemQuantity}>Qty: {item.quantity}</Text></View>
              <Text style={styles.itemPrice}>₹{item.finalPrice * item.quantity}</Text>
            </View>
          ))}
          {items.length > 3 && <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 12 }}>+{items.length - 3} more items</Text>}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Delivery Address</Text><TouchableOpacity onPress={handleAddNewAddress}><Text style={styles.addNewText}>+ Add New</Text></TouchableOpacity></View>
          {addresses.map((addr) => (
            <TouchableOpacity key={addr._id} style={[styles.addressCard, selectedAddress?._id === addr._id && styles.addressCardSelected]} onPress={() => setSelectedAddress(addr)}>
              <Icon name={selectedAddress?._id === addr._id ? 'radio-button-on' : 'radio-button-off'} size={22} color={selectedAddress?._id === addr._id ? '#4F46E5' : '#D1D5DB'} style={{ marginRight: 12 }} />
              <View style={styles.addressDetails}><Text style={styles.addressName}>{addr.name}</Text><Text style={styles.addressText}>{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</Text><Text style={styles.addressPhone}>{addr.phone}</Text></View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity style={[styles.paymentCard, paymentMethod === 'cod' && styles.paymentCardSelected]} onPress={() => setPaymentMethod('cod')} disabled={!isCodEnabled}>
            <Icon name={paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'} size={22} color={paymentMethod === 'cod' ? '#4F46E5' : '#D1D5DB'} style={{ marginRight: 12 }} />
            <Icon name="cash-outline" size={24} color="#4F46E5" style={{ marginRight: 12 }} />
            <View><Text style={styles.paymentLabel}>Cash on Delivery</Text><Text style={styles.paymentDescription}>{isCodEnabled ? 'Pay when you receive' : 'Currently disabled'}</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.paymentCard, paymentMethod === 'upi' && styles.paymentCardSelected]} onPress={() => setPaymentMethod('upi')}>
            <Icon name={paymentMethod === 'upi' ? 'radio-button-on' : 'radio-button-off'} size={22} color={paymentMethod === 'upi' ? '#4F46E5' : '#D1D5DB'} style={{ marginRight: 12 }} />
            <Icon name="card-outline" size={24} color="#4F46E5" style={{ marginRight: 12 }} />
            <View><Text style={styles.paymentLabel}>Online Payment</Text><Text style={styles.paymentDescription}>UPI, Cards, Net Banking</Text></View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apply Coupon</Text>
          <View style={styles.couponInputContainer}>
            <View style={styles.inputWrapper}><Icon name="ticket-outline" size={20} color="#6B7280" style={{ marginRight: 8 }} /><TextInput style={styles.couponInput} placeholder="Enter Coupon" value={couponCode} onChangeText={setCouponCode} autoCapitalize="characters" editable={!appliedCoupon} /></View>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon} disabled={!couponCode.trim() || isValidatingCoupon || appliedCoupon}>{isValidatingCoupon ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.applyBtnText}>{appliedCoupon ? 'Applied' : 'Apply'}</Text>}</TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Subtotal</Text><Text style={styles.priceValue}>₹{totalPrice}</Text></View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Shipping</Text><Text style={[styles.priceValue, shippingCost === 0 && { color: '#10B981' }]}>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</Text></View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Tax (GST)</Text><Text style={styles.priceValue}>₹{tax}</Text></View>
          {appliedCoupon && <View style={styles.priceRow}><Text style={[styles.priceLabel, { color: '#10B981' }]}>Discount ({appliedCoupon.code})</Text><Text style={[styles.priceValue, { color: '#10B981' }]}>-₹{appliedCoupon.appliedDiscount}</Text></View>}
          <View style={styles.divider} />
          <View style={styles.priceRow}><Text style={styles.priceTotalLabel}>Total Amount</Text><Text style={styles.priceTotalValue}>₹{finalTotal}</Text></View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerPrice}><Text style={styles.footerLabel}>Total to Pay</Text><Text style={styles.footerAmount}>₹{finalTotal}</Text></View>
        <TouchableOpacity style={[styles.checkoutBtn, (isProcessing || !selectedAddress) && styles.checkoutBtnDisabled]} onPress={() => setShowConfirmModal(true)} disabled={isProcessing || !selectedAddress}>
          <Text style={styles.checkoutBtnText}>Place Order</Text><Icon name="chevron-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      <Modal visible={showConfirmModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Confirm Your Order</Text><TouchableOpacity onPress={() => setShowConfirmModal(false)}><Icon name="close" size={24} color="#6B7280" /></TouchableOpacity></View>
            <ScrollView style={styles.modalContent}>
              <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>Please review your delivery details and items before placing the order.</Text>
              <View style={{ marginBottom: 20 }}><Text style={{ fontWeight: '700', marginBottom: 4 }}>Delivery to:</Text><Text>{selectedAddress?.name}</Text><Text>{selectedAddress?.addressLine1}, {selectedAddress?.city}</Text></View>
              <View style={{ marginBottom: 20 }}><Text style={{ fontWeight: '700', marginBottom: 4 }}>Payment:</Text><Text>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</Text></View>
              <View style={{ borderTopWidth: 1, borderColor: '#F0F0F0', paddingTop: 16 }}><View style={styles.priceRow}><Text style={styles.priceTotalLabel}>Final Amount</Text><Text style={styles.priceTotalValue}>₹{finalTotal}</Text></View></View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowConfirmModal(false)}><Text style={{ fontWeight: '700' }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={() => { setShowConfirmModal(false); handleConfirmOrder(); }}><Text style={{ color: '#fff', fontWeight: '700' }}>Place Order Now</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingBox}><ActivityIndicator size="large" color="#4F46E5" /><Text style={styles.processingText}>Processing Order...</Text><Text style={styles.processingSubtext}>Please do not close the app</Text></View>
        </View>
      )}
    </View>
  );
};

export default CheckoutScreen;