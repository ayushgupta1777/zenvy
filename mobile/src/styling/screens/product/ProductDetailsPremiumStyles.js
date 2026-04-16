// ============================================
// mobile/src/screens/product/ProductDetailsPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const shadowStyles = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.25,
  shadowRadius: 12,
  elevation: Platform.OS === 'android' ? 8 : 0,
};

export const styles = StyleSheet.create({
  // ========== CONTAINER ==========
  'product-details-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  'product-details-premium-loading': {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },

  'product-details-premium-scroll': {
    flex: 1,
  },

  // ========== IMAGE GALLERY ==========
  'product-details-premium-gallery': {
    position: 'relative',
    width: width,
    height: width,
    backgroundColor: '#fff',
  },

  'product-details-premium-image': {
    width: width,
    height: width,
    resizeMode: 'cover',
  },

  'product-details-premium-indicators': {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  'product-details-premium-indicator': {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },

  'product-details-premium-indicator-active': {
    backgroundColor: '#fff',
    width: 24,
  },

  'product-details-premium-share-btn': {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyles,
  },

  // ========== PRODUCT INFO ==========
  'product-details-premium-info': {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },

  'product-details-premium-title': {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 28,
    marginBottom: 14,
  },

  // ========== RATING ==========
  'product-details-premium-rating-container': {
    marginBottom: 18,
  },

  'product-details-premium-rating-row': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  'product-details-premium-stars': {
    flexDirection: 'row',
    gap: 2,
  },

  'product-details-premium-rating-value': {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  'product-details-premium-review-count': {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },

  // ========== PRICE SECTION ==========
  'product-details-premium-price-section': {
    marginBottom: 16,
  },

  'product-details-premium-price-row': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  'product-details-premium-price-current': {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  'product-details-premium-price-mrp': {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  'product-details-premium-price-discount': {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF3B30',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // ========== STOCK STATUS ==========
  'product-details-premium-stock-container': {
    marginTop: 12,
  },

  'product-details-premium-stock-available': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  'product-details-premium-stock-unavailable': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  'product-details-premium-stock-text': {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // ========== DIVIDER ==========
  'product-details-premium-divider': {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },

  // ========== VENDOR INFO ==========
  'product-details-premium-vendor': {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  'product-details-premium-vendor-info': {
    flex: 1,
  },

  'product-details-premium-vendor-label': {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  'product-details-premium-vendor-name': {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 2,
  },

  // ========== SECTIONS ==========
  'product-details-premium-section': {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  'product-details-premium-section-title': {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  'product-details-premium-description': {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4A4A',
    lineHeight: 20,
  },

  // ========== SPECIFICATIONS ==========
  'product-details-premium-spec-row': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  'product-details-premium-spec-key': {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A4A',
    flex: 1,
  },

  'product-details-premium-spec-value': {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'right',
  },

  'product-details-premium-spacer': {
    height: 100,
  },

  // ========== BOTTOM BAR ==========
  'product-details-premium-bottom-bar': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  // ========== QUANTITY SELECTOR ==========
  'product-details-premium-quantity-selector': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    gap: 12,
  },

  'product-details-premium-qty-btn': {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  'product-details-premium-qty-value': {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 24,
    textAlign: 'center',
  },

  // ========== ADD TO CART BUTTON ==========
  'product-details-premium-add-to-cart-btn': {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    ...shadowStyles,
  },

  'product-details-premium-add-to-cart-text': {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  'product-details-premium-btn-disabled': {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
});