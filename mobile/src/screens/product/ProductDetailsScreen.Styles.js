import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#6B7280', marginTop: 12 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },

  // Image Section
  imageContainer: {
    backgroundColor: '#F9FAFB',
    paddingBottom: 12
  },
  mainImage: {
    width: '100%',
    height: 420,
    backgroundColor: '#F3F4F6',
    resizeMode: 'cover'
  },
  fullscreenBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    padding: 10
  },
  thumbnailsScroll: {
    paddingHorizontal: 12,
    paddingTop: 12
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden'
  },
  thumbnailActive: {
    borderColor: '#4F46E5'
  },
  thumbnailImage: {
    width: '100%',
    height: '100%'
  },

  // Details
  details: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8, lineHeight: 28 },
  
  skuRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 6, 
    alignSelf: 'flex-start' 
  },
  skuLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  skuValue: { fontSize: 12, fontWeight: '700', color: '#111827' },
  
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingText: { fontSize: 14, color: '#4B5563', fontWeight: '600' },
  
  priceBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  price: { fontSize: 28, fontWeight: '800', color: '#4F46E5' },
  mrp: { fontSize: 16, color: '#9CA3AF', textDecorationLine: 'line-through' },
  discountBadge: { 
    backgroundColor: '#FEE2E2', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  discountText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },

  descBox: { marginBottom: 24 },
  descTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10 },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 22 },

  stockBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  inStock: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  outOfStock: { fontSize: 14, fontWeight: '700', color: '#EF4444' },

  // Reviews
  reviewsSection: { 
    marginTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    paddingTop: 24 
  },
  reviewsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  reviewsTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  writeReviewBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    backgroundColor: '#EEF2FF', 
    borderRadius: 8 
  },
  writeReviewText: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
  
  reviewCard: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  reviewerName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  reviewDate: { fontSize: 12, color: '#9CA3AF' },
  reviewComment: { fontSize: 14, color: '#4B5563', lineHeight: 20 },

  // Footer
  footer: { 
    flexDirection: 'row', 
    padding: 16, 
    gap: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    backgroundColor: '#fff',
    alignItems: 'center' 
  },
  quantityBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  quantityText: { fontSize: 18, fontWeight: '800', minWidth: 24, textAlign: 'center' },
  addBtn: { 
    flex: 1, 
    backgroundColor: '#4F46E5', 
    paddingVertical: 16, 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  addBtnDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Fullscreen Viewer
  fullscreenContainer: { flex: 1, backgroundColor: '#000' },
  fullscreenHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16 
  },
  fullscreenCounter: { color: '#fff', fontSize: 16, fontWeight: '700' },
  fullscreenImage: { width: screenWidth, height: '100%' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    maxHeight: '85%',
    paddingBottom: 20
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  modalBody: { padding: 24 },
  modalLabel: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 10 },
  modalInput: { 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    padding: 14, 
    fontSize: 16, 
    color: '#111827', 
    marginBottom: 20 
  },
  modalTextArea: { height: 120, textAlignVertical: 'top' },
  submitBtn: { 
    backgroundColor: '#4F46E5', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10 
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
