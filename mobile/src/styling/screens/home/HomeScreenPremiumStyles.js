// ============================================
// mobile/src/screens/home/HomeScreenPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions } from 'react-native';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

const shadowStyles = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.25,
  shadowRadius: 12,
  elevation: Platform.OS === 'android' ? 8 : 0,
};

const gradientGradient = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

export const styles = StyleSheet.create({
  // ========== CONTAINER ==========
  'home-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // ========== HEADER ==========
  'home-premium-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  'home-premium-greeting': {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  'home-premium-subtitle': {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4A4A',
  },

  'home-premium-notification-btn': {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  'home-premium-notification-dot': {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },

  // ========== SCROLL ==========
  'home-premium-scroll': {
    flex: 1,
  },

  // ========== SEARCH BAR ==========
  'home-premium-search-bar': {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    ...shadowStyles,
  },

  'home-premium-search-placeholder': {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  // ========== SECTIONS ==========
  'home-premium-section': {
    marginTop: 24,
    paddingHorizontal: 20,
  },

  'home-premium-section-title': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  'home-premium-section-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  'home-premium-section-link': {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
  },

  // ========== CATEGORIES ==========
  'home-premium-categories-scroll': {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },

  'home-premium-category-item': {
    alignItems: 'center',
    marginRight: 16,
  },

  'home-premium-category-icon-bg': {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#E8EFFF',
  },

  'home-premium-category-name': {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    maxWidth: 70,
  },

  // ========== BANNER ==========
  'home-premium-banner-reseller': {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    marginTop: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: '#0A84FF',
    borderRadius: 18,
    ...shadowStyles,
  },

  'home-premium-banner-text': {
    flex: 1,
    marginLeft: 14,
    marginRight: 12,
  },

  'home-premium-banner-title': {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },

  'home-premium-banner-subtitle': {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // ========== PRODUCT CARDS ==========
  'product-premium-card': {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadowStyles,
  },

  'product-premium-image-container': {
    width: '100%',
    height: cardWidth,
    backgroundColor: '#F5F7FA',
    position: 'relative',
  },

  'product-premium-image': {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  'product-premium-discount-badge': {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },

  'product-premium-discount-text': {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 14,
  },

  'product-premium-discount-label': {
    fontSize: 8,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 10,
  },

  'product-premium-info': {
    padding: 12,
  },

  'product-premium-title': {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 8,
  },

  'product-premium-price-row': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },

  'product-premium-price': {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  'product-premium-mrp': {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  'product-premium-rating': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  'product-premium-rating-value': {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  'product-premium-rating-count': {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  // ========== GRID ==========
  'home-premium-products-grid': {
    gap: 12,
    marginBottom: 12,
  },

  // ========== SPACER ==========
  'home-premium-spacer': {
    height: 20,
  },
});