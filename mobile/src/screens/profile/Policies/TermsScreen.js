// ============================================
// TermsScreen.js - Terms & Conditions
// mobile/screens/TermsScreen.js
// ============================================
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const TermsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="document-text-outline" size={48} color="#4F46E5" />
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.subtitle}>Effective Date: January 30, 2026</Text>
      </View>

      <View style={styles.content}>
        <Section
          number="1"
          title="Business Information"
          content="Business Name: New Raj Fancy
Address: Infront of Balaji Parisar, Beside Sai Astha Marriage Garden, Gotegaon, Narsinghpur, M.P 487118
Contact: 07649830348
Email: Newrajfancystore@gmail.com"
        />

        <Section
          number="2"
          title="Use of Platform"
          content="By accessing our website or mobile application, you agree to use the platform only for lawful purposes. Any misuse, fraud, or unauthorized activity may lead to immediate account suspension or termination."
        />

        <Section
          number="3"
          title="Product & Pricing"
          content="• Prices are inclusive of GST as per Government regulations
• Product images are for representation purposes; slight variations in color or texture may occur
• Prices are subject to change without prior notice based on market conditions"
        />

        <Section
          number="4"
          title="Orders & Acceptance"
          content="Orders are confirmed only after successful payment verification. We reserve the right to cancel orders due to stock issues, pricing errors, or suspicious activity detected by our security systems."
        />

        <Section
          number="5"
          title="Reseller Terms"
          content="• Resellers can sell products using our catalog without holding physical inventory
• Profit margins are set by resellers at their own discretion
• New Raj Fancy is not responsible for reseller customer communication or pricing differences
• Misleading customers or making false commitments may lead to immediate account termination"
        />

        <Section
          number="6"
          title="GST Compliance"
          content="• GST will be applied as per Government of India regulations
• GST invoices will be provided upon request for business accounts
• Resellers are solely responsible for their own GST compliance if selling independently"
        />

        <Section
          number="7"
          title="Intellectual Property"
          content="All logos, images, product descriptions, and application content belong to New Raj Fancy. Unauthorized reuse, reproduction, or distribution is strictly prohibited without explicit permission."
        />

        <Section
          number="8"
          title="Limitation of Liability"
          content="New Raj Fancy is not liable for indirect damages, delivery delays caused by third-party logistics, or business losses caused by platform downtime or third-party service interruptions."
        />

        <View style={styles.footer}>
          <Icon name="shield-checkmark" size={24} color="#10B981" />
          <Text style={styles.footerText}>
            By using New Raj Fancy, you acknowledge that you have read and understood these terms.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const Section = ({ number, title, content }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{number}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Text style={styles.sectionContent}>{content}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  content: {
    padding: 20
  },
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
    marginBottom: 12
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5'
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  sectionContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center'
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
    marginLeft: 12,
    lineHeight: 20
  }
});

export default TermsScreen;