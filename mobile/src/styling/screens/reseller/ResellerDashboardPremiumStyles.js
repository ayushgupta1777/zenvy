// ============================================
// mobile/src/screens/reseller/ResellerDashboardPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'reseller-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  'reseller-premium-header': {
    backgroundColor: '#0A84FF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  
  'reseller-premium-header-content': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  'reseller-premium-greeting': {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  
  'reseller-premium-title': {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  
  'reseller-premium-notification-btn': {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  'reseller-premium-notification-badge': {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  
  'reseller-premium-wallet-section': {
    paddingHorizontal: 24,
    marginTop: -24,
  },
  
  'reseller-premium-wallet-card': {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  
  'reseller-premium-wallet-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  'reseller-premium-wallet-label': {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  
  'reseller-premium-wallet-amount': {
    fontSize: 40,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  'reseller-premium-wallet-earnings': {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '600',
  },
  
  'reseller-premium-wallet-icon': {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  'reseller-premium-wallet-button': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    height: 54,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  'reseller-premium-wallet-button-text': {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  
  'reseller-premium-stats-section': {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  
  'reseller-premium-stats-grid': {
    flexDirection: 'row',
    gap: 12,
  },
  
  'reseller-premium-stat-card': {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  
  'reseller-premium-stat-icon': {
    marginBottom: 12,
  },
  
  'reseller-premium-stat-value': {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  'reseller-premium-stat-label': {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  'reseller-premium-actions-section': {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  
  'reseller-premium-section-title': {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  
  'reseller-premium-action-card': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'reseller-premium-action-icon-container': {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  'reseller-premium-action-content': {
    flex: 1,
  },
  
  'reseller-premium-action-title': {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  'reseller-premium-action-subtitle': {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  'reseller-premium-referral-section': {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  
  'reseller-premium-referral-card': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  
  'reseller-premium-referral-icon': {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  'reseller-premium-referral-content': {
    flex: 1,
  },
  
  'reseller-premium-referral-label': {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  
  'reseller-premium-referral-code-container': {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  'reseller-premium-referral-code': {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF9500',
    marginRight: 12,
    letterSpacing: 2,
  },
  
  'reseller-premium-copy-btn': {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});