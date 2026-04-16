// ============================================
// mobile/src/screens/reseller/WalletPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'wallet-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  'wallet-premium-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A84FF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  
  'wallet-premium-back-btn': {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  'wallet-premium-header-title': {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  
  'wallet-premium-balance-section': {
    paddingHorizontal: 24,
    marginTop: -24,
  },
  
  'wallet-premium-balance-card': {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  
  'wallet-premium-balance-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  'wallet-premium-balance-label': {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  
  'wallet-premium-balance-amount': {
    fontSize: 44,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  'wallet-premium-balance-pending': {
    fontSize: 13,
    color: '#FF9500',
    fontWeight: '600',
  },
  
  'wallet-premium-balance-icon': {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  'wallet-premium-withdraw-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    height: 56,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  'wallet-premium-withdraw-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  
  'wallet-premium-stats-section': {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  
  'wallet-premium-stat-card': {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'wallet-premium-stat-icon-container': {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  'wallet-premium-stat-content': {
    flex: 1,
  },
  
  'wallet-premium-stat-label': {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  
  'wallet-premium-stat-value': {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  
  'wallet-premium-transactions-section': {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  
  'wallet-premium-section-title': {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  
  'wallet-premium-transaction-item': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'wallet-premium-transaction-icon': {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  'wallet-premium-transaction-details': {
    flex: 1,
  },
  
  'wallet-premium-transaction-title': {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  'wallet-premium-transaction-date': {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  'wallet-premium-transaction-right': {
    alignItems: 'flex-end',
  },
  
  'wallet-premium-transaction-amount': {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  
  'wallet-premium-transaction-status': {
    fontSize: 11,
    color: '#FF9500',
    fontWeight: '600',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
});