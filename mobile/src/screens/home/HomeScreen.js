import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategorySkeleton, ProductCardSkeleton } from '../../components/common/SkeletonLoader';
import { getImageUrl } from '../../services/api';

// New Imports
import styles from './HomeScreen.Styles';
import useHomeData from '../../hooks/useHomeData';
import SideDrawer from '../../components/navigation/SideDrawer';
import HomeHeader from '../../components/home/HomeHeader';
import BannerSlider from '../../components/home/BannerSlider';

const HomeScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { items: products } = useSelector((state) => state.products);
  const { totalItems } = useSelector((state) => state.cart);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-300)).current;
  const scrollRef = useRef(null);

  const {
    banners,
    categories,
    featuredProducts,
    unreadCount,
    isInitialLoading,
    bannerIndex,
    setBannerIndex,
    fadeAnim,
    slideAnim
  } = useHomeData();

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

  const handleMenuPress = (route) => {
    closeDrawer();
    switch (route) {
      case 'Wishlist': navigation.navigate('Profile', { screen: 'Wishlist' }); break;
      case 'Wallet': navigation.navigate('ResellerHub', { screen: 'ResellerWallet' }); break;
      case 'Reselling': navigation.navigate('ResellerHub'); break;
      case 'Support': navigation.navigate('Profile', { screen: 'ContactUs' }); break;
      default: navigation.navigate(route);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        
        <SideDrawer 
          visible={drawerVisible}
          drawerAnim={drawerAnim}
          user={user}
          menuItems={menuItems}
          categories={categories}
          onClose={closeDrawer}
          onMenuPress={handleMenuPress}
          onCategoryPress={(cat) => {
            closeDrawer();
            navigation.navigate('SubcategoryList', { categoryId: cat._id, categoryName: cat.name });
          }}
          onLogout={() => {
            closeDrawer();
            navigation.replace('Login');
          }}
          styles={styles}
        />

        <HomeHeader 
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          unreadCount={unreadCount}
          totalItems={totalItems}
          onToggleDrawer={toggleDrawer}
          navigation={navigation}
          styles={styles}
        />

        <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
          <View style={{ backgroundColor: '#fff', height: 1000, position: 'absolute', top: -1000, left: 0, right: 0 }} />
          
          <BannerSlider 
            banners={banners}
            isLoading={isInitialLoading}
            bannerIndex={bannerIndex}
            scrollRef={scrollRef}
            onScroll={(e) => setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / 400))}
            styles={styles}
          />

          {/* FEATURED PRODUCTS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
                <Text style={styles.sectionLink}>View All →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
              {isInitialLoading ? (
                <><ProductCardSkeleton /><ProductCardSkeleton /><ProductCardSkeleton /></>
              ) : featuredProducts.map((product) => (
                <TouchableOpacity
                  key={product._id}
                  style={styles.productCard}
                  onPress={() => navigation.navigate('ProductDetails', { productId: product._id })}
                >
                  <Image source={{ uri: getImageUrl(product.images[0]) }} style={styles.productImage} />
                  {product.discount > 0 && (
                    <View style={styles.discountBadge}><Text style={styles.discountText}>{product.discount}% OFF</Text></View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
                    <View style={styles.productPriceRow}>
                      <Text style={styles.productPrice}>₹{product.price}</Text>
                      {product.mrp > product.price && <Text style={styles.productMRP}>₹{product.mrp}</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* CATEGORIES */}
          <View style={styles.categoriesSection}>
            {isInitialLoading ? (
              <><CategorySkeleton /><CategorySkeleton /><CategorySkeleton /><CategorySkeleton /></>
            ) : categories.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.categoryGraphic}
                onPress={() => navigation.navigate('SubcategoryList', { categoryId: item._id, categoryName: item.name })}
                activeOpacity={0.8}
              >
                {item.image ? (
                  <Image source={{ uri: getImageUrl(item.image) }} style={styles.categoryImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.categoryImage, styles.categoryImagePlaceholder]}><Icon name="image-outline" size={32} color="#9CA3AF" /></View>
                )}
              </TouchableOpacity>
            ))}
          </View>

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
                  <Image source={{ uri: getImageUrl(product.images[0]) }} style={styles.gridProductImage} />
                  <Text style={styles.gridProductTitle} numberOfLines={2}>{product.title}</Text>
                  <Text style={styles.gridProductPrice}>₹{product.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;