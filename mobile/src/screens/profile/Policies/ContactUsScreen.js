// ============================================
// ContactUsScreen.js - Contact Us Page
// mobile/screens/ContactUsScreen.js
// ============================================
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, Linking, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ContactUsScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Submit form
    Alert.alert('Success', 'Your message has been sent! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleCall = () => {
    Linking.openURL('tel:+917240992230');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:newrajfancystore@gmail.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/917240992230');
  };

  const handleSocialLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header removed and moved to Navigator */}
      <View style={{ height: 20 }} />

      <View style={styles.content}>
        {/* Quick Contact Cards */}
        <View style={styles.quickContact}>
          <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
            <View style={[styles.contactCardIcon, { backgroundColor: '#DCFCE715' }]}>
              <Icon name="call" size={28} color="#10B981" />
            </View>
            <Text style={styles.contactCardTitle}>Call Us</Text>
            <Text style={styles.contactCardValue}>+91 724 099 2230</Text>
            <Text style={styles.contactCardHours}>Mon-Sat: 9AM-8PM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={[styles.contactCardIcon, { backgroundColor: '#DBEAFE15' }]}>
              <Icon name="mail" size={28} color="#0A84FF" />
            </View>
            <Text style={styles.contactCardTitle}>Email Us</Text>
            <Text style={styles.contactCardValue}>newrajfancystore@</Text>
            <Text style={styles.contactCardValue}>gmail.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
            <View style={[styles.contactCardIcon, { backgroundColor: '#D1FAE515' }]}>
              <Icon name="logo-whatsapp" size={28} color="#10B981" />
            </View>
            <Text style={styles.contactCardTitle}>WhatsApp</Text>
            <Text style={styles.contactCardValue}>Chat with us</Text>
            <Text style={styles.contactCardHours}>Quick replies</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Form Hidden As Requested */}
        {/* <View style={styles.formSection}>
          ... Form hidden ...
        </View> */}

        {/* Office Address */}
        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Icon name="location" size={24} color="#FF3B30" />
            <Text style={styles.addressTitle}>Our Office</Text>
          </View>

          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <Icon name="business" size={20} color="#6B7280" />
              <Text style={styles.addressText}>
                New Raj Fancy Store,{'\n'}
                Ward no 15, Near Balaji Dham Colony,{'\n'}
                Sai Aastha Garden Ke Piche, Narsinghpur,{'\n'}
                Madhya Pradesh, India, 487118
              </Text>
            </View>

            <View style={styles.addressRow}>
              <Icon name="person-circle" size={20} color="#6B7280" />
              <Text style={styles.addressText}>
                Warehouse SPOC: New Raj Fancy | 9343338599
              </Text>
            </View>

            <View style={styles.addressRow}>
              <Icon name="time" size={20} color="#6B7280" />
              <Text style={styles.addressText}>
                Business Hours:{'\n'}
                Monday - Saturday: 9:00 AM - 7:00 PM{'\n'}
                Sunday: Closed
              </Text>
            </View>

            <TouchableOpacity style={styles.mapButton}>
              <Icon name="map" size={18} color="#4F46E5" />
              <Text style={styles.mapButtonText}>View on Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeader}>
            <Icon name="help-circle" size={24} color="#FF9500" />
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          </View>

          <FAQItem
            question="How do I track my order?"
            answer="Go to 'My Orders' in your profile, select your order, and click 'Track Order' to see real-time updates."
          />

          <FAQItem
            question="What are your payment options?"
            answer="We accept Credit/Debit Cards, Net Banking, UPI, Wallets, and Cash on Delivery."
          />

          <FAQItem
            question="How long does delivery take?"
            answer="Standard delivery takes 3-5 business days. Express delivery is available for 1-2 days."
          />

          <FAQItem
            question="Can I cancel my order?"
            answer="Yes, you can cancel before shipment. After shipment, you can return within 7 days of delivery."
          />
        </View>

        {/* Social Media */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Connect With Us</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1877F215' }]}
              onPress={() => handleSocialLink('https://facebook.com')}
            >
              <Icon name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#E4405F15' }]}
              onPress={() => handleSocialLink('https://www.instagram.com/new_raj_fancy?igsh=MTZnaW9zbnVqMjR1ZQ==')}
            >
              <Icon name="logo-instagram" size={24} color="#E4405F" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1DA1F215' }]}
              onPress={() => handleSocialLink('https://twitter.com')}
            >
              <Icon name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#0A66C215' }]}
              onPress={() => handleSocialLink('https://linkedin.com')}
            >
              <Icon name="logo-linkedin" size={24} color="#0A66C2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#FF000015' }]}
              onPress={() => handleSocialLink('https://youtube.com')}
            >
              <Icon name="logo-youtube" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.supportHours}>
          <Icon name="headset" size={32} color="#10B981" />
          <Text style={styles.supportHoursTitle}>24/7 Customer Support</Text>
          <Text style={styles.supportHoursText}>
            Our dedicated support team is available round the clock to assist you with any queries or concerns.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.faqQuestion}>
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </View>
      {expanded && (
        <Text style={styles.faqAnswer}>{answer}</Text>
      )}
    </TouchableOpacity>
  );
};

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
  quickContact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  contactCard: {
    flex: 1,
    minWidth: '30%',
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
  contactCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  contactCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6
  },
  contactCardValue: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
    textAlign: 'center'
  },
  contactCardHours: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center'
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827'
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top'
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  addressSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10
  },
  addressCard: { gap: 16 },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5'
  },
  faqSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10
  },
  faqItem: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20
  },
  socialSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  supportHours: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center'
  },
  supportHoursTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 12,
    marginBottom: 8
  },
  supportHoursText: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 22
  }
});

export default ContactUsScreen;