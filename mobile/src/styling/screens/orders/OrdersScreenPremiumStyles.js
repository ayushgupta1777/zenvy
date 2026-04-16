// ============================================
// mobile/src/screens/orders/OrdersScreenPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'orders-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  'orders-premium-list-content': {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  'orders-premium-order-card': {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  'orders-premium-order-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  'orders-premium-order-header-left': {
    flex: 1,
  },
  'orders-premium-order-number': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  'orders-premium-order-date': {
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  'orders-premium-order-status': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  'orders-premium-status-text': {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  'orders-premium-order-divider': {
    height: 1,
    backgroundColor: '#F5F7FA',
    marginBottom: 14,
  },
  'orders-premium-order-items': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  'orders-premium-items-info': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  'orders-premium-order-items-text': {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  'orders-premium-order-amount': {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A84FF',
  },
  'orders-premium-order-footer': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  'orders-premium-payment-badge': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  'orders-premium-payment-method': {
    fontSize: 12,
    color: '#5E5CE6',
    fontWeight: '700',
  },
  'orders-premium-view-details-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  'orders-premium-view-details-text': {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '600',
  },
  'orders-premium-empty-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  'orders-premium-empty-icon-wrapper': {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  'orders-premium-empty-title': {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  'orders-premium-empty-subtitle': {
    fontSize: 15,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 32,
  },
  'orders-premium-btn-primary': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  'orders-premium-btn-text-primary': {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});