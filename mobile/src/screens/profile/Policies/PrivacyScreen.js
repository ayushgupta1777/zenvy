// ============================================
// PrivacyScreen.js - Privacy Policy
// mobile/screens/PrivacyScreen.js
// ============================================
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PrivacyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="lock-closed-outline" size={48} color="#4F46E5" />
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>Effective Date: January 30, 2026</Text>
      </View>

      <View style={styles.content}>
        <Section
          icon="information-circle"
          iconColor="#0A84FF"
          title="1. Information Collected"
          content="• Name, phone number, and email address
• Shipping and billing address details
• Order history and payment transaction information"
        />

        <Section
          icon="compass"
          iconColor="#5E5CE6"
          title="2. Usage of Data"
          content="We use your data for order processing, delivery, and customer support. With your explicit consent, we may send marketing communications via WhatsApp, SMS, or Email."
        />

        <Section
          icon="share-social"
          iconColor="#FF9500"
          title="3. Data Sharing"
          content="We only share data with trusted delivery partners and secure payment gateways. Data may also be shared with legal authorities if strictly required under applicable Indian laws."
        />

        <Section
          icon="shield-checkmark"
          iconColor="#FF3B30"
          title="4. Data Security"
          content="We implement industry-standard security practices and encryption to protect your sensitive personal and financial data from unauthorized access."
        />

        <Section
          icon="people"
          iconColor="#34C759"
          title="5. User Rights"
          content="As per Indian data protection principles, you may request access to your data, corrections of inaccuracies, or complete deletion by contacting our privacy team."
        />

        <View style={styles.contactBox}>
          <Icon name="mail" size={24} color="#4F46E5" />
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>Questions About Privacy?</Text>
            <Text style={styles.contactText}>
              Contact our privacy team at Newrajfancystore@gmail.com
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: January 30, 2026
          </Text>
          <Text style={styles.footerSubtext}>
            At New Raj Fancy, we are committed to following applicable Indian data protection principles for your safety.
          </Text>
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
    marginBottom: 12,
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
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
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
  contactBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center'
  },
  contactContent: {
    flex: 1,
    marginLeft: 12
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4
  },
  contactText: {
    fontSize: 13,
    color: '#6366F1',
    lineHeight: 18
  },
  footer: {
    padding: 16,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18
  }
});

export default PrivacyScreen;