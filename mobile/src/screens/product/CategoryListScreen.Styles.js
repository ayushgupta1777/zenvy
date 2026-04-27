import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  categoryBanner: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6'
  },
  descriptionBox: {
    padding: 16,
    backgroundColor: '#EEF2FF',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8
  },
  description: {
    fontSize: 14,
    color: '#4F46E5',
    lineHeight: 20
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8
  },
  viewAllBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff'
  },
  section: {
    padding: 16,
    marginTop: 12,
    backgroundColor: '#fff'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12
  },
  subcategoryCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  subcategoryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  subcategoryImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  subcategoryInfo: {
    flex: 1,
    marginLeft: 12
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  subcategorySlug: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6
  },
  subcategoryDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18
  },
  arrowIcon: {
    marginLeft: 8
  },
  skeletonContainer: {
    padding: 20
  },
  skeletonLine1: {
    height: 20,
    width: '60%',
    backgroundColor: '#ECEFF1',
    borderRadius: 4,
    marginBottom: 12
  },
  skeletonLine2: {
    height: 14,
    width: '90%',
    backgroundColor: '#ECEFF1',
    borderRadius: 4,
    marginBottom: 8
  },
  skeletonLine3: {
    height: 14,
    width: '80%',
    backgroundColor: '#ECEFF1',
    borderRadius: 4,
    marginBottom: 8
  },
  skeletonGrid: {
    paddingHorizontal: 20,
    gap: 12
  },
  skeletonItem: {
    height: 60,
    width: '100%',
    backgroundColor: '#ECEFF1',
    borderRadius: 12
  },
  spacer40: {
    height: 40
  }
});
