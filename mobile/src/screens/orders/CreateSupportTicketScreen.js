// ============================================
// mobile/src/screens/support/CreateSupportTicketScreen.js
// Customer Support Ticket Creation
// ============================================

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const CreateSupportTicketScreen = ({ route, navigation }) => {
  const { orderId, orderNo, productId } = route.params || {};

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'order_issue', label: 'Order Issue', icon: 'receipt-outline', color: '#3B82F6' },
    { id: 'delivery_issue', label: 'Delivery Issue', icon: 'car-outline', color: '#F59E0B' },
    { id: 'product_issue', label: 'Product Issue', icon: 'cube-outline', color: '#EF4444' },
    { id: 'payment_issue', label: 'Payment Issue', icon: 'card-outline', color: '#8B5CF6' },
    { id: 'return_issue', label: 'Return Issue', icon: 'return-down-back-outline', color: '#10B981' },
    { id: 'refund_issue', label: 'Refund Issue', icon: 'cash-outline', color: '#059669' },
    { id: 'technical_issue', label: 'Technical Issue', icon: 'bug-outline', color: '#6B7280' },
    { id: 'other', label: 'Other', icon: 'help-circle-outline', color: '#9CA3AF' }
  ];

  const handleSubmit = async () => {
    // Validation
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/support/tickets', {
        subject: subject.trim(),
        description: description.trim(),
        category,
        orderId,
        productId
      });

      const ticket = response.data.data.ticket;

      Alert.alert(
        'Ticket Created',
        `Your support ticket ${ticket.ticketNo} has been created. We'll respond within 24 hours.`,
        [
          {
            text: 'View Ticket',
            onPress: () => {
              navigation.replace('ViewSupportTicket', { ticketId: ticket._id });
            }
          },
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create ticket:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        {orderNo && (
          <View style={styles.infoCard}>
            <Icon name="information-circle" size={20} color="#4F46E5" />
            <Text style={styles.infoText}>
              This ticket is for Order #{orderNo}
            </Text>
          </View>
        )}

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  category === cat.id && styles.categoryCardSelected
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                  <Icon name={cat.icon} size={24} color={cat.color} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                {category === cat.id && (
                  <View style={styles.selectedBadge}>
                    <Icon name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief summary of your issue"
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
          <Text style={styles.charCount}>{subject.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please describe your issue in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Help Text */}
        <View style={styles.helpBox}>
          <Icon name="bulb-outline" size={20} color="#F59E0B" />
          <Text style={styles.helpText}>
            Tip: Provide as much detail as possible to help us resolve your issue faster.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="send" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Submit Ticket</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollView: { flex: 1 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EEF2FF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5'
  },
  infoText: { flex: 1, fontSize: 14, color: '#4F46E5', fontWeight: '500' },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: {
    width: '48%',
    aspectRatio: 1.5,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative'
  },
  categoryCardSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'center' },
  selectedBadge: { position: 'absolute', top: 8, right: 8 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  textArea: { minHeight: 120 },
  charCount: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'right' },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF3C7',
    padding: 16,
    margin: 16,
    borderRadius: 8
  },
  helpText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18 },
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
    borderRadius: 8
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

export default CreateSupportTicketScreen;