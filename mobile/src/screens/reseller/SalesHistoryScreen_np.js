import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { getSales } from '../../redux/slices/resellerSlice';

const SalesHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { sales } = useSelector((state) => state.reseller);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSales();
  }, [filterStatus]);

  const fetchSales = (page = 1) => {
    dispatch(getSales({ page, limit: 20, status: filterStatus }));
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchSales(1);
    setIsRefreshing(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: '#F0FDF4', text: '#10B981', icon: 'checkmark-circle' };
      case 'shipped':
        return { bg: '#EEF2FF', text: '#4F46E5', icon: 'airplane' };
      case 'processing':
        return { bg: '#FEF3C7', text: '#F59E0B', icon: 'time' };
      case 'confirmed':
        return { bg: '#E0F2FE', text: '#0EA5E9', icon: 'checkmark-done' };
      case 'cancelled':
        return { bg: '#FEF2F2', text: '#EF4444', icon: 'close-circle' };
      case 'returned':
        return { bg: '#FEF2F2', text: '#DC2626', icon: 'return-down-back' };
      default:
        return { bg: '#F9FAFB', text: '#6B7280', icon: 'ellipse' };
    }
  };

  const renderSale = ({ item }) => {
    const statusColor = getStatusColor(item.orderStatus);
    const commission = item.resellerCommission || item.totalResellerEarning || 0;
    const isEarned = item.orderStatus === 'delivered';

    return (
      <TouchableOpacity
        style={styles.saleCard}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
      >
        {/* Product Image */}
        {item.items && item.items[0]?.product?.images && (
          <Image
            source={{ uri: item.items[0].product.images[0] }}
            style={styles.productImage}
          />
        )}

        <View style={styles.saleContent}>
          {/* Order Number */}
          <Text style={styles.orderNumber}>Order #{item.orderNo || item._id.slice(-8)}</Text>

          {/* Product Name */}
          {item.items && item.items[0]?.product?.title && (
            <Text style={styles.productName} numberOfLines={1}>
              {item.items[0].product.title}
            </Text>
          )}

          {/* Customer Info */}
          {item.user && (
            <Text style={styles.customerInfo}>
              <Icon name="person-outline" size={12} color="#6B7280" />
              {' '}{item.user.name}
            </Text>
          )}

          {/* Date */}
          <Text style={styles.orderDate}>
            <Icon name="calendar-outline" size={12} color="#9CA3AF" />
            {' '}{formatDate(item.createdAt)}
          </Text>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Icon name={statusColor.icon} size={14} color={statusColor.text} />
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.orderStatus}
            </Text>
          </View>
        </View>

        {/* Commission */}
        <View style={styles.commissionSection}>
          <Text style={styles.commissionLabel}>Commission</Text>
          <Text style={[
            styles.commissionAmount,
            isEarned ? styles.commissionEarned : styles.commissionPending
          ]}>
            ₹{commission}
          </Text>
          {!isEarned && (
            <Text style={styles.commissionStatus}>
              {item.orderStatus === 'cancelled' || item.orderStatus === 'returned' ? 'Lost' : 'Pending'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilter = (status, label) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filterStatus === status && styles.filterChipActive
      ]}
      onPress={() => setFilterStatus(status)}
    >
      <Text style={[
        styles.filterChipText,
        filterStatus === status && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Sales</Text>
          <Text style={styles.summaryValue}>
            {sales.pagination?.total || 0}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Earned</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>
            ₹{sales.data.reduce((sum, sale) => 
              sum + (sale.orderStatus === 'delivered' ? (sale.resellerCommission || 0) : 0), 0
            )}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Status:</Text>
        <View style={styles.filterRow}>
          {renderFilter('all', 'All')}
          {renderFilter('delivered', 'Delivered')}
          {renderFilter('processing', 'Processing')}
          {renderFilter('cancelled', 'Cancelled')}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="bag-handle-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>No sales yet</Text>
      <Text style={styles.emptySubtext}>
        Start sharing products to make your first sale!
      </Text>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Icon name="share-social" size={20} color="#fff" />
        <Text style={styles.shareButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Sales</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={sales.data}
        renderItem={renderSale}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!sales.isLoading && renderEmpty()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (sales.pagination && sales.pagination.page < sales.pagination.pages) {
            fetchSales(sales.pagination.page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />

      {sales.isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
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
  listContent: {
    flexGrow: 1,
    paddingBottom: 20
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#fff'
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827'
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB'
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280'
  },
  filterChipTextActive: {
    color: '#fff'
  },
  saleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12
  },
  saleContent: {
    flex: 1
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  productName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4
  },
  customerInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  commissionSection: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  commissionLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4
  },
  commissionAmount: {
    fontSize: 18,
    fontWeight: '700'
  },
  commissionEarned: {
    color: '#10B981'
  },
  commissionPending: {
    color: '#F59E0B'
  },
  commissionStatus: {
    fontSize: 10,
    color: '#F59E0B',
    marginTop: 2
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  }
});

export default SalesHistoryScreen;