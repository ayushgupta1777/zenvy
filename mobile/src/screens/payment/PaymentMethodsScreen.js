import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchProfile } from '../../redux/slices/authSlice';

const PaymentMethodsScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshProfile();
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      await dispatch(fetchProfile());
    } catch (error) {
      console.log('Failed to refresh profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const maskAccountNumber = (accNo) => {
    if (!accNo) return 'Not set';
    if (accNo.length < 4) return accNo;
    return `****${accNo.slice(-4)}`;
  };

  const paymentData = user?.paymentMethods || {};
  const resellerData = user?.resellerApplication || {};

  // If paymentMethods is empty, fallback to reseller data if available
  const displayData = {
    upiId: paymentData.upiId || 'Not provided',
    bankName: paymentData.bankName || resellerData.bankName || 'Not provided',
    accountHolderName: paymentData.accountHolderName || resellerData.accountHolderName || 'Not provided',
    accountNumber: paymentData.accountNumber || resellerData.accountNumber || '',
    ifscCode: paymentData.ifscCode || resellerData.ifscCode || 'Not provided'
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={refreshProfile} style={styles.refreshBtn}>
          <Icon name="refresh" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Saved Payout Information</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        ) : (
          <View>
            <View style={styles.paymentCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBg, { backgroundColor: '#EEF2FF' }]}>
                  <Icon name="phone-portrait-outline" size={24} color="#4F46E5" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>UPI ID</Text>
                  <Text style={styles.cardSubtitle}>Primary payout method</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.valueText}>{displayData.upiId}</Text>
              </View>
            </View>

            <View style={styles.paymentCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBg, { backgroundColor: '#ECFDF5' }]}>
                  <Icon name="business-outline" size={24} color="#10B981" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Bank Account</Text>
                  <Text style={styles.cardSubtitle}>{displayData.bankName || 'Saved Account'}</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Holder</Text>
                  <Text style={styles.detailValue}>{displayData.accountHolderName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Number</Text>
                  <Text style={styles.detailValue}>
                    {displayData.accountNumber ? maskAccountNumber(displayData.accountNumber) : 'Not provided'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>IFSC Code</Text>
                  <Text style={styles.detailValue}>{displayData.ifscCode}</Text>
                </View>
              </View>
            </View>

            <View style={styles.securityInfo}>
              <Icon name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.securityText}>
                Your payment information is stored securely and partially masked for your protection.
              </Text>
            </View>
            
            <TouchableOpacity 
                style={styles.contactSupportBtn}
                onPress={() => Alert.alert('Request Update', 'To update your banking details, please contact our support team for security reasons.')}
            >
                <Text style={styles.contactSupportText}>Request Update</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6'
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  scrollContent: {
    padding: 20
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  cardHeaderText: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2
  },
  cardContent: {
    paddingHorizontal: 4
  },
  valueText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0.5
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280'
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    gap: 12
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18
  },
  contactSupportBtn: {
      marginTop: 30,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#4F46E5',
      alignItems: 'center'
  },
  contactSupportText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#4F46E5'
  }
});

export default PaymentMethodsScreen;
