import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { applyForReseller } from '../../redux/slices/resellerSlice'; // ✅ CORRECT IMPORT

export default function ApplyResellerScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.reseller);

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'individual',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
  });

  const handleApply = async () => {
    // Validation
    if (!formData.businessName.trim()) {
      Alert.alert('Error', 'Please enter your business name');
      return;
    }

    if (formData.businessName.trim().length < 3) {
      Alert.alert('Error', 'Business name must be at least 3 characters');
      return;
    }

    if (!formData.accountHolderName.trim()) {
      Alert.alert('Error', 'Please enter account holder name');
      return;
    }

    if (!formData.accountNumber.trim() || formData.accountNumber.length < 9) {
      Alert.alert('Error', 'Please enter valid account number (min 9 digits)');
      return;
    }

    if (!formData.bankName.trim()) {
      Alert.alert('Error', 'Please enter bank name');
      return;
    }

    if (!formData.ifscCode.trim() || formData.ifscCode.length !== 11) {
      Alert.alert('Error', 'IFSC code must be 11 characters');
      return;
    }

    // Submit application
    const result = await dispatch(applyForReseller(formData));

    // ✅ Correct payload check
    if (result.payload && !result.payload.message?.includes('error')) {
      Alert.alert(
        'Application Submitted! 🎉',
        'We will review your application within 24-48 hours. You will be notified via email.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else if (result.payload) {
      Alert.alert('Error', result.payload);
    }
  };

  const benefits = [
    { icon: 'trending-up', text: '5-30% profit margin on products', color: '#4CAF50' },
    { icon: 'wallet', text: 'Dedicated wallet for earnings', color: '#FF9500' },
    { icon: 'cash', text: 'Weekly payouts', color: '#0A84FF' },
    { icon: 'headset', text: '24/7 priority support', color: '#5856D6' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A84FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Reseller</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Icon name="briefcase" size={40} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Start Your Business</Text>
          <Text style={styles.heroSubtitle}>
            Join thousands of successful resellers earning daily
          </Text>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>What You Get</Text>

          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: `${benefit.color}15` }]}>
                <Icon name={benefit.icon} size={22} color={benefit.color} />
              </View>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>

        {/* Application Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Application Form</Text>

          {/* Error Display */}
          {error && (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={20} color="#D32F2F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Business Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Business Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="business-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your business name"
                placeholderTextColor="#999"
                value={formData.businessName}
                onChangeText={(text) => setFormData({ ...formData, businessName: text })}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Business Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Business Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.typeSelector}>
              {[
                { value: 'individual', label: 'Individual' },
                { value: 'partnership', label: 'Partnership' },
                { value: 'company', label: 'Company' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    formData.businessType === type.value && styles.typeOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, businessType: type.value })}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.businessType === type.value && styles.typeOptionTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Account Holder Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Account Holder Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="As per bank records"
                placeholderTextColor="#999"
                value={formData.accountHolderName}
                onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Account Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Account Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="card-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter account number"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formData.accountNumber}
                onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Bank Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Bank Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="home-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter bank name"
                placeholderTextColor="#999"
                value={formData.bankName}
                onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* IFSC Code */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              IFSC Code <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="11-digit IFSC code"
                placeholderTextColor="#999"
                value={formData.ifscCode}
                onChangeText={(text) => setFormData({ ...formData, ifscCode: text.toUpperCase() })}
                maxLength={11}
                autoCapitalize="characters"
                editable={!isLoading}
              />
            </View>
            <Text style={styles.helperText}>11 characters (e.g., SBIN0001234)</Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Icon name="information-circle" size={20} color="#0A84FF" />
            <Text style={styles.infoText}>
              Your application will be reviewed within 24-48 hours. You'll receive an email notification.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleApply}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Submit Application</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By submitting, you agree to our{' '}
          <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
          <Text style={styles.termsLink}>Reseller Policy</Text>
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A84FF',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  heroSection: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  benefitsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#000',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    marginLeft: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  typeOptionSelected: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#0A84FF',
  },
  infoText: {
    color: '#1565C0',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: '#0A84FF',
    fontWeight: '600',
  },
});