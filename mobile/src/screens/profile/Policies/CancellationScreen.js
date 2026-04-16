// ============================================
// CancellationScreen.js - Cancellation & Refund Policy
// mobile/screens/CancellationScreen.js
// ============================================
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CancellationScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="cash-outline" size={48} color="#4F46E5" />
        <Text style={styles.title}>Cancellation & Refund</Text>
        <Text style={styles.subtitle}>Effective Date: January 30, 2026</Text>
      </View>

      <View style={styles.content}>
        <InfoCard
          icon="close-circle"
          iconColor="#EF4444"
          title="1. Cancellation Policy"
          content="• Orders can be canceled within 24 hours of placement.
• Cancellation is strictly not allowed once the order has been dispatched/shipped."
        />

        <InfoCard
          icon="return-down-back"
          iconColor="#3B82F6"
          title="2. Return Policy"
          content="• Return requests must be raised within 48 hours of delivery.
• Returns are only accepted if:
  - You receive a damaged product
  - The wrong item was delivered"
        />

        <InfoCard
          icon="cash"
          iconColor="#10B981"
          title="3. Refund Policy"
          content="• Approved refunds are processed within 5–7 business days.
• The refund will be credited back via the original payment method used during purchase."
        />

        <InfoCard
          icon="bag-remove"
          iconColor="#F59E0B"
          title="4. Non-Returnable Items"
          content="• Used or worn jewellery
• Customized or personalized orders
• Items returned without their original packaging or tags"
        />

        <InfoCard
          icon="people"
          iconColor="#6366F1"
          title="5. Reseller Refund Terms"
          content="• All refunds will be processed directly to the original buyer.
• Resellers are responsible for coordinating and settling refunds with their own customers independently."
        />

        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => navigation.navigate('Support')}
        >
          <Icon name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.supportButtonText}>Need Help with a Return?</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            We're committed to making your experience as smooth as possible. Your satisfaction is our priority! 🌟
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const InfoCard = ({ icon, iconColor, title, content }) => (
  <View style={styles.infoCard}>
    <View style={[styles.infoIcon, { backgroundColor: `${iconColor}15` }]}>
      <Icon name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{content}</Text>
    </View>
  </View>
);

const Timeline = ({ steps }) => (
  <View style={styles.timeline}>
    {steps.map((step, index) => (
      <View key={index} style={styles.timelineItem}>
        <View style={styles.timelineIconContainer}>
          <View style={[styles.timelineIcon, { backgroundColor: step.color }]}>
            <Icon name={step.icon} size={18} color="#fff" />
          </View>
          {index < steps.length - 1 && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>{step.title}</Text>
          <Text style={styles.timelineDescription}>{step.description}</Text>
        </View>
      </View>
    ))}
  </View>
);

const RefundMethod = ({ icon, method, time }) => (
  <View style={styles.refundMethod}>
    <Icon name={icon} size={20} color="#4F46E5" />
    <View style={styles.refundMethodInfo}>
      <Text style={styles.refundMethodName}>{method}</Text>
      <Text style={styles.refundMethodTime}>{time}</Text>
    </View>
  </View>
);

const NoteItem = ({ text }) => (
  <View style={styles.noteItem}>
    <Icon name="checkmark-circle" size={18} color="#10B981" />
    <Text style={styles.noteText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  content: { padding: 16 },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 8 },
  actionSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  policySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  policySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  policySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10
  },
  infoCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  timeline: { marginVertical: 12 },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4
  },
  timelineContent: { flex: 1, paddingTop: 4 },
  timelineTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  timelineDescription: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  refundMethods: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8
  },
  refundMethodsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  refundMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  refundMethodInfo: { marginLeft: 12, flex: 1 },
  refundMethodName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  refundMethodTime: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  notesSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 8
  },
  notesList: { gap: 8 },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#78350F',
    marginLeft: 8,
    lineHeight: 20
  },
  supportButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  footer: {
    padding: 16,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20
  }
});

export default CancellationScreen;