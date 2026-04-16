import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const InitiateReturnScreen = ({ route, navigation }) => {
  const { order } = route.params;
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { value: 'damaged', label: 'Product Damaged', icon: 'alert-circle-outline', color: '#EF4444' },
    { value: 'wrong_product', label: 'Wrong Product Received', icon: 'swap-horizontal-outline', color: '#F59E0B' },
    { value: 'not_as_described', label: 'Not as Described', icon: 'close-circle-outline', color: '#8B5CF6' },
    { value: 'quality_issue', label: 'Quality Issue', icon: 'thumbs-down-outline', color: '#EC4899' },
    { value: 'other', label: 'Other Reason', icon: 'ellipsis-horizontal-circle-outline', color: '#6B7280' }
  ];

  const toggleItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const calculateRefundAmount = () => {
    let total = 0;
    selectedItems.forEach(itemId => {
      const item = order.items.find(i => i._id === itemId);
      if (item) {
        total += item.finalPrice * item.quantity;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    // Validation
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item to return');
      return;
    }

    if (!returnReason) {
      Alert.alert('Error', 'Please select a reason for return');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the issue in detail');
      return;
    }

    setIsSubmitting(true);

    try {
      const returnData = {
        orderId: order._id,
        items: selectedItems.map(itemId => ({
          orderItemId: itemId,
          quantity: 1, // You can add quantity selector if needed
          reason: returnReason
        })),
        returnReason,
        returnDescription: description,
        returnImages: [] // You can add image upload functionality
      };

      const response = await api.post('/returns', returnData);

      Alert.alert(
        'Return Request Submitted ✅',
        `Your return request has been submitted successfully. We will review it within 24 hours.\n\nReturn Number: ${response.data.data.returnRequest.returnNo}`,
        [
          {
            text: 'View My Returns',
            onPress: () => navigation.replace('MyReturns')
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit return request'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return Request</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.orderInfoCard}>
          <Icon name="receipt-outline" size={24} color="#4F46E5" />
          <View style={styles.orderInfoContent}>
            <Text style={styles.orderInfoTitle}>Order #{order.orderNo}</Text>
            <Text style={styles.orderInfoSubtitle}>
              Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* Select Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Items to Return *</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the products you want to return
          </Text>

          {order.items.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[
                styles.itemCard,
                selectedItems.includes(item._id) && styles.itemCardSelected
              ]}
              onPress={() => toggleItem(item._id)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                <Icon
                  name={selectedItems.includes(item._id) ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={selectedItems.includes(item._id) ? '#4F46E5' : '#D1D5DB'}
                />
              </View>

              <Image 
                source={{ uri: item.product?.images?.[0] }} 
                style={styles.itemImage} 
              />

              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.product?.title || 'Product'}
                </Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemPrice}>₹{item.finalPrice}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {selectedItems.length > 0 && (
            <View style={styles.refundAmountCard}>
              <Text style={styles.refundAmountLabel}>Estimated Refund Amount</Text>
              <Text style={styles.refundAmountValue}>₹{calculateRefundAmount()}</Text>
            </View>
          )}
        </View>

        {/* Return Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Return *</Text>
          <Text style={styles.sectionSubtitle}>
            Select the most appropriate reason
          </Text>

          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={[
                styles.reasonCard,
                returnReason === reason.value && styles.reasonCardSelected
              ]}
              onPress={() => setReturnReason(reason.value)}
              activeOpacity={0.7}
            >
              <View style={styles.reasonRadio}>
                <Icon
                  name={returnReason === reason.value ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={returnReason === reason.value ? '#4F46E5' : '#D1D5DB'}
                />
              </View>

              <View style={[styles.reasonIcon, { backgroundColor: reason.color + '20' }]}>
                <Icon name={reason.icon} size={24} color={reason.color} />
              </View>

              <Text style={styles.reasonText}>{reason.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe the Issue *</Text>
          <Text style={styles.sectionSubtitle}>
            Provide detailed information about the problem
          </Text>

          <TextInput
            style={styles.textArea}
            placeholder="Example: The product arrived with a broken screen. The packaging was damaged..."
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Help Text */}
        <View style={styles.helpBox}>
          <Icon name="information-circle" size={20} color="#F59E0B" />
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Return Process</Text>
            <Text style={styles.helpText}>
              • We'll review your request within 24 hours{'\n'}
              • If approved, pickup will be scheduled{'\n'}
              • Refund will be processed after receiving the product{'\n'}
              • Refund timeline: 5-7 business days
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (isSubmitting || selectedItems.length === 0 || !returnReason || !description.trim()) && styles.submitBtnDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || selectedItems.length === 0 || !returnReason || !description.trim()}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.submitBtnText}>Submit Return Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scrollView: { flex: 1 },
  orderInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EEF2FF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5'
  },
  orderInfoContent: { flex: 1 },
  orderInfoTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  orderInfoSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  sectionSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB'
  },
  itemCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF'
  },
  checkbox: { marginRight: 12 },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E5E7EB'
  },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6 },
  itemMeta: { flexDirection: 'row', gap: 12 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
  itemQty: { fontSize: 13, color: '#6B7280' },
  refundAmountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
    marginTop: 8
  },
  refundAmountLabel: { fontSize: 14, fontWeight: '600', color: '#059669' },
  refundAmountValue: { fontSize: 20, fontWeight: '700', color: '#059669' },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#F9FAFB'
  },
  reasonCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF'
  },
  reasonRadio: {},
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  reasonText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#111827',
    minHeight: 120
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'right'
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF3C7',
    padding: 16,
    margin: 16,
    borderRadius: 12
  },
  helpContent: { flex: 1 },
  helpTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  helpText: { fontSize: 13, color: '#78350F', lineHeight: 20 },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default InitiateReturnScreen;