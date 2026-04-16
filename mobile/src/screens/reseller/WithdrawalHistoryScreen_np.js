import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { getWithdrawals } from '../../redux/slices/resellerSlice';

const WithdrawalHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { withdrawals } = useSelector((state) => state.reseller);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [filterStatus]);

  const fetchWithdrawals = (page = 1) => {
    dispatch(getWithdrawals({ page, limit: 20, status: filterStatus }));
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchWithdrawals(1);
    setIsRefreshing(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: 'checkmark-circle',
          color: '#10B981',
          bg: '#F0FDF4',
          label: 'Completed'
        };
      case 'processing':
        return {
          icon: 'hourglass',
          color: '#3B82F6',
          bg: '#EFF6FF',
          label: 'Processing'
        };
      case 'pending':
        return {
          icon: 'time',
          color: '#F59E0B',
          bg: '#FEF3C7',
          label: 'Pending'
        };
      case 'rejected':
        return {
          icon: 'close-circle',
          color: '#EF4444',
          bg: '#FEF2F2',
          label: 'Rejected'
        };
      default:
        return {
          icon: 'ellipse',
          color: '#6B7280',
          bg: '#F9FAFB',
          label: status
        };
    }
  };

  const renderWithdrawal = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <View style={styles.withdrawalCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={styles.requestId}>
              Request #{item._id.slice(-8).toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Icon name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Withdrawal Amount</Text>
          <Text style={styles.amountValue}>₹{item.amount}</Text>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Requested:</Text>
            <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
          </View>

          {item.status === 'completed' && item.processedAt && (
            <View style={styles.detailRow}>
              <Icon name="checkmark-circle-outline" size={16} color="#10B981" />
              <Text style={styles.detailLabel}>Completed:</Text>
              <Text style={styles.detailValue}>{formatDate(item.processedAt)}</Text>
            </View>
          )}

          {item.transactionId && (
            <View style={styles.detailRow}>
              <Icon name="document-text-outline" size={16} color="#6B7280" />
              <Text style={styles.detailLabel}>UTR:</Text>
              <Text style={[styles.detailValue, { fontWeight: '600' }]}>
                {item.transactionId}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bankDetails}>
          <Text style={styles.bankDetailsTitle}>Bank Account</Text>
          <View style={styles.bankDetailRow}>
            <Icon name="person-outline" size={14} color="#9CA3AF" />
            <Text style={styles.bankDetailText}>
              {item.bankDetails?.accountHolderName}
            </Text>
          </View>
          <View style={styles.bankDetailRow}>
            <Icon name="card-outline" size={14} color="#9CA3AF" />
            <Text style={styles.bankDetailText}>
              {item.bankDetails?.accountNumber && 
                `****${item.bankDetails.accountNumber.slice(-4)}`}
            </Text>
          </View>
          <View style={styles.bankDetailRow}>
            <Icon name="business-outline" size={14} color="#9CA3AF" />
            <Text style={styles.bankDetailText}>
              {item.bankDetails?.bankName} - {item.bankDetails?.ifscCode}
            </Text>
          </View>
        </View>

        {item.status === 'rejected' && item.rejectionReason && (
          <View style={styles.rejectionBox}>
            <Icon name="information-circle" size={18} color="#EF4444" />
            <View style={{ flex: 1 }}>
              <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
              <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderFilter = (status, label, count) => (
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
      {count !== undefined && count > 0 && (
        <View style={[
          styles.countBadge,
          filterStatus === status && styles.countBadgeActive
        ]}>
          <Text style={[
            styles.countText,
            filterStatus === status && styles.countTextActive
          ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getCounts = () => {
    const all = withdrawals.pagination?.total || 0;
    const pending = withdrawals.data.filter(w => w.status === 'pending').length;
    const completed = withdrawals.data.filter(w => w.status === 'completed').length;
    const rejected = withdrawals.data.filter(w => w.status === 'rejected').length;
    return { all, pending, completed, rejected };
  };

  const counts = getCounts();

  const renderHeader = () => (
    <View>
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {renderFilter('all', 'All', counts.all)}
          {renderFilter('pending', 'Pending', counts.pending)}
          {renderFilter('completed', 'Completed', counts.completed)}
          {renderFilter('rejected', 'Rejected', counts.rejected)}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="wallet-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>No withdrawal requests</Text>
      <Text style={styles.emptySubtext}>
        Your withdrawal history will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal History</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={withdrawals.data}
        renderItem={renderWithdrawal}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!withdrawals.isLoading && renderEmpty()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (withdrawals.pagination && withdrawals.pagination.page < withdrawals.pagination.pages) {
            fetchWithdrawals(withdrawals.pagination.page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />

      {withdrawals.isLoading && (
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
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
  countBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center'
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280'
  },
  countTextActive: {
    color: '#fff'
  },
  withdrawalCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  requestId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 16
  },
  amountLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827'
  },
  detailsSection: {
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1
  },
  detailValue: {
    fontSize: 13,
    color: '#111827'
  },
  bankDetails: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5'
  },
  bankDetailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 8
  },
  bankDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  bankDetailText: {
    fontSize: 12,
    color: '#6B7280'
  },
  rejectionBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    marginTop: 12
  },
  rejectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4
  },
  rejectionText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center'
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

export default WithdrawalHistoryScreen;