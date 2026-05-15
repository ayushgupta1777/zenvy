import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Top Strip - Like Pyrite Fashion
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  header: {
      zIndex: 10
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircleBorder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2.5,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  logoImage: {
    width: 55,
    height: 55,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
    marginTop: 2,
  },
  topRightIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  topIcon: {
    padding: 4,
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700'
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700'
  },

  // Side Drawer Styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  drawerHeader: {
    backgroundColor: '#4F46E5',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  drawerProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  drawerProfileInfo: {
    flex: 1,
  },
  drawerProfileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  drawerProfileEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  drawerSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  drawerSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    paddingHorizontal: 20,
    marginBottom: 10,
    letterSpacing: 1,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  drawerMenuText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  drawerCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  drawerCategoryImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 15,
  },
  drawerCategoryText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  drawerLogoutText: {
    fontSize: 15,
    color: '#FF4444',
    marginLeft: 15,
    fontWeight: '600',
  },

  // Banner Styles
  bannerContainer: {
    width: width,
    height: width * 0.5,
    position: 'relative'
  },
  bannerSlide: {
    width: width,
    height: width * 0.5,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20
  },

  // Section Styles
  section: {
    marginTop: 25,
    paddingHorizontal: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A'
  },
  sectionLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600'
  },
  productsScroll: {
    paddingRight: 20
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover'
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700'
  },
  productInfo: {
    padding: 10
  },
  productTitle: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
    height: 36
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  productMRP: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600'
  },

  // Categories Section
  categoriesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    marginTop: 15
  },
  categoryGraphic: {
    width: (width - 32) / 2,
    height: 220,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative'
  },
  categoryImage: {
    width: '100%',
    height: '100%'
  },
  categoryImagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },

  // Grid Styles
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  gridProductCard: {
    width: (width - 44) / 2,
    marginBottom: 15
  },
  gridProductImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    resizeMode: 'cover'
  },
  gridProductTitle: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 2
  },
  gridProductPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A'
  },

  // Top Seller Card
  topSellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12
  },
  topSellerRank: {
    width: 30,
    alignItems: 'center'
  },
  topSellerRankText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5'
  },
  topSellerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15
  },
  topSellerInfo: {
    flex: 1
  },
  topSellerTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4
  },
  topSellerPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topSellerPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  topSellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  topSellerRatingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600'
  }
});
