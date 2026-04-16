// ============================================
// mobile/src/screens/reseller/ShareProductPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'share-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  'share-premium-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  
  'share-premium-back-btn': {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  'share-premium-header-title': {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  'share-premium-product-card': {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  
  'share-premium-product-image': {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
  },
  
  'share-premium-product-info': {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  
  'share-premium-product-title': {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 22,
  },
  
  'share-premium-product-prices': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  'share-premium-original-price': {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A84FF',
  },
  
  'share-premium-mrp-badge': {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  'share-premium-mrp-text': {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  
  'share-premium-margin-section': {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  
  'share-premium-margin-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  'share-premium-margin-title': {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  'share-premium-margin-badge': {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  
  'share-premium-margin-value': {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A84FF',
  },
  
  'share-premium-slider-container': {
    paddingHorizontal: 8,
  },
  
  'share-premium-slider': {
    width: '100%',
    height: 40,
  },
  
  'share-premium-margin-range': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  
  'share-premium-range-text': {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  
  'share-premium-breakdown-card': {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  
  'share-premium-breakdown-title': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  
  'share-premium-breakdown-row': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  
  'share-premium-breakdown-highlight': {
    backgroundColor: '#E3F2FD',
    marginHorizontal: -24,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 8,
  },
  
  'share-premium-breakdown-label-container': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  'share-premium-breakdown-label': {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  
  'share-premium-breakdown-value-primary': {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A84FF',
  },
  
  'share-premium-breakdown-value-success': {
    fontSize: 20,
    fontWeight: '800',
    color: '#34C759',
  },
  
  'share-premium-breakdown-value': {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9500',
  },
  
  'share-premium-divider': {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  
  'share-premium-breakdown-row-small': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  
  'share-premium-breakdown-label-small': {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  
  'share-premium-breakdown-value-small': {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  
  'share-premium-actions': {
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 12,
  },
  
  'share-premium-generate-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    height: 58,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  
  'share-premium-generate-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  
  'share-premium-whatsapp-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 16,
    height: 58,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  'share-premium-whatsapp-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  
  'share-premium-copy-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 58,
    borderWidth: 2,
    borderColor: '#0A84FF',
  },
  
  'share-premium-copy-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A84FF',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  
  'share-premium-link-preview': {
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  
  'share-premium-link-label': {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  
  'share-premium-link-text': {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
  },
  
  'share-premium-info-card': {
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
  
  'share-premium-info-icon': {
    marginTop: 2,
  },
  
  'share-premium-info-text': {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 22,
    fontWeight: '500',
  },
  
  'share-premium-info-highlight': {
    fontWeight: '800',
    color: '#0A84FF',
  },
});