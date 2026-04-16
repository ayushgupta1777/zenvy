import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  Dimensions, FlatList, Animated, StatusBar
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchProducts } from '../../redux/slices/productSlice';
import api, { getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: products } = useSelector((state) => state.products);
  const { totalItems } = useSelector((state) => state.cart);

  const [bannerIndex, setBannerIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [drawerVisible, setDrawerVisible] = useState(false);

  const scrollRef = useRef(null);

  const drawerAnim = useRef(new Animated.Value(-300)).current;

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchProducts());
    fetchBanners();
    fetchCategories();
    fetchFeaturedProducts();
    fetchNotificationCount();
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  const fetchBanners = async () => {
    try {
      const response = await api.get('/banners');
      setBanners(response.data.data.banners);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      // STRICT FILTER: Show only top-level categories (no parent)
      const topLevelCategories = response.data.data.categories.filter(cat =>
        !cat.parent || cat.parent === null
      );
      setCategories(topLevelCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products/featured');
      setFeaturedProducts(response.data.data.products);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await api.get('/notifications');
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };
  // Banner auto-scroll
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        const nextIndex = (bannerIndex + 1) % banners.length;
        setBannerIndex(nextIndex);
        
        // Physically scroll the view
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            x: nextIndex * width,
            animated: true
          });
        }
      }, 3500); // 3.5 seconds for a better premium feel
      
      return () => clearInterval(interval);
    }
  }, [banners, bannerIndex]);
  // Banners (Admin can change these)
  // const banners = [
  //   { id: 1, image: 'https://example.com/banner1.jpg', title: 'Welcome to Pyrite Fashion' },
  //   { id: 2, image: 'https://example.com/banner2.jpg', title: 'New Collection' },
  //   { id: 3, image: 'https://example.com/banner3.jpg', title: 'Special Offer' }
  // ];

  // Category graphics (like in screenshot)



  const menuItems = [
    { id: 'home', name: 'Home', icon: 'home-outline', route: 'Home' },
    { id: 'orders', name: 'My Orders', icon: 'bag-handle-outline', route: 'Orders' },
    { id: 'wishlist', name: 'Wishlist', icon: 'heart-outline', route: 'Wishlist' },
    { id: 'wallet', name: 'Wallet', icon: 'wallet-outline', route: 'Wallet' },
    { id: 'reselling', name: 'Reselling', icon: 'storefront-outline', route: 'Reselling' },
    { id: 'profile', name: 'Profile', icon: 'person-outline', route: 'Profile' },
    { id: 'settings', name: 'Settings', icon: 'settings-outline', route: 'Profile' },
    { id: 'support', name: 'Help & Support', icon: 'help-circle-outline', route: 'Support' },
  ];

  const toggleDrawer = () => {
    const toValue = drawerVisible ? -300 : 0;
    setDrawerVisible(!drawerVisible);

    Animated.timing(drawerAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerVisible(false));
  };

  const handleCategoryPress = (category) => {
    closeDrawer();
    navigation.navigate('SubcategoryList', {
      categoryId: category._id,
      categoryName: category.name
    });
  };

  const handleMenuPress = (route) => {
    closeDrawer();

    switch (route) {
      case 'Wishlist':
        navigation.navigate('Profile', { screen: 'Wishlist' });
        break;
      case 'Wallet':
        navigation.navigate('ResellerHub', { screen: 'ResellerWallet' });
        break;
      case 'Reselling':
        navigation.navigate('ResellerHub');
        break;
      case 'Support':
        navigation.navigate('Profile', { screen: 'ContactUs' });
        break;
      case 'Profile':
        navigation.navigate('Profile');
        break;
      case 'Orders':
        navigation.navigate('Orders');
        break;
      case 'Home':
        navigation.navigate('Home');
        break;
      default:
        navigation.navigate(route);
    }
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* TOP STRIP - Like Pyrite Fashion */}

        {/* SIDE DRAWER */}
        {drawerVisible && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        )}

        {/* SIDE DRAWER */}
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX: drawerAnim }] }
          ]}
        >

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerProfileSection}>
                <View style={styles.drawerProfileImage}>
                  <Icon name="person" size={32} color="#fff" />
                </View>
                <View style={styles.drawerProfileInfo}>
                  <Text style={styles.drawerProfileName}>
                    {user?.name || 'Guest User'}
                  </Text>
                  <Text style={styles.drawerProfileEmail}>
                    {user?.email || 'Login to continue'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>MENU</Text>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.drawerMenuItem}
                  onPress={() => handleMenuPress(item.route)}
                  activeOpacity={0.7}
                >
                  <Icon name={item.icon} size={22} color="#333" />
                  <Text style={styles.drawerMenuText}>{item.name}</Text>
                  <Icon name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Categories */}
            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>CATEGORIES</Text>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={styles.drawerCategoryItem}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: getImageUrl(category.image) }}
                    style={styles.drawerCategoryImage}
                  />
                  <Text style={styles.drawerCategoryText}>{category.name}</Text>
                  <Icon name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            {user && (
              <TouchableOpacity
                style={styles.drawerLogoutBtn}
                onPress={() => {
                  closeDrawer();
                  // Dispatch logout action here if you have one
                  // dispatch(logout());
                  navigation.replace('Login');
                }}
              >
                <Icon name="log-out-outline" size={22} color="#FF4444" />
                <Text style={styles.drawerLogoutText}>Logout</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>

        {/* TOP STRIP - Like Pyrite Fashion */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.topStrip}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.logoContainer}
                onPress={toggleDrawer}
                activeOpacity={0.7}
              >
                <View style={styles.logoCircleBorder}>
                  <Image
                    source={require('../../assets/Logo_NRF.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.logoTextContainer}>
                  <Text style={styles.brandName}>New Raj Fancy</Text>
                  <Text style={styles.brandTagline}>NRF - Premium Jewelry</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Right Icons */}
            <View style={styles.topRightIcons}>
              {/* Search */}
              <TouchableOpacity
                style={styles.topIcon}
                onPress={() => navigation.navigate('Search')}
              >
                <Icon name="search" size={22} color="#333" />
              </TouchableOpacity>

              {/* Notifications */}
              <TouchableOpacity
                style={styles.topIcon}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Icon name="notifications" size={22} color="#333" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Cart */}
              <TouchableOpacity
                style={styles.topIcon}
                onPress={() => navigation.navigate('Cart')}
              >
                <Icon name="cart" size={22} color="#333" />
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
                {/* )} */}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Background fill for pull-down bounce - matching the top background */}
          <View style={{ backgroundColor: '#fff', height: 1000, position: 'absolute', top: -1000, left: 0, right: 0 }} />
          
          {/* BANNER SLIDER */}
          <View style={styles.bannerContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setBannerIndex(index);
              }}
            >
              {banners.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  style={styles.bannerSlide}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: getImageUrl(banner.image) }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Dots Indicator */}
            <View style={styles.dotsContainer}>
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    bannerIndex === index && styles.dotActive
                  ]}
                />
              ))}
            </View>
          </View>

          {/* FEATURED PRODUCTS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
                <Text style={styles.sectionLink}>View All →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
            >
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <TouchableOpacity
                    key={product._id}
                    style={styles.productCard}
                    onPress={() => navigation.navigate('ProductDetails', { productId: product._id })}
                  >
                    <Image
                      source={{ uri: getImageUrl(product.images[0]) }}
                      style={styles.productImage}
                    />

                    {product.discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{product.discount}% OFF</Text>
                      </View>
                    )}

                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {product.title}
                      </Text>
                      <View style={styles.productPriceRow}>
                        <Text style={styles.productPrice}>₹{product.price}</Text>
                        {product.mrp > product.price && (
                          <Text style={styles.productMRP}>₹{product.mrp}</Text>
                        )}
                      </View>

                      {product.averageRating > 0 && (
                        <View style={styles.ratingRow}>
                          <Icon name="star" size={12} color="#FFB800" />
                          <Text style={styles.ratingText}>{product.averageRating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#9CA3AF' }}>No featured products right now.</Text>
                </View>
              )}
            </ScrollView>
          </View>
          <View style={styles.categoriesSection}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.categoryGraphic}
                onPress={() => navigation.navigate('SubcategoryList', {
                  categoryId: item._id,
                  categoryName: item.name
                })}
                activeOpacity={0.8}
              >
                {item.image ? (
                  <Image
                    source={{ uri: getImageUrl(item.image) }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.categoryImage, styles.categoryImagePlaceholder]}>
                    <Icon name="image-outline" size={32} color="#9CA3AF" />
                  </View>
                )}

                {/* Overlay Text */}
                {/* <View style={styles.categoryOverlay}>
                  <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.categorySubtext}>Exclusive Collections</Text>
                  <View style={styles.exploreBtn}>
                    <Text style={styles.exploreBtnText}>Explore More</Text>
                  </View>
                </View> */}

                {/* Play Button for Videos (Optional) */}
                {item.hasVideo && (
                  <View style={styles.playButton}>
                    <Icon name="play" size={32} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>


          {/* PROMOTIONAL POSTER */}
          {/* <TouchableOpacity style={styles.promoCard} activeOpacity={0.9}>
          <Image 
            source={{ uri: 'https://example.com/promo.jpg' }}
            style={styles.promoImage}
          />
        </TouchableOpacity> */}

          {/* NEW ARRIVALS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ProductList', { sort: '-createdAt' })}>
                <Text style={styles.sectionLink}>View All →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.productsGrid}>
              {products.slice(0, 6).map((product) => (
                <TouchableOpacity
                  key={product._id}
                  style={styles.gridProductCard}
                  onPress={() => navigation.navigate('ProductDetails', { productId: product._id })}
                >
                  <Image
                    source={{ uri: getImageUrl(product.images[0]) }}
                    style={styles.gridProductImage}
                  />
                  <Text style={styles.gridProductTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <Text style={styles.gridProductPrice}>₹{product.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* TOP SELLERS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Sellers</Text>

            {products.slice(0, 5).map((product, index) => (
              <TouchableOpacity
                key={product._id}
                style={styles.topSellerCard}
                onPress={() => navigation.navigate('ProductDetails', { productId: product._id })}
              >
                <View style={styles.topSellerRank}>
                  <Text style={styles.topSellerRankText}>#{index + 1}</Text>
                </View>
                <Image
                  source={{ uri: getImageUrl(product.images[0]) }}
                  style={styles.topSellerImage}
                />
                <View style={styles.topSellerInfo}>
                  <Text style={styles.topSellerTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <View style={styles.topSellerPriceRow}>
                    <Text style={styles.topSellerPrice}>₹{product.price}</Text>
                    <View style={styles.topSellerRating}>
                      <Icon name="star" size={14} color="#FFB800" />
                      <Text style={styles.topSellerRatingText}>
                        {product.averageRating?.toFixed(1) || '0.0'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* SHOP BY COLLECTION */}
          {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Collection</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.collectionsScroll}
          >
            {['Traditional', 'Modern', 'Bridal', 'Casual', 'Festive'].map((collection, index) => (
              <TouchableOpacity
                key={index}
                style={styles.collectionCard}
                onPress={() => navigation.navigate('ProductList', { collection })}
              >
                <Image 
                  source={{ uri: `https://example.com/collection-${index}.jpg` }}
                  style={styles.collectionImage}
                />
                <Text style={styles.collectionName}>{collection}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> */}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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




  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  logoTextContainer: {
    justifyContent: 'center',
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




  logoTextContainer: {
    justifyContent: 'center',
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


  //   brandTagline: {
  //   fontSize: 11,
  //   fontWeight: '600',
  //   color: '#D4AF37',
  //   marginTop: 2,
  // },



  headerRight: {
    flexDirection: 'row',
    gap: 16,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    color: 'rgba(255,255,255,0.8)',
  },
  drawerSection: {
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  drawerSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 1,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  drawerMenuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  drawerCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  drawerCategoryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  drawerCategoryText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 16,
  },
  drawerLogoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF4444',
  },












  menuBtn: { marginRight: 12 },
  companyName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333'
  },
  topRightIcons: {
    flexDirection: 'row',
    gap: 16
  },
  topIcon: { position: 'relative' },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff'
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#4F46E5',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff'
  },

  // Banner Slider - INCREASED HEIGHT FROM 200 TO 280
  bannerContainer: {
    height: 280,
    position: 'relative'
  },

  bannerSlide: {
    width: width,
    height: 280,
    backgroundColor: '#F9FAFB' // Subtle background for contain mode
  },

  bannerImage: {
    width: '100%',
    height: '100%'
  },

  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },

  dotActive: {
    backgroundColor: '#fff',
    width: 24
  },

  // Category Graphics - REDUCED GAP FROM 16 TO 8
  categoriesSection: {
    paddingVertical: 8,
    paddingHorizontal: 0
  },


  categoryGraphic: {
    height: 280,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden'
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000'
  },
  categoryOverlay: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -60 }],
    alignItems: 'flex-end'
  },
  categoryName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4
  },
  categorySubtext: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4
  },
  exploreBtn: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 12
  },
  exploreBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000'
  },
  playButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    marginTop: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333'
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5'
  },

  // Products
  productsScroll: {
    gap: 12
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F5F5F5'
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff'
  },
  productInfo: {
    padding: 12
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333'
  },
  productMRP: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },

  // Promo Card
  promoCard: {
    height: 150,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden'
  },
  promoImage: {
    width: '100%',
    height: '100%'
  },

  // Grid Products
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  gridProductCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  gridProductImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F5F5'
  },
  gridProductTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    padding: 12,
    paddingBottom: 4
  },
  gridProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 12,
    paddingBottom: 12
  },

  // Top Sellers
  topSellerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center'
  },
  topSellerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  topSellerRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff'
  },
  topSellerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12
  },
  topSellerInfo: {
    flex: 1
  },
  topSellerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  topSellerPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topSellerPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333'
  },
  topSellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  topSellerRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },

  // Collections
  collectionsScroll: {
    gap: 12
  },
  collectionCard: {
    width: 120,
    alignItems: 'center'
  },
  collectionImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#4F46E5'
  },
  collectionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center'
  }
});

