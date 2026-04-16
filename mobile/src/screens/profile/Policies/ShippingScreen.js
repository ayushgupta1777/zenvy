// ============================================
// ShippingScreen.js - Shipping & Delivery Policy
// mobile/screens/ShippingScreen.js
// ============================================
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ShippingScreen = ({ navigation }) => {
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);

  const checkDelivery = () => {
    if (pincode.length === 6) {
      // Simulate delivery check
      setDeliveryEstimate({
        available: true,
        days: '3-5 business days',
        charges: 'FREE'
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="bus-outline" size={48} color="#4F46E5" />
        <Text style={styles.title}>Shipping & Delivery</Text>
        <Text style={styles.subtitle}>Effective Date: January 30, 2026</Text>
      </View>

      <View style={styles.content}>
        <Section
          icon="location"
          iconColor="#0A84FF"
          title="1. Delivery Coverage"
          content="We deliver to 20,000+ pincodes across India using trusted logistics partners like Shiprocket, Delhivery, and BlueDart. Check availability at checkout."
        />

        <Section
          icon="time"
          iconColor="#5E5CE6"
          title="2. Processing Time"
          content="Standard orders are processed and prepared for dispatch within 1–3 business days after payment confirmation."
        />

        <Section
          icon="airplane"
          iconColor="#10B981"
          title="3. Delivery Time"
          content="• Metro Cities: 3–5 business days
• Other Areas: 5–7 business days
(Note: Remote areas may take 1-2 additional days)"
        />

        <Section
          icon="wallet"
          iconColor="#F59E0B"
          title="4. Shipping Charges"
          content="Shipping charges are calculated based on your location and total order value. The exact amount will be displayed clearly on the checkout page before you pay."
        />

        <Section
          icon="notifications"
          iconColor="#6366F1"
          title="5. Tracking"
          content="Once your order is dispatched, live tracking details will be shared with you automatically via SMS and WhatsApp."
        />

        <Section
          icon="alert-circle"
          iconColor="#EF4444"
          title="6. Delays"
          content="While we strive for on-time delivery, delays may occasionally occur due to courier operational issues, extreme weather, or unforeseen circumstances beyond our control."
        />

        {/* Extra Legal Section */}
        <View style={[styles.section, { backgroundColor: '#F0F9FF', borderColor: '#4F46E5', borderWidth: 1 }]}>
          <View style={styles.sectionHeader}>
            <Icon name="hammer" size={24} color="#4F46E5" />
            <Text style={[styles.sectionTitle, { color: '#1E3A8A' }]}>Extra Legal (India Compliance)</Text>
          </View>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: '700', color: '#1E40AF', marginBottom: 4 }}>⚖️ Governing Law</Text>
            <Text style={{ fontSize: 13, color: '#1E3A8A', lineHeight: 20 }}>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Narsinghpur, Madhya Pradesh.
            </Text>
          </View>

          <View>
            <Text style={{ fontWeight: '700', color: '#1E40AF', marginBottom: 4 }}>✔️ Compliance</Text>
            <Text style={{ fontSize: 13, color: '#1E3A8A', lineHeight: 20 }}>
              We strictly adhere to:
              {"\n"}• Consumer Protection Act, 2019
              {"\n"}• Information Technology Act, 2000
              {"\n"}• GST Regulations and Indian Trade Laws
            </Text>
          </View>
        </View>

        {/* Coverage Area */}
        <View style={styles.coverageSection}>
          <Text style={styles.coverageTitle}>📍 Delivery Coverage</Text>
          <Text style={styles.coverageText}>
            We deliver to 20,000+ pincodes across India including metros, tier 2 & 3 cities, and most rural areas. Check pincode availability at checkout.
          </Text>
        </View>

        {/* Warehouse Details */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Icon name="business" size={24} color="#0A84FF" />
            <Text style={styles.infoTitle}>Warehouse Details</Text>
          </View>
          <InfoItem
            icon="person-circle"
            text="Warehouse SPOC: New Raj Fancy | 9343338599"
          />
          <InfoItem
            icon="location-sharp"
            text="New Raj Fancy Store, Ward no 15, Near Balaji Dham Colony, Sai Aastha Garden Ke Piche, Narsinghpur, Madhya Pradesh, India, 487118"
          />
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <Icon name="headset" size={32} color="#4F46E5" />
          <Text style={styles.contactTitle}>Need Help with Delivery?</Text>
          <Text style={styles.contactText}>
            Our support team is here to help with any delivery-related queries
          </Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL('tel:+917240992230')}
            >
              <Icon name="call" size={18} color="#4F46E5" />
              <Text style={styles.contactButtonText}>Call Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('UserChat')}
            >
              <Icon name="chatbubbles" size={18} color="#4F46E5" />
              <Text style={styles.contactButtonText}>Chat Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const Section = ({ icon, iconColor, title, content }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={[styles.iconBadge, { backgroundColor: `${iconColor}15` }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Text style={styles.sectionContent}>{content}</Text>
  </View>
);

const ShippingOption = ({ icon, iconColor, title, time, price, features, badge }) => (
  <View style={styles.shippingOption}>
    <View style={styles.optionHeader}>
      <View style={[styles.optionIcon, { backgroundColor: `${iconColor}15` }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.optionInfo}>
        <View style={styles.optionTitleRow}>
          <Text style={styles.optionTitle}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.optionTime}>{time}</Text>
        <Text style={styles.optionPrice}>{price}</Text>
      </View>
    </View>
    <View style={styles.optionFeatures}>
      {features.map((feature, index) => (
        <View key={index} style={styles.feature}>
          <Icon name="checkmark" size={14} color="#10B981" />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  </View>
);

const DeliveryStep = ({ number, icon, title, description, color, isLast }) => (
  <View style={styles.deliveryStep}>
    <View style={styles.stepIndicator}>
      <View style={[styles.stepNumber, { backgroundColor: color }]}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      {!isLast && <View style={styles.stepLine} />}
    </View>
    <View style={styles.stepContent}>
      <View style={[styles.stepIcon, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <View style={styles.stepText}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  </View>
);

const TrackingFeature = ({ icon, title, description }) => (
  <View style={styles.trackingFeature}>
    <Icon name={icon} size={20} color="#fff" />
    <Text style={styles.trackingFeatureTitle}>{title}</Text>
    <Text style={styles.trackingFeatureDesc}>{description}</Text>
  </View>
);

const ChargeRow = ({ label, value, valueColor }) => (
  <View style={styles.chargeRow}>
    <Text style={styles.chargeLabel}>{label}</Text>
    <Text style={[styles.chargeValue, { color: valueColor }]}>{value}</Text>
  </View>
);

const InfoItem = ({ icon, text }) => (
  <View style={styles.infoItem}>
    <Icon name={icon} size={18} color="#0A84FF" />
    <Text style={styles.infoItemText}>{text}</Text>
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
  pincodeChecker: {
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
  pincodeTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  pincodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  pincodeInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#111827'
  },
  checkButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6
  },
  checkButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  deliveryEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8
  },
  estimateInfo: { marginLeft: 12 },
  estimateText: { fontSize: 15, fontWeight: '600', color: '#065F46' },
  estimateCharges: { fontSize: 13, color: '#059669', marginTop: 2 },
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 10 },
  sectionContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22
  },
  shippingOption: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12
  },
  optionHeader: { flexDirection: 'row', marginBottom: 12 },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  optionInfo: { flex: 1 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#92400E' },
  optionTime: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  optionPrice: { fontSize: 14, fontWeight: '600', color: '#4F46E5', marginTop: 4 },
  optionFeatures: { gap: 6 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { fontSize: 12, color: '#6B7280' },
  deliveryStep: { flexDirection: 'row', marginBottom: 16 },
  stepIndicator: { alignItems: 'center', marginRight: 12 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumberText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4
  },
  stepContent: { flex: 1, flexDirection: 'row' },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepText: { flex: 1, paddingTop: 4 },
  stepTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  stepDescription: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  trackingSection: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16
  },
  trackingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  trackingHeaderText: { marginLeft: 12, flex: 1 },
  trackingTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  trackingSubtitle: { fontSize: 13, color: '#C7D2FE', marginTop: 2 },
  trackingFeatures: { flexDirection: 'row', gap: 12 },
  trackingFeature: {
    flex: 1,
    backgroundColor: '#FFFFFF15',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  trackingFeatureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center'
  },
  trackingFeatureDesc: {
    fontSize: 11,
    color: '#C7D2FE',
    marginTop: 4,
    textAlign: 'center'
  },
  chargesTable: { gap: 8 },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6
  },
  chargeLabel: { fontSize: 14, color: '#374151' },
  chargeValue: { fontSize: 14, fontWeight: '600' },
  infoSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginLeft: 8
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 10
  },
  infoItemText: {
    flex: 1,
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20
  },
  coverageSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  coverageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8
  },
  coverageText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20
  },
  contactSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5'
  }
});

export default ShippingScreen;