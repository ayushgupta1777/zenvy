import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FABIcon from '../../components/common/FABIcon';
import styles from './OrdersDashboardScreen.Styles';
import useAdminOrders from '../../hooks/useAdminOrders';
import { StatCard, FilterChip, TimeframeFilter } from '../../components/screens/admin/OrdersDashboard/OrdersDashboardComponents';

const OrdersDashboardScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('all');

  const { orders, stats, isLoading, refresh } = useAdminOrders(filter, timeframe);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      processing: '#8B5CF6',
      packed: '#10B981',
      shipped: '#0EA5E9',
      delivered: '#059669',
      cancelled: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const filteredOrders = orders.filter(order =>
    order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders Management</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('ShiprocketSettings')}
        >
          <Icon name="settings-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        {/* Timeframe Filter */}
        <TimeframeFilter activeValue={timeframe} onSelect={setTimeframe} styles={styles} />

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <StatCard
              icon="receipt-outline"
              label="Total Orders"
              value={stats.totalOrders}
              color="#4F46E5"
              styles={styles}
            />
            <StatCard
              icon="cube-outline"
              label="Packed"
              value={stats.packedOrders}
              color="#10B981"
              styles={styles}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Delivered"
              value={stats.deliveredOrders}
              color="#059669"
              styles={styles}
            />
            <StatCard
              icon="cash-outline"
              label="Revenue"
              value={`₹${stats.totalRevenue}`}
              color="#059669"
              styles={styles}
            />
          </View>
        )}

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order number or customer name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          <FilterChip label="All" value="all" count={stats?.totalOrders} activeValue={filter} onSelect={setFilter} styles={styles} />
          <FilterChip label="Packed" value="packed" count={stats?.packedOrders} activeValue={filter} onSelect={setFilter} styles={styles} />
          <FilterChip label="Confirmed" value="confirmed" activeValue={filter} onSelect={setFilter} styles={styles} />
          <FilterChip label="Processing" value="processing" activeValue={filter} onSelect={setFilter} styles={styles} />
          <FilterChip label="Shipped" value="shipped" activeValue={filter} onSelect={setFilter} styles={styles} />
          <FilterChip label="Delivered" value="delivered" activeValue={filter} onSelect={setFilter} styles={styles} />
        </ScrollView>

        {/* Orders List */}
        <View style={styles.ordersContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
          ) : filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <TouchableOpacity
                key={order._id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('AdminOrderDetails', { orderId: order._id })}
              >
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNumber}>#{order.orderNo}</Text>
                    <Text style={styles.orderCustomer}>{order.user?.name}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.orderStatus) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(order.orderStatus) }
                    ]}>
                      {order.orderStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDivider} />

                <View style={styles.orderDetails}>
                  <View style={styles.orderDetailRow}>
                    <Icon name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.orderDetailText}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <Icon name="cube-outline" size={16} color="#6B7280" />
                    <Text style={styles.orderDetailText}>
                      {order.items.length} items
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <Icon name="cash-outline" size={16} color="#6B7280" />
                    <Text style={styles.orderAmount}>₹{order.total}</Text>
                  </View>
                </View>

                {order.trackingNumber && (
                  <View style={styles.trackingInfo}>
                    <Icon name="navigate-outline" size={16} color="#4F46E5" />
                    <Text style={styles.trackingText}>
                      Tracking: {order.trackingNumber}
                    </Text>
                  </View>
                )}

                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('AdminOrderDetails', { orderId: order._id })}
                  >
                    <Icon name="eye-outline" size={18} color="#4F46E5" />
                    <Text style={styles.actionBtnText}>View</Text>
                  </TouchableOpacity>

                  {!order.shiprocket?.shipmentId && ['confirmed', 'processing'].includes(order.orderStatus) && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnPrimary]}
                      onPress={() => navigation.navigate('CreateShipment', { orderId: order._id })}
                    >
                      <Icon name="airplane-outline" size={18} color="#fff" />
                      <Text style={[styles.actionBtnText, { color: '#fff' }]}>
                        Ship
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Support FAB */}
      <FABIcon iconName="chatbubbles" onPress={() => navigation.navigate('Support')} />
    </View>
  );
};

export default OrdersDashboardScreen;