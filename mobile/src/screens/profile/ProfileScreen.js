import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Modal, TextInput, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AdsngrowFooter from '../../components/AdsngrowFooter';
import styles from './ProfileScreen.Styles';
import useProfile from '../../hooks/useProfile';

const ProfileScreen = ({ navigation }) => {
  const {
    user, userStats, showResellerModal, setShowResellerModal,
    resellerForm, setResellerForm, handleLogout, handleResellerApply
  } = useProfile(navigation);

  const menuSections = [
    {
      title: 'Shopping',
      items: [
        { icon: 'receipt-outline', title: 'My Orders', screen: 'OrdersList', color: '#0A84FF', description: 'Track & manage your orders' },
        { icon: 'return-up-back-outline', title: 'Returns & Refunds', screen: 'MyReturns', color: '#FF9500', description: 'Manage your returns' },
        { icon: 'heart-outline', title: 'My Wishlist', screen: 'Wishlist', color: '#FF3B30', description: 'Your saved items' },
        { icon: 'star-outline', title: 'My Reviews', screen: 'MyReviews', color: '#FF9500', description: 'Reviews you\'ve written' }
      ]
    },
    {
      title: 'Account Settings',
      items: [
        { icon: 'person-outline', title: 'Edit Profile', screen: 'EditProfile', color: '#5E5CE6', description: 'Update personal info' },
        { icon: 'location-outline', title: 'Manage Addresses', screen: 'Addresses', color: '#34C759', description: 'Delivery addresses' },
        { icon: 'card-outline', title: 'Payment Methods', screen: 'PaymentMethods', color: '#5E5CE6', description: 'Saved cards & UPI' },
        { icon: 'lock-closed-outline', title: 'Change Password', screen: 'ChangePassword', color: '#FF3B30', description: 'Update your security' },
        { icon: 'notifications-outline', title: 'Notifications', screen: 'Notifications', color: '#FF9500', description: 'Manage alerts' },
        { icon: 'chatbubbles-outline', title: 'Customer Support', screen: 'UserChat', color: '#4F46E5', description: 'Chat with our support team' }
      ]
    },
    {
      title: 'Legal & Policies',
      items: [
        { icon: 'document-text-outline', title: 'Terms & Conditions', screen: 'Terms', color: '#6B7280', description: 'Usage terms' },
        { icon: 'shield-checkmark-outline', title: 'Privacy Policy', screen: 'Privacy', color: '#6B7280', description: 'Data protection' },
        { icon: 'return-up-back-outline', title: 'Cancellation & Refund', screen: 'Cancellation', color: '#6B7280', description: 'Return policy' },
        { icon: 'cube-outline', title: 'Shipping & Delivery', screen: 'Shipping', color: '#6B7280', description: 'Delivery info' }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={true}>
      <View style={styles.headerBackground} />

      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.profileImage ? <Image source={{ uri: user.profileImage }} style={styles.avatarImage} /> : <View style={styles.avatarPlaceholder}><Icon name="person" size={44} color="#fff" /></View>}
          <TouchableOpacity style={styles.editAvatarBtn}><Icon name="camera" size={16} color="#fff" /></TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'guest@example.com'}</Text>
        <View style={styles.roleBadge}><Icon name={user?.role === 'reseller' ? 'bag-check-outline' : 'person-circle-outline'} size={14} color="#fff" /><Text style={styles.roleText}>{user?.role === 'reseller' ? 'Reseller Account' : 'Premium Customer'}</Text></View>
      </View>

      {user?.role === 'reseller' || user?.isReseller ? (
        <TouchableOpacity style={styles.resellerDashboardCard} onPress={() => navigation.navigate('ResellerHubMain')} activeOpacity={0.7}>
          <View style={styles.resellerGradient}>
            <View style={styles.resellerContent}><View style={styles.resellerIcon}><Icon name="trending-up" size={28} color="#10B981" /></View><View style={styles.resellerText}><Text style={styles.resellerTitle}>Reseller Dashboard</Text><Text style={styles.resellerSubtitle}>Track earnings & manage sales</Text></View></View>
            <Icon name="chevron-forward" size={24} color="#10B981" />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.becomeResellerCard} onPress={() => navigation.navigate('BecomeReseller')} activeOpacity={0.7}>
          <View style={styles.becomeResellerContent}><Icon name="rocket" size={24} color="#fff" /><View style={styles.becomeResellerText}><Text style={styles.becomeResellerTitle}>Start Earning Today!</Text><Text style={styles.becomeResellerSubtitle}>Become a reseller & earn commission</Text></View><Icon name="arrow-forward" size={20} color="#fff" /></View>
        </TouchableOpacity>
      )}

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('OrdersList')} activeOpacity={0.7}><View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}><Icon name="bag-outline" size={24} color="#0A84FF" /></View><Text style={styles.statLabel}>Orders</Text><Text style={styles.statValue}>{userStats.orders}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Wishlist')} activeOpacity={0.7}><View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}><Icon name="heart-outline" size={24} color="#FF3B30" /></View><Text style={styles.statLabel}>Liked</Text><Text style={styles.statValue}>{userStats.wishlist}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyReturns')} activeOpacity={0.7}><View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}><Icon name="return-up-back-outline" size={24} color="#FF9500" /></View><Text style={styles.statLabel}>Returns</Text><Text style={styles.statValue}>{userStats.returns}</Text></TouchableOpacity>
        <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}><Icon name="medal-outline" size={24} color="#F59E0B" /></View><Text style={styles.statLabel}>Points</Text><Text style={styles.statValue}>{userStats.points}</Text></View>
      </View>

      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, index) => (
              <TouchableOpacity key={index} style={[styles.menuItem, index !== section.items.length - 1 && styles.menuItemBorder]} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
                <View style={[styles.menuIconBg, { backgroundColor: `${item.color}15` }]}><Icon name={item.icon} size={22} color={item.color} /></View>
                <View style={styles.menuTextContainer}><Text style={styles.menuTitle}>{item.title}</Text><Text style={styles.menuDescription}>{item.description}</Text></View>
                <Icon name="chevron-forward-outline" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.appInfoSection}>
        <View style={styles.appInfoCard}><Icon name="information-circle-outline" size={20} color="#6B7280" /><Text style={styles.appInfoText}>App Version: 1.0.4</Text></View>
        <AdsngrowFooter marginTop={10} paddingBottom={0} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}><Icon name="log-out-outline" size={22} color="#FF3B30" /><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>
      <View style={styles.bottomSpacer} />

      <Modal visible={showResellerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Reseller Application</Text><TouchableOpacity onPress={() => setShowResellerModal(false)}><Icon name="close-circle" size={28} color="#6B7280" /></TouchableOpacity></View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>Join our reseller program and start earning commission on every sale!</Text>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Business Name *</Text><View style={styles.inputWrapper}><Icon name="business-outline" size={20} color="#6B7280" /><TextInput style={styles.textInput} placeholder="Enter your business name" value={resellerForm.businessName} onChangeText={(text) => setResellerForm({ ...resellerForm, businessName: text })} /></View></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Account Holder Name *</Text><View style={styles.inputWrapper}><Icon name="person-outline" size={20} color="#6B7280" /><TextInput style={styles.textInput} placeholder="Full name as per bank" value={resellerForm.accountHolderName} onChangeText={(text) => setResellerForm({ ...resellerForm, accountHolderName: text })} /></View></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Bank Name *</Text><View style={styles.inputWrapper}><Icon name="business-outline" size={20} color="#6B7280" /><TextInput style={styles.textInput} placeholder="Enter bank name" value={resellerForm.bankName} onChangeText={(text) => setResellerForm({ ...resellerForm, bankName: text })} /></View></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Account Number *</Text><View style={styles.inputWrapper}><Icon name="card-outline" size={20} color="#6B7280" /><TextInput style={styles.textInput} placeholder="Enter account number" value={resellerForm.accountNumber} onChangeText={(text) => setResellerForm({ ...resellerForm, accountNumber: text })} keyboardType="number-pad" /></View></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>IFSC Code *</Text><View style={styles.inputWrapper}><Icon name="code-outline" size={20} color="#6B7280" /><TextInput style={styles.textInput} placeholder="Enter IFSC code" value={resellerForm.ifscCode} onChangeText={(text) => setResellerForm({ ...resellerForm, ifscCode: text.toUpperCase() })} autoCapitalize="characters" /></View></View>
              <TouchableOpacity style={styles.submitBtn} onPress={handleResellerApply}><Text style={styles.submitText}>Submit Application</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ProfileScreen;