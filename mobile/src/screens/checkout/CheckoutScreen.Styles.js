import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },

  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  addNewText: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB'
  },
  itemImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#F3F4F6' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemQuantity: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#111827' },

  // Address
  addressCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12
  },
  addressCardSelected: { borderColor: '#4F46E5', backgroundColor: '#F5F7FF' },
  addressRadio: { marginRight: 12, marginTop: 2 },
  addressDetails: { flex: 1 },
  addressName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  addressPhone: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#4B5563', lineHeight: 18 },

  // Payment
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12
  },
  paymentCardSelected: { borderColor: '#4F46E5', backgroundColor: '#F5F7FF' },
  paymentDetails: { flex: 1 },
  paymentLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  paymentDescription: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Coupon
  couponInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12
  },
  couponInput: { flex: 1, paddingVertical: 10, fontSize: 14, fontWeight: '600', color: '#111827' },
  applyBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 10 },
  applyBtnText: { color: '#fff', fontWeight: '700' },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  successText: { fontSize: 12, color: '#10B981', fontWeight: '600' },

  // Price Details
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceLabel: { fontSize: 14, color: '#6B7280' },
  priceValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  priceFree: { color: '#10B981' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  priceTotalLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  priceTotalValue: { fontSize: 20, fontWeight: '800', color: '#4F46E5' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16
  },
  footerPrice: { flex: 1 },
  footerLabel: { fontSize: 12, color: '#6B7280' },
  footerAmount: { fontSize: 20, fontWeight: '800', color: '#111827' },
  checkoutBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Overlay
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  processingBox: { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  processingText: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16 },
  processingSubtext: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  confirmationModal: { backgroundColor: '#fff', borderRadius: 20, maxHeight: '80%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalContent: { padding: 20 },
  modalActions: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 12 },
  modalBtnCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  modalBtnConfirm: { flex: 2, paddingVertical: 14, alignItems: 'center', backgroundColor: '#4F46E5', borderRadius: 10 }
});
