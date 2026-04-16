
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { getTransactions } from '../../redux/slices/resellerSlice';

const TransactionHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { transactions } = useSelector((state) => state.reseller);
  const [filterType, setFilterType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const fetchTransactions = (page = 1) => {
    dispatch(getTransactions({ page, limit: 20, type: filterType }));
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions(1);
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

  const getTransactionIcon = (transaction) => {
    switch (transaction.source) {
      case 'resell_earning':
        return { name: 'trending-up', color: '#10B981', bg: '#F0FDF4' };
      case 'withdrawal':
        return { name: 'arrow-down-circle', color: '#EF4444', bg: '#FEF2F2' };
      case 'refund':
        return { name: 'arrow-undo', color: '#F59E0B', bg: '#FEF3C7' };
      case 'admin_adjustment':
        return { name: 'construct', color: '#8B5CF6', bg: '#F3E8FF' };
      default:
        return { name: 'cash', color: '#6B7280', bg: '#F9FAFB' };
    }
  };

  const getTransactionTitle = (transaction) => {
    switch (transaction.source) {
      case 'resell_earning':
        return 'Commission Earned';
      case 'withdrawal':
        return 'Withdrawal';
      case 'refund':
        return 'Refund';
      case 'admin_adjustment':
        return 'Admin Adjustment';
      default:
        return transaction.description || 'Transaction';
    }
  };

  const renderTransaction = ({ item }) => {
    const iconData = getTransactionIcon(item);
    const isCredit = item.type === 'credit';

    return (
      <TouchableOpacity style={styles.transactionCard}>
        <View style={[styles.transactionIcon, { backgroundColor: iconData.bg }]}>
          <Icon name={iconData.name} size={24} color={iconData.color} />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {getTransactionTitle(item)}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.createdAt)}
          </Text>
          {item.description && (
            <Text style={styles.transactionDesc} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          {item.status === 'pending' && (
            <View style={styles.pendingBadge}>
              <Icon name="time-outline" size={12} color="#F59E0B" />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText,
            isCredit ? styles.amountCredit : styles.amountDebit
          ]}>
            {isCredit ? '+' : '-'}₹{item.amount}
          </Text>
          <Text style={styles.balanceText}>
            Bal: ₹{item.balanceAfter}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilter = (type, label) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filterType === type && styles.filterChipActive
      ]}
      onPress={() => setFilterType(type)}
    >
      <Text style={[
        styles.filterChipText,
        filterType === type && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Filters */}
      <View style={styles.filterContainer}>
        {renderFilter('all', 'All')}
        {renderFilter('commission', 'Commission')}
        {renderFilter('withdrawal', 'Withdrawals')}
        {renderFilter('refund', 'Refunds')}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="receipt-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>No transactions yet</Text>
      <Text style={styles.emptySubtext}>
        Your transaction history will appear here
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
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={transactions.data}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!transactions.isLoading && renderEmpty()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (transactions.pagination && transactions.pagination.page < transactions.pagination.pages) {
            fetchTransactions(transactions.pagination.page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />

      {transactions.isLoading && (
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
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
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  transactionDetails: {
    flex: 1
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  transactionDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B'
  },
  transactionAmount: {
    alignItems: 'flex-end'
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  amountCredit: {
    color: '#10B981'
  },
  amountDebit: {
    color: '#EF4444'
  },
  balanceText: {
    fontSize: 11,
    color: '#9CA3AF'
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

export default TransactionHistoryScreen;