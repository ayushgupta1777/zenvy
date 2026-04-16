// ============================================
// mobile/src/screens/vendor/AddProductPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'addproduct-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  'addproduct-premium-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  
  'addproduct-premium-back-btn': {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  'addproduct-premium-header-title': {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  'addproduct-premium-section': {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  
  'addproduct-premium-section-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  'addproduct-premium-section-title': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  'addproduct-premium-section-badge': {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A84FF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  'addproduct-premium-image-scroll': {
    gap: 12,
    paddingRight: 24,
  },
  
  'addproduct-premium-image-preview': {
    width: 140,
    height: 140,
    borderRadius: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  'addproduct-premium-preview-image': {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  
  'addproduct-premium-remove-image': {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  'addproduct-premium-primary-badge': {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#0A84FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  'addproduct-premium-primary-text': {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  
  'addproduct-premium-add-image-btn': {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  'addproduct-premium-add-image-icon': {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  'addproduct-premium-add-image-text': {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  'addproduct-premium-input-group': {
    marginBottom: 20,
  },
  
  'addproduct-premium-label': {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  
  'addproduct-premium-required': {
    color: '#EF4444',
  },
  
  'addproduct-premium-input-container': {
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
  
  'addproduct-premium-input': {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  
  'addproduct-premium-textarea-container': {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'addproduct-premium-textarea': {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    minHeight: 100,
  },
  
  'addproduct-premium-row': {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  
  'addproduct-premium-input-half': {
    flex: 1,
  },
  
  'addproduct-premium-currency': {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginRight: 8,
  },
  
  'addproduct-premium-input-price': {
    flex: 1,
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  
  'addproduct-premium-info-card': {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 24,
    gap: 12,
  },
  
  'addproduct-premium-info-text': {
    flex: 1,
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 20,
    fontWeight: '500',
  },
  
  'addproduct-premium-submit-btn': {
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
  
  'addproduct-premium-submit-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
    letterSpacing: 0.5,
  },
});