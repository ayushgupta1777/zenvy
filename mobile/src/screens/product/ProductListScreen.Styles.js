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

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  // Search & Filter Bar
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A'
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Filters Section
  filtersSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A4A4A',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  sortScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5'
  },
  sortChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A4A'
  },
  sortChipTextActive: {
    color: '#fff'
  },

  // Results Count
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A'
  },

  // Grid Layout
  gridContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  gridWrapper: {
    gap: 12,
    marginBottom: 12
  },

  // Product Card
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadowStyles
  },
  productImageContainer: {
    width: '100%',
    height: cardWidth,
    backgroundColor: '#F5F7FA',
    position: 'relative'
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center'
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 14
  },
  discountLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 10
  },
  productInfo: {
    padding: 12
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 8
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8
  },
  productRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  productReviewCount: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF'
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  productMRP: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },

  // Stock
  productStockIndicator: {
    marginTop: 6
  },
  stockIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759'
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34C759'
  },
  stockOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  stockDotOut: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30'
  },
  stockTextOut: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF3B30'
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 20
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20
  }
});
