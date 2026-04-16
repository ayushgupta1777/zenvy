import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { logout } from '../../redux/slices/authSlice';

const AdminProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  // Safe access to auth state
  const auth = useSelector((state) => state.auth) || {};
  const user = auth.user;

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
      title: 'Management',
      items: [
        {
          icon: 'cube-outline',
          label: 'Products',
          screen: 'ProductManagement', // Changed to match navigator
          color: '#4F46E5'
        },
        {
          icon: 'folder-outline',
          label: 'Categories',
          screen: 'CategoryManagement',
          color: '#8B5CF6'
        },
        {
          icon: 'images-outline',
          label: 'Banners',
          screen: 'BannerManagement',
          color: '#EC4899'
        },
        {
          icon: 'receipt-outline',
          label: 'Orders',
          screen: 'OrdersDashboard',
          color: '#10B981'
        },
        {
          icon: 'cash-outline',
          label: 'Withdrawals',
          screen: 'AdminWithdrawals',
          color: '#F97316'
        },
        {
          icon: 'people-outline',
          label: 'Reseller Apps',
          screen: 'AdminResellerApplications',
          color: '#8B5CF6'
        }
      ]
    },
    {
      title: 'Settings',
      items: [
        {
          icon: 'settings-outline',
          label: 'General Settings',
          screen: 'GeneralSettings',
          color: '#6B7280'
        },
        {
          icon: 'rocket-outline',
          label: 'Shiprocket Settings',
          screen: 'ShiprocketSettings',
          color: '#06B6D4'
        },
        {
          icon: 'ticket-outline',
          label: 'Coupon Management',
          screen: 'CouponManagement',
          color: '#8B5CF6'
        },
        {
          icon: 'notifications-outline',
          label: 'Announcements',
          screen: 'Announcements',
          color: '#F59E0B',
          badge: 'Coming Soon'
        },
        {
          icon: 'cloud-upload-outline',
          label: 'Release Management',
          screen: 'ReleaseManagement',
          color: '#4F46E5',
        },
        {
          icon: 'chatbubbles-outline',
          label: 'Customer Support',
          screen: 'Support',
          color: '#4F46E5'
        }
      ]
    }
  ];

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="shield-checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.userName}>{user.name || 'Admin User'}</Text>
        <Text style={styles.userEmail}>{user.email || 'N/A'}</Text>
        <View style={styles.roleBadge}>
          <Icon name="star" size={12} color="#fff" />
          <Text style={styles.roleText}>Administrator</Text>
        </View>
      </View>


      <ScrollView style={styles.content}>
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.menuItem}
                onPress={() => {
                  if (item.badge === 'Coming Soon') {
                    Alert.alert('Coming Soon', 'This feature will be available soon!');
                  } else {
                    navigation.navigate(item.screen);
                  }
                }}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Icon name="chevron-forward" size={20} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Icon name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Admin Panel v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center'
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff'
  },
  content: {
    flex: 1
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827'
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EF4444'
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444'
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF'
  }
});

export default AdminProfileScreen;