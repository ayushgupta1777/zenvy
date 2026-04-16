// ============================================
// mobile/src/screens/vendor/VendorDashboardPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'vendor-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  'vendor-premium-header': {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  
  'vendor-premium-header-content': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  'vendor-premium-greeting': {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  
  'vendor-premium-title': {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  
  'vendor-premium-notification-btn': {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  'vendor-premium-notification-badge': {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  
  'vendor-premium-stats-section': {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  
  'vendor-premium-stats-grid': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  'vendor-premium-stat-card': {
    width: (width - 60) / 2,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  
  'vendor-premium-stat-icon-container': {
    marginBottom: 12,
  },
  
  'vendor-premium-stat-value': {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  'vendor-premium-stat-label': {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  'vendor-premium-cta-section': {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  
  'vendor-premium-add-product-card': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A84FF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  
  'vendor-premium-add-product-content': {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  'vendor-premium-add-product-icon': {
    marginRight: 16,
  },
  
  'vendor-premium-add-product-text': {
    flex: 1,
  },
  
  'vendor-premium-add-product-title': {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  
  'vendor-premium-add-product-subtitle': {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  
  'vendor-premium-actions-section': {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  
  'vendor-premium-section-title': {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  
  'vendor-premium-actions-grid': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  'vendor-premium-action-card': {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'vendor-premium-action-icon': {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  'vendor-premium-action-title': {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  'vendor-premium-action-subtitle': {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  'vendor-premium-action-arrow': {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});