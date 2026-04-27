import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  settingsBtn: { padding: 8 },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4
  },
  timeframeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  timeframeBtnActive: {
    backgroundColor: '#4F46E5'
  },
  timeframeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280'
  },
  timeframeBtnTextActive: {
    color: '#fff'
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  statContent: { flex: 1 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    gap: 6
  },
  filterChipActive: {
    backgroundColor: '#4F46E5'
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  filterChipTextActive: { color: '#fff' },
  filterChipBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  filterChipBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff'
  },
  ordersContainer: { paddingHorizontal: 16, paddingBottom: 80 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  orderNumber: { fontSize: 16, fontWeight: '700', color: '#111827' },
  orderCustomer: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12
  },
  orderDetails: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  orderDetailText: { fontSize: 13, color: '#6B7280' },
  orderAmount: { fontSize: 13, fontWeight: '700', color: '#111827' },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  trackingText: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },
  orderActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  actionBtnPrimary: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4F46E5',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  }
});
