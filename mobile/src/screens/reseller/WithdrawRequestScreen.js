import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const WithdrawScreen = ({ route, navigation }) => {
  const { availableBalance } = route.params;
  const { user } = useSelector((state) => state.auth);

  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: user?.resellerApplication?.accountHolderName || '',
    accountNumber: user?.resellerApplication?.accountNumber || '',
    bankName: user?.resellerApplication?.bankName || '',
    ifscCode: user?.resellerApplication?.ifscCode || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MIN_WITHDRAWAL = 100;
  const quickAmounts = [500, 1000, 2000, 5000].filter(amt => amt <= availableBalance);

  const handleWithdraw = async () => {
    // Validations
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (withdrawAmount < MIN_WITHDRAWAL) {
      Alert.alert('Minimum Amount', `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`);
      return;
    }

    if (withdrawAmount > availableBalance) {
      Alert.alert('Insufficient Balance', `You only have ₹${availableBalance} available`);
      return;
    }

    // Validate bank details
    if (!bankDetails.accountHolderName.trim()) {
      Alert.alert('Required', 'Please enter account holder name');
      return;
    }

    if (!bankDetails.accountNumber.trim() || bankDetails.accountNumber.length < 9) {
      Alert.alert('Invalid', 'Please enter valid account number');
      return;
    }

    if (!bankDetails.ifscCode.trim() || bankDetails.ifscCode.length !== 11) {
      Alert.alert('Invalid', 'IFSC code must be 11 characters');
      return;
    }

    if (!bankDetails.bankName.trim()) {
      Alert.alert('Required', 'Please enter bank name');
      return;
    }

    // Confirm withdrawal
    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw ₹${withdrawAmount} to your bank account?\n\nAccount: ${bankDetails.accountNumber}\nIFSC: ${bankDetails.ifscCode}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => submitWithdrawal(withdrawAmount)
        }
      ]
    );
  };

  const submitWithdrawal = async (withdrawAmount) => {
    setIsSubmitting(true);

    try {
      const response = await api.post('/reseller/withdrawal', {
        amount: withdrawAmount,
        bankDetails: bankDetails
      });

      Alert.alert(
        'Withdrawal Requested! 🎉',
        'Your withdrawal request has been submitted. The amount will be transferred to your bank account within 2-3 business days.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to process withdrawal request'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBankDetail = (field, value) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Money</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Available Balance Card */}
      <View style={styles.balanceCard}>
        <Icon name="wallet" size={48} color="#4F46E5" />
        <Text style={styles.balanceLabel}>Available to Withdraw</Text>
        <Text style={styles.balanceAmount}>₹{availableBalance}</Text>
        <Text style={styles.balanceHint}>Minimum: ₹{MIN_WITHDRAWAL}</Text>
      </View>

      {/* Amount Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enter Amount</Text>

        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor="#D1D5DB"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Quick Amount Buttons */}
        {quickAmounts.length > 0 && (
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountBtn,
                  amount === String(quickAmount) && styles.quickAmountBtnActive
                ]}
                onPress={() => setAmount(String(quickAmount))}
              >
                <Text style={[
                  styles.quickAmountText,
                  amount === String(quickAmount) && styles.quickAmountTextActive
                ]}>
                  ₹{quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
            {availableBalance > 5000 && (
              <TouchableOpacity
                style={[
                  styles.quickAmountBtn,
                  amount === String(availableBalance) && styles.quickAmountBtnActive
                ]}
                onPress={() => setAmount(String(availableBalance))}
              >
                <Text style={[
                  styles.quickAmountText,
                  amount === String(availableBalance) && styles.quickAmountTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Bank Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bank Account Details</Text>
        <Text style={styles.sectionSubtitle}>
          Your money will be transferred to this account
        </Text>

        {/* Account Holder Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Account Holder Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Icon name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="As per bank records"
              placeholderTextColor="#9CA3AF"
              value={bankDetails.accountHolderName}
              onChangeText={(text) => updateBankDetail('accountHolderName', text)}
            />
          </View>
        </View>

        {/* Account Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Account Number <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Icon name="card-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter account number"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={bankDetails.accountNumber}
              onChangeText={(text) => updateBankDetail('accountNumber', text)}
            />
          </View>
        </View>

        {/* IFSC Code */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            IFSC Code <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Icon name="business-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter IFSC code"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={11}
              value={bankDetails.ifscCode}
              onChangeText={(text) => updateBankDetail('ifscCode', text.toUpperCase())}
            />
          </View>
          <Text style={styles.helperText}>11 characters (e.g., SBIN0001234)</Text>
        </View>

        {/* Bank Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Bank Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Icon name="home-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter bank name"
              placeholderTextColor="#9CA3AF"
              value={bankDetails.bankName}
              onChangeText={(text) => updateBankDetail('bankName', text)}
            />
          </View>
        </View>
      </View>

      {/* Important Info */}
      <View style={styles.infoBox}>
        <Icon name="shield-checkmark" size={24} color="#10B981" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Secure & Fast</Text>
          <Text style={styles.infoText}>
            • Processing time: 2-3 business days{'\n'}
            • Your bank details are encrypted{'\n'}
            • No processing fees{'\n'}
            • Direct bank transfer (NEFT/IMPS)
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={handleWithdraw}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Icon name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.submitBtnText}>Request Withdrawal</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  balanceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 8
  },
  balanceHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB'
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F46E5',
    marginRight: 8
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 16
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16
  },
  quickAmountBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB'
  },
  quickAmountBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  quickAmountTextActive: {
    color: '#fff'
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  required: {
    color: '#EF4444'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB'
  },
  inputIcon: {
    marginLeft: 14
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827'
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    marginLeft: 4
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981'
  },
  infoContent: {
    flex: 1
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 6
  },
  infoText: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 20
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff'
  }
});

export default WithdrawScreen;