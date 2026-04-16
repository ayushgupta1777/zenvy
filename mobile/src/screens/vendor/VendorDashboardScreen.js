// ============================================
// mobile/src/screens/vendor/VendorDashboardScreen.js
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../../styling/screens/vendor/VendorDashboardPremiumStyles';

const VendorDashboardScreen = ({ navigation }) => {
  const stats = {
    totalProducts: 25,
    totalOrders: 128,
    pendingOrders: 5,
    totalRevenue: 45000
  };

  return (
    <ScrollView 
      style={styles['vendor-premium-container']}
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Header */}
      <View style={styles['vendor-premium-header']}>
        <View style={styles['vendor-premium-header-content']}>
          <View>
            <Text style={styles['vendor-premium-greeting']}>Good morning!</Text>
            <Text style={styles['vendor-premium-title']}>Vendor Dashboard</Text>
          </View>
          <TouchableOpacity style={styles['vendor-premium-notification-btn']}>
            <Icon name="notifications-outline" size={24} color="#1A1A1A" />
            <View style={styles['vendor-premium-notification-badge']} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Premium Stats Grid */}
      <View style={styles['vendor-premium-stats-section']}>
        <View style={styles['vendor-premium-stats-grid']}>
          {/* Products Card */}
          <View style={[styles['vendor-premium-stat-card'], { backgroundColor: '#E3F2FD' }]}>
            <View style={styles['vendor-premium-stat-icon-container']}>
              <Icon name="cube" size={28} color="#0A84FF" />
            </View>
            <Text style={styles['vendor-premium-stat-value']}>{stats.totalProducts}</Text>
            <Text style={styles['vendor-premium-stat-label']}>Products</Text>
          </View>

          {/* Orders Card */}
          <View style={[styles['vendor-premium-stat-card'], { backgroundColor: '#E8F5E9' }]}>
            <View style={styles['vendor-premium-stat-icon-container']}>
              <Icon name="receipt" size={28} color="#34C759" />
            </View>
            <Text style={styles['vendor-premium-stat-value']}>{stats.totalOrders}</Text>
            <Text style={styles['vendor-premium-stat-label']}>Total Orders</Text>
          </View>

          {/* Pending Card */}
          <View style={[styles['vendor-premium-stat-card'], { backgroundColor: '#FFF3E0' }]}>
            <View style={styles['vendor-premium-stat-icon-container']}>
              <Icon name="time" size={28} color="#FF9500" />
            </View>
            <Text style={styles['vendor-premium-stat-value']}>{stats.pendingOrders}</Text>
            <Text style={styles['vendor-premium-stat-label']}>Pending</Text>
          </View>

          {/* Revenue Card */}
          <View style={[styles['vendor-premium-stat-card'], { backgroundColor: '#F3E5F5' }]}>
            <View style={styles['vendor-premium-stat-icon-container']}>
              <Icon name="cash" size={28} color="#5E5CE6" />
            </View>
            <Text style={styles['vendor-premium-stat-value']}>₹{(stats.totalRevenue / 1000).toFixed(0)}k</Text>
            <Text style={styles['vendor-premium-stat-label']}>Revenue</Text>
          </View>
        </View>
      </View>

      {/* Add Product - Featured CTA */}
      <View style={styles['vendor-premium-cta-section']}>
        <TouchableOpacity
          style={styles['vendor-premium-add-product-card']}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <View style={styles['vendor-premium-add-product-content']}>
            <View style={styles['vendor-premium-add-product-icon']}>
              <Icon name="add-circle" size={48} color="#fff" />
            </View>
            <View style={styles['vendor-premium-add-product-text']}>
              <Text style={styles['vendor-premium-add-product-title']}>Add New Product</Text>
              <Text style={styles['vendor-premium-add-product-subtitle']}>
                List your products and start selling
              </Text>
            </View>
          </View>
          <Icon name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles['vendor-premium-actions-section']}>
        <Text style={styles['vendor-premium-section-title']}>Quick Actions</Text>
        
        <View style={styles['vendor-premium-actions-grid']}>
          {/* My Products */}
          <TouchableOpacity style={styles['vendor-premium-action-card']}>
            <View style={[styles['vendor-premium-action-icon'], { backgroundColor: '#E3F2FD' }]}>
              <Icon name="cube-outline" size={28} color="#0A84FF" />
            </View>
            <Text style={styles['vendor-premium-action-title']}>My Products</Text>
            <Text style={styles['vendor-premium-action-subtitle']}>Manage inventory</Text>
            <View style={styles['vendor-premium-action-arrow']}>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {/* Orders */}
          <TouchableOpacity style={styles['vendor-premium-action-card']}>
            <View style={[styles['vendor-premium-action-icon'], { backgroundColor: '#E8F5E9' }]}>
              <Icon name="receipt-outline" size={28} color="#34C759" />
            </View>
            <Text style={styles['vendor-premium-action-title']}>Orders</Text>
            <Text style={styles['vendor-premium-action-subtitle']}>Manage orders</Text>
            <View style={styles['vendor-premium-action-arrow']}>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {/* Analytics */}
          <TouchableOpacity style={styles['vendor-premium-action-card']}>
            <View style={[styles['vendor-premium-action-icon'], { backgroundColor: '#F3E5F5' }]}>
              <Icon name="bar-chart-outline" size={28} color="#5E5CE6" />
            </View>
            <Text style={styles['vendor-premium-action-title']}>Analytics</Text>
            <Text style={styles['vendor-premium-action-subtitle']}>View insights</Text>
            <View style={styles['vendor-premium-action-arrow']}>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity style={styles['vendor-premium-action-card']}>
            <View style={[styles['vendor-premium-action-icon'], { backgroundColor: '#FFF3E0' }]}>
              <Icon name="settings-outline" size={28} color="#FF9500" />
            </View>
            <Text style={styles['vendor-premium-action-title']}>Settings</Text>
            <Text style={styles['vendor-premium-action-subtitle']}>Store config</Text>
            <View style={styles['vendor-premium-action-arrow']}>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default VendorDashboardScreen;