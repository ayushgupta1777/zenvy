// ============================================
// mobile/src/screens/orders/OrdersScreen.js
// ============================================
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../redux/slices/orderSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../../styling/screens/orders/OrdersScreenPremiumStyles';
import CustomHeader from '../../components/CustomHeader';

const OrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items: orders, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      packed: '#8B5CF6',
      shipped: '#6366F1',
      delivered: '#10B981',
      cancelled: '#EF4444'
    };
    return colors[status] || '#9CA3AF';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'time-outline',
      confirmed: 'checkmark-circle-outline',
      packed: 'cube-outline',
      shipped: 'airplane-outline',
      delivered: 'checkmark-done-outline',
      cancelled: 'close-circle-outline'
    };
    return icons[status] || 'help-outline';
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles['orders-premium-order-card']}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
      activeOpacity={0.8}
    >
      <View style={styles['orders-premium-order-header']}>
        <View style={styles['orders-premium-order-header-left']}>
          <Text style={styles['orders-premium-order-number']}>Order #{item.orderNo}</Text>
          <Text style={styles['orders-premium-order-date']}>
            {new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </Text>
        </View>
        <View style={[
          styles['orders-premium-order-status'],
          { backgroundColor: getStatusColor(item.orderStatus) }
        ]}>
          <Icon name={getStatusIcon(item.orderStatus)} size={14} color="#fff" />
          <Text style={styles['orders-premium-status-text']}>
            {item.orderStatus.charAt(0).toUpperCase() + item.orderStatus.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles['orders-premium-order-divider']} />

      <View style={styles['orders-premium-order-items']}>
        <View style={styles['orders-premium-items-info']}>
          <Icon name="cube-outline" size={18} color="#4A4A4A" />
          <Text style={styles['orders-premium-order-items-text']}>
            {item.items.length} item{item.items.length > 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={styles['orders-premium-order-amount']}>₹{item.total}</Text>
      </View>

      <View style={styles['orders-premium-order-footer']}>
        <View style={styles['orders-premium-payment-badge']}>
          <Icon
            name={item.paymentMethod === 'online' ? 'card-outline' : 'cash-outline'}
            size={14}
            color="#5E5CE6"
          />
          <Text style={styles['orders-premium-payment-method']}>
            {item.paymentMethod.toUpperCase()}
          </Text>
        </View>
        <View style={styles['orders-premium-view-details-btn']}>
          <Text style={styles['orders-premium-view-details-text']}>View Details</Text>
          <Icon name="chevron-forward-outline" size={16} color="#0A84FF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (orders.length === 0 && !isLoading) {
    return (
      <View style={styles['orders-premium-empty-container']}>
        <View style={styles['orders-premium-empty-icon-wrapper']}>
          <Icon name="receipt-outline" size={64} color="#0A84FF" />
        </View>
        <Text style={styles['orders-premium-empty-title']}>No orders yet</Text>
        <Text style={styles['orders-premium-empty-subtitle']}>
          Your orders will appear here
        </Text>
        <TouchableOpacity
          style={styles['orders-premium-btn-primary']}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles['orders-premium-btn-text-primary']}>Start Shopping</Text>
          <Icon name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles['orders-premium-container']}>
      <CustomHeader title="My Orders" showBack={true} />
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles['orders-premium-list-content']}
        ListHeaderComponent={
          <View style={{ backgroundColor: '#F8F9FA', height: 1000, position: 'absolute', top: -1000, left: 0, right: 0 }} />
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => dispatch(fetchOrders())}
            tintColor="#0A84FF"
            colors={['#0A84FF']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default OrdersScreen;