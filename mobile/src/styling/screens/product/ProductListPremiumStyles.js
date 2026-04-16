// ============================================
// mobile/src/screens/product/ProductListPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const shadowStyles = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.2,
  shadowRadius: 10,
  elevation: Platform.OS === 'android' ? 6 : 0,
};

export const styles = StyleSheet.create({
  // ========== CONTAINER ==========
  'product-list-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // ========== HEADER ==========
  'product-list-premium-header': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  'product-list-premium-search-wrapper': {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  'product-list-premium-search-input': {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },

  'product-list-premium-filter-button': {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ========== FILTERS ==========
  'product-list-premium-filters-section': {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  'product-list-premium-filter-title': {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A4A4A',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  'product-list-premium-sort-scroll': {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },

  'product-list-premium-sort-chip': {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  'product-list-premium-sort-chip-active': {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },

  'product-list-premium-sort-chip-text': {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A4A',
  },

  'product-list-premium-sort-chip-text-active': {
    color: '#fff',
  },

  // ========== RESULTS HEADER ==========
  'product-list-premium-results-header': {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  'product-list-premium-results-text': {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  'product-list-premium-results-category': {
    fontWeight: '700',
    color: '#0A84FF',
  },

  // ========== GRID ==========
  'product-list-premium-grid-container': {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  'product-list-premium-grid-wrapper': {
    gap: 12,
    marginBottom: 8,
  },

  // ========== PRODUCT CARD ==========
  'product-list-premium-card': {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadowStyles,
  },

  'product-list-premium-image-container': {
    width: '100%',
    height: cardWidth,
    backgroundColor: '#F5F7FA',
    position: 'relative',
  },

  'product-list-premium-image': {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  'product-list-premium-discount-badge': {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  'product-list-premium-discount-badge-text': {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 13,
  },

  'product-list-premium-discount-label': {
    fontSize: 7,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 8,
  },

  'product-list-premium-info': {
    padding: 11,
  },

  'product-list-premium-title': {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 16,
    marginBottom: 6,
  },

  'product-list-premium-rating': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },

  'product-list-premium-rating-text': {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  'product-list-premium-review-count': {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  'product-list-premium-price-row': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },

  'product-list-premium-price': {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  'product-list-premium-mrp': {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  // ========== STOCK INDICATOR ==========
  'product-list-premium-stock-indicator': {
    marginTop: 6,
  },

  'product-list-premium-stock-in': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  'product-list-premium-stock-out': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  'product-list-premium-stock-dot': {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },

  'product-list-premium-stock-dot-out': {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },

  'product-list-premium-stock-text': {
    fontSize: 11,
    fontWeight: '600',
    color: '#34C759',
  },

  'product-list-premium-stock-text-out': {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF3B30',
  },

  // ========== EMPTY STATE ==========
  'product-list-premium-empty-state': {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    minHeight: 400,
  },

  'product-list-premium-empty-icon-bg': {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  'product-list-premium-empty-title': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },

  'product-list-premium-empty-subtitle': {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});