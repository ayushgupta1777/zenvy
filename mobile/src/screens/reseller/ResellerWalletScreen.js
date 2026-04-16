import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const ResellerWalletScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch wallet balance and stats
      const walletResponse = await api.get('/reseller/wallet');
      setWallet(walletResponse.data.data);

      // Fetch recent transactions
      const transactionsResponse = await api.get('/reseller/transactions');
      setTransactions(transactionsResponse.data.data.transactions || []);
      
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchWalletData();
    setIsRefreshing(false);
  };

  // Check if user is approved reseller
  if (!user?.resellerApplication?.status || user.resellerApplication.status !== 'approved') {
    return (
      <View style={styles.notApprovedContainer}>
        <Icon name="lock-closed-outline" size={64} color="#9CA3AF" />
        <Text style={styles.notApprovedTitle}>Not a Reseller Yet</Text>
        <Text style={styles.notApprovedText}>
          Apply to become a reseller and start earning money
        </Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.navigate('BecomeReseller')}
        >
          <Text style={styles.applyButtonText}>Become a Reseller</Text>
          <Icon name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'commission':
        return { name: 'trending-up', color: '#10B981' };
      case 'withdrawal':
        return { name: 'arrow-down-circle', color: '#EF4444' };
      case 'refund':
        return { name: 'arrow-undo', color: '#F59E0B' };
      default:
        return { name: 'cash', color: '#6B7280' };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity onPress={() => navigation.navigate('WithdrawHistory')}>
          <Icon name="time-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₹{wallet?.availableBalance || 0}</Text>
          </View>
          <Icon name="wallet-outline" size={48} color="#fff" />
        </View>

        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => navigation.navigate('Withdraw', { availableBalance: wallet?.availableBalance })}
          disabled={!wallet?.availableBalance || wallet.availableBalance < 100}
        >
          <Icon name="arrow-down-circle" size={20} color="#fff" />
          <Text style={styles.withdrawButtonText}>Withdraw Money</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Icon name="time-outline" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>₹{wallet?.pendingBalance || 0}</Text>
          <Text style={styles.statHint}>
            Locked for {wallet?.lockPeriodDays || 7} days
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Icon name="trending-up-outline" size={24} color="#10B981" />
          </View>
          <Text style={styles.statLabel}>Total Earned</Text>
          <Text style={styles.statValue}>₹{wallet?.totalEarned || 0}</Text>
          <Text style={styles.statHint}>
            All time earnings
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Icon name="cart-outline" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Total Sales</Text>
          <Text style={styles.statValue}>{wallet?.totalSales || 0}</Text>
          <Text style={styles.statHint}>
            Successful orders
          </Text>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Icon name="information-circle" size={20} color="#4F46E5" />
        <Text style={styles.infoText}>
          Earnings are locked for 7 days after delivery to cover return period. 
          Minimum withdrawal: ₹100
        </Text>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Start sharing products to earn commissions
            </Text>
          </View>
        ) : (
          transactions.slice(0, 10).map((transaction) => {
            const iconData = getTransactionIcon(transaction.type);
            return (
              <View key={transaction._id} style={styles.transactionCard}>
                <View style={[styles.transactionIcon, { backgroundColor: iconData.color + '20' }]}>
                  <Icon name={iconData.name} size={20} color={iconData.color} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>
                    {transaction.description || transaction.type}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.createdAt)}
                  </Text>
                  {transaction.status === 'pending' && (
                    <Text style={styles.transactionStatus}>
                      Available on {formatDate(transaction.availableAt)}
                    </Text>
                  )}
                </View>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'withdrawal' ? styles.transactionAmountNegative : styles.transactionAmountPositive
                ]}>
                  {transaction.type === 'withdrawal' ? '-' : '+'}₹{transaction.amount}
                </Text>
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280'
  },
  notApprovedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 32
  },
  notApprovedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16
  },
  notApprovedText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
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
  balanceCard: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
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
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  statHint: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center'
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4F46E5',
    lineHeight: 18
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center'
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  transactionDetails: {
    flex: 1
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  transactionStatus: {
    fontSize: 11,
    color: '#F59E0B',
    marginTop: 2
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700'
  },
  transactionAmountPositive: {
    color: '#10B981'
  },
  transactionAmountNegative: {
    color: '#EF4444'
  }
});

export default ResellerWalletScreen;