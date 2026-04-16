// ============================================
// COMPLETE ProfileScreen.js - Fully Styled & Feature-Rich
// mobile/screens/profile/ProfileScreen.js
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { logout } from '../../redux/slices/authSlice';
import AdsngrowFooter from '../../components/AdsngrowFooter';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showResellerModal, setShowResellerModal] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    orders: 0,
    wishlist: 0,
    returns: 0,
    points: 0
  });

  const [resellerForm, setResellerForm] = useState({
    businessName: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Replace with actual API calls - with error handling
      setUserStats({
        orders: 8,
        wishlist: 12,
        returns: 2,
        points: 650
      });
      setStatsLoading(false);
    } catch (error) {
      console.log('Stats error:', error);
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const menuSections = [
    {
      title: 'Shopping',
      items: [
        {
          icon: 'receipt-outline',
          title: 'My Orders',
          screen: 'OrdersList',
          color: '#0A84FF',
          description: 'Track & manage your orders'
        },
        {
          icon: 'return-up-back-outline',
          title: 'Returns & Refunds',
          screen: 'MyReturns',
          color: '#FF9500',
          description: 'Manage your returns'
        },
        {
          icon: 'heart-outline',
          title: 'My Wishlist',
          screen: 'Wishlist',
          color: '#FF3B30',
          description: 'Your saved items'
        },
        {
          icon: 'star-outline',
          title: 'My Reviews',
          screen: 'MyReviews',
          color: '#FF9500',
          description: 'Reviews you\'ve written'
        }
      ]
    },
    {
      title: 'Account Settings',
      items: [
        {
          icon: 'person-outline',
          title: 'Edit Profile',
          screen: 'EditProfile',
          color: '#5E5CE6',
          description: 'Update personal info'
        },
        {
          icon: 'location-outline',
          title: 'Manage Addresses',
          screen: 'Addresses',
          color: '#34C759',
          description: 'Delivery addresses'
        },
        {
          icon: 'card-outline',
          title: 'Payment Methods',
          screen: 'PaymentMethods',
          color: '#5E5CE6',
          description: 'Saved cards & UPI'
        },
        {
          icon: 'lock-closed-outline',
          title: 'Change Password',
          screen: 'ChangePassword',
          color: '#FF3B30',
          description: 'Update your security'
        },
        {
          icon: 'notifications-outline',
          title: 'Notifications',
          screen: 'Notifications',
          color: '#FF9500',
          description: 'Manage alerts'
        },
        {
          icon: 'chatbubbles-outline',
          title: 'Customer Support',
          screen: 'UserChat',
          color: '#4F46E5',
          description: 'Chat with our support team'
        }
      ]
    },
    {
      title: 'Legal & Policies',
      items: [
        {
          icon: 'document-text-outline',
          title: 'Terms & Conditions',
          screen: 'Terms',
          color: '#6B7280',
          description: 'Usage terms'
        },
        {
          icon: 'shield-checkmark-outline',
          title: 'Privacy Policy',
          screen: 'Privacy',
          color: '#6B7280',
          description: 'Data protection'
        },
        {
          icon: 'return-up-back-outline',
          title: 'Cancellation & Refund',
          screen: 'Cancellation',
          color: '#6B7280',
          description: 'Return policy'
        },
        {
          icon: 'cube-outline',
          title: 'Shipping & Delivery',
          screen: 'Shipping',
          color: '#6B7280',
          description: 'Delivery info'
        }
      ]
    }
  ];

  const handleResellerApply = async () => {
    if (!resellerForm.businessName || !resellerForm.accountHolderName ||
      !resellerForm.accountNumber || !resellerForm.bankName || !resellerForm.ifscCode) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      // Replace with actual API call
      // await api.post('/reseller/apply', resellerForm);
      Alert.alert('Success', 'Application submitted successfully! We\'ll review it soon.');
      setShowResellerModal(false);
      setResellerForm({
        businessName: '',
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: ''
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Background fill for pull-down bounce */}
      <View style={{ backgroundColor: '#4F46E5', height: 1000, position: 'absolute', top: -1000, left: 0, right: 0 }} />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={44} color="#fff" />
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Icon name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'guest@example.com'}</Text>

        <View style={styles.roleBadge}>
          <Icon
            name={user?.role === 'reseller' ? 'bag-check-outline' : 'person-circle-outline'}
            size={14}
            color="#fff"
          />
          <Text style={styles.roleText}>
            {user?.role === 'reseller' ? 'Reseller Account' : 'Premium Customer'}
          </Text>
        </View>
      </View>

      {/* Reseller Section */}
      {user?.role === 'reseller' || user?.isReseller ? (
        <TouchableOpacity
          style={styles.resellerDashboardCard}
          onPress={() => navigation.navigate('ResellerHubMain')}
          activeOpacity={0.7}
        >
          <View style={styles.resellerGradient}>
            <View style={styles.resellerContent}>
              <View style={styles.resellerIcon}>
                <Icon name="trending-up" size={28} color="#10B981" />
              </View>
              <View style={styles.resellerText}>
                <Text style={styles.resellerTitle}>Reseller Dashboard</Text>
                <Text style={styles.resellerSubtitle}>Track earnings & manage sales</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={24} color="#10B981" />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.becomeResellerCard}
          onPress={() => navigation.navigate('BecomeReseller')}
          activeOpacity={0.7}
        >
          <View style={styles.becomeResellerContent}>
            <Icon name="rocket" size={24} color="#fff" />
            <View style={styles.becomeResellerText}>
              <Text style={styles.becomeResellerTitle}>Start Earning Today!</Text>
              <Text style={styles.becomeResellerSubtitle}>Become a reseller & earn commission</Text>
            </View>
            <Icon name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('OrdersList')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Icon name="bag-outline" size={24} color="#0A84FF" />
          </View>
          <Text style={styles.statLabel}>Orders</Text>
          {/* {statsLoading ? (
            <ActivityIndicator size="small" color="#0A84FF" />
          ) : (
            <Text style={styles.statValue}>{userStats.orders}</Text>
          )} */}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Wishlist')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
            <Icon name="heart-outline" size={24} color="#FF3B30" />
          </View>
          <Text style={styles.statLabel}>Liked</Text>
          {/* {statsLoading ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : (
            <Text style={styles.statValue}>{userStats.wishlist}</Text>
          )} */}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('MyReturns')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="return-up-back-outline" size={24} color="#FF9500" />
          </View>
          <Text style={styles.statLabel}>Returns</Text>
          {/* {statsLoading ? (
            <ActivityIndicator size="small" color="#FF9500" />
          ) : (
            <Text style={styles.statValue}>{userStats.returns}</Text>
          )} */}
        </TouchableOpacity>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="medal-outline" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.statLabel}>Points</Text>
          {/* {statsLoading ? (
            <ActivityIndicator size="small" color="#F59E0B" />
          ) : (
            <Text style={styles.statValue}>{userStats.points}</Text>
          )} */}
        </View>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          <View style={styles.menuCard}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== section.items.length - 1 && styles.menuItemBorder
                ]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBg, { backgroundColor: `${item.color}15` }]}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>

                <Icon name="chevron-forward-outline" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* App Info */}
      <View style={styles.appInfoSection}>
        <View style={styles.appInfoCard}>
          <Icon name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.appInfoText}>App Version: 1.0.4</Text>
        </View>
        <AdsngrowFooter marginTop={10} paddingBottom={0} />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Icon name="log-out-outline" size={22} color="#FF3B30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />

      {/* Reseller Application Modal */}
      <Modal
        visible={showResellerModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reseller Application</Text>
              <TouchableOpacity onPress={() => setShowResellerModal(false)}>
                <Icon name="close-circle" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>
                Join our reseller program and start earning commission on every sale!
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Name *</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="business-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your business name"
                    value={resellerForm.businessName}
                    onChangeText={(text) => setResellerForm({ ...resellerForm, businessName: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Holder Name *</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="person-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Full name as per bank"
                    value={resellerForm.accountHolderName}
                    onChangeText={(text) => setResellerForm({ ...resellerForm, accountHolderName: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Name *</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="business-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter bank name"
                    value={resellerForm.bankName}
                    onChangeText={(text) => setResellerForm({ ...resellerForm, bankName: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number *</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="card-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter account number"
                    value={resellerForm.accountNumber}
                    onChangeText={(text) => setResellerForm({ ...resellerForm, accountNumber: text })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>IFSC Code *</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="code-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter IFSC code"
                    value={resellerForm.ifscCode}
                    onChangeText={(text) => setResellerForm({ ...resellerForm, ifscCode: text.toUpperCase() })}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleResellerApply}
              >
                <Text style={styles.submitText}>Submit Application</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff'
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff'
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff'
  },
  resellerDashboardCard: {
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  resellerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ECFDF5'
  },
  resellerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  resellerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  resellerText: {
    flex: 1
  },
  resellerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4
  },
  resellerSubtitle: {
    fontSize: 13,
    color: '#059669'
  },
  becomeResellerCard: {
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
    backgroundColor: '#10B981',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  becomeResellerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12
  },
  becomeResellerText: {
    flex: 1
  },
  becomeResellerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4
  },
  becomeResellerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)'
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20
  },
  statCard: {
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827'
  },
  menuSection: {
    marginBottom: 20,
    paddingHorizontal: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuTextContainer: {
    flex: 1
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2
  },
  menuDescription: {
    fontSize: 12,
    color: '#6B7280'
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16
  },
  appInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  appInfoText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500'
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30'
  },
  bottomSpacer: {
    height: 20
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827'
  },
  modalContent: {
    padding: 20
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: 20
  },
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
    borderRadius: 10,
    paddingHorizontal: 12
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827'
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
});

export default ProfileScreen;