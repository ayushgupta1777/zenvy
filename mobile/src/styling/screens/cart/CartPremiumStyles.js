// ============================================
// mobile/src/screens/cart/CartPremiumStyles.js
// ============================================
import { StyleSheet, Platform } from 'react-native';

const shadowStyles = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.2,
  shadowRadius: 8,
  elevation: Platform.OS === 'android' ? 4 : 0,
};

export const styles = StyleSheet.create({
  // ========== CONTAINER ==========
  'cart-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // ========== HEADER ==========
  'cart-premium-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  'cart-premium-header-title': {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  'cart-premium-item-count-badge': {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  'cart-premium-item-count-text': {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // ========== ITEMS CONTAINER ==========
  'cart-premium-items-container': {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  // ========== CART ITEM CARD ==========
  'cart-premium-item-card': {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    ...shadowStyles,
  },

  'cart-premium-item-image': {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    backgroundColor: '#F5F7FA',
  },

  'cart-premium-item-details': {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },

  'cart-premium-item-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  'cart-premium-item-title': {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 18,
    marginRight: 8,
  },

  'cart-premium-item-price': {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },

  // ========== RESELLER TAG ==========
  'cart-premium-reseller-tag': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8F2FF',
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },

  'cart-premium-reseller-text': {
    fontSize: 11,
    fontWeight: '600',
    color: '#0A84FF',
  },

  // ========== ITEM ACTIONS ==========
  'cart-premium-item-actions': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  'cart-premium-quantity-controls': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
  },

  'cart-premium-qty-btn-small': {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  'cart-premium-quantity-text': {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 20,
    textAlign: 'center',
  },

  'cart-premium-item-subtotal': {
    alignItems: 'flex-end',
  },

  'cart-premium-subtotal-label': {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  'cart-premium-subtotal-value': {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },

  // ========== EMPTY STATE ==========
  'cart-premium-empty-container': {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  'cart-premium-empty-icon-bg': {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  'cart-premium-empty-title': {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },

  'cart-premium-empty-subtitle': {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 20,
  },

  'cart-premium-empty-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    minWidth: 220,
    ...shadowStyles,
  },

  'cart-premium-empty-btn-text': {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // ========== SUMMARY SECTION ==========
  'cart-premium-summary-section': {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    ...shadowStyles,
  },

  'cart-premium-summary-row': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  'cart-premium-summary-label': {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4A4A',
  },

  'cart-premium-summary-value': {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  'cart-premium-summary-value-free': {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },

  'cart-premium-divider': {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },

  'cart-premium-summary-row-total': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  'cart-premium-total-label': {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  'cart-premium-total-value': {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A84FF',
  },

  // ========== FOOTER ==========
  'cart-premium-footer': {
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  'cart-premium-checkout-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    ...shadowStyles,
  },

  'cart-premium-checkout-btn-text': {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});