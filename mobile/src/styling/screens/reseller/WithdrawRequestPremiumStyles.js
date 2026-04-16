// ============================================
// mobile/src/screens/reseller/WithdrawRequestPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'withdraw-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  'withdraw-premium-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  
  'withdraw-premium-back-btn': {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  'withdraw-premium-header-title': {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  'withdraw-premium-balance-card': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  
  'withdraw-premium-balance-icon': {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  'withdraw-premium-balance-content': {
    flex: 1,
  },
  
  'withdraw-premium-balance-label': {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  
  'withdraw-premium-balance-amount': {
    fontSize: 36,
    fontWeight: '800',
    color: '#0A84FF',
    marginBottom: 4,
  },
  
  'withdraw-premium-balance-note': {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  'withdraw-premium-section': {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  
  'withdraw-premium-section-title': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  
  'withdraw-premium-input-group': {
    marginBottom: 20,
  },
  
  'withdraw-premium-label': {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  
  'withdraw-premium-amount-input-container': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 72,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'withdraw-premium-currency': {
    fontSize: 32,
    fontWeight: '800',
    color: '#6B7280',
    marginRight: 8,
  },
  
  'withdraw-premium-amount-input': {
    flex: 1,
    fontSize: 32,
    color: '#1A1A1A',
    fontWeight: '800',
  },
  
  'withdraw-premium-hint': {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 8,
  },
  
  'withdraw-premium-quick-amounts': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  
  'withdraw-premium-quick-btn': {
    flex: 1,
    minWidth: (width - 72) / 2,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'withdraw-premium-quick-btn-active': {
    backgroundColor: '#E3F2FD',
    borderColor: '#0A84FF',
  },
  
  'withdraw-premium-quick-text': {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  
  'withdraw-premium-quick-text-active': {
    color: '#0A84FF',
  },
  
  'withdraw-premium-input-container': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'withdraw-premium-input': {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  
  'withdraw-premium-info-card': {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 24,
    gap: 12,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  
  'withdraw-premium-info-content': {
    flex: 1,
  },
  
  'withdraw-premium-info-title': {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  
  'withdraw-premium-info-text': {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '500',
  },
  
  'withdraw-premium-submit-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    height: 58,
    marginHorizontal: 24,
    marginTop: 24,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  
  'withdraw-premium-submit-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
    letterSpacing: 0.5,
  },
});