export default HomeScreen;


// Hey I have Shared you all the sight of reselling Front end back And what there and what not there and database. As well. I also Said that In the shared front end pages, there is only one page. That is a wallet screen js is At least working like giving the Data that means it has a apis in the backend and all That's fetching data perfectly. Other looks dummy. You given that Also Dummy. It's throwing the iron 404. That means I doesn't even Exist. So why without a proper one that will not gonna work? That is only looks there is There is a reselling I mean, there is a apply re selling, which is good, which actually works. That is separate. That was mine So that you can add in the reselling section. And if the approved. Reseller than they should not show it, that in place of that, that there should be the Data like which has filled by before approving. And also allow to modification, you know, and some of the. Issues feeling and some Few more feature in that you can provide, because we are making this convenience of reseller, right? Let's come in the Homepage you have given the Side menu In the top. But that is not working And not opening. You have given the search icon, but that's not working. Not even clickable, not even able to, not even opening up that input where I can write the search things. You've given the notification icon, but that's not a page exists, right? Not click It is just an icon. And you have given the card that's not navigating to the card. I'm telling you, this is all because you're going into the dummy things I mean, this is not, this is responsible. I'm going to be, when you have to be proper, you have provided that slide. Category graphics that's good But do you see any responses from the server side? Like, I don't see any proper system that like from From like admin side, that what if I wanna? I am an admin iphone. I had a category there If I wanna add the images on that category. If I wanna run the slide from the admin side, then there is no nothing. How can I do? You can see there is no. Proper system. Overall, I mean, you know, before giving I mean, you should know forgiving. Many front end page. And then it should be back end. Should be exist, you know, connectivity should be there, which is not in there Currently And is there a proper database that have a work properly or not? You should just follow all the that rules, you know, similarly in the sales side and earning side pages, which also looks dummy sometime If you need any pages, I have given you the pages. If you need many pages, then before analysing anything, just ask me whichever data, whichever page is there In my app access, I will give you so before deciding anything. If not, then try to make ask me something. How can I connect? This is the 4th time that Telling you all these things, you know, these issues, but you're not solving properly, right?