import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

/**
 * // ==========================================
 * // ZENVY CUSTOM CHANGE: Premium Skeleton UI
 * // Description: High-performance shimmer loader for 
 * // professional apps. Repaces blank screens during fetch.
 * // ==========================================
 */
const SkeletonLoader = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.skeleton, style]}>
      <Animated.View style={[styles.shimmerContainer, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      </Animated.View>
    </View>
  );
};

// ---------------------------------------------------------
// Pre-defined Skeleton Layouts
// ---------------------------------------------------------

export const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <SkeletonLoader style={styles.productImage} />
    <View style={styles.productInfo}>
      <SkeletonLoader style={styles.titleLine} />
      <SkeletonLoader style={styles.priceLine} />
    </View>
  </View>
);

export const CategorySkeleton = () => (
  <View style={styles.categoryGraphic}>
    <SkeletonLoader style={styles.categoryImage} />
  </View>
);

export const BannerSkeleton = () => (
    <View style={styles.bannerContainer}>
        <SkeletonLoader style={styles.bannerImage} />
    </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#ECEFF1',
    overflow: 'hidden',
    borderRadius: 8,
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    width: width * 2,
  },
  shimmer: {
    flex: 1,
    width: width,
  },
  
  // Product Card Skeleton Styles (Matching HomeScreen/ProductList)
  productCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productImage: {
    height: 160,
    width: '100%',
    borderRadius: 12,
  },
  productInfo: {
    marginTop: 12,
    gap: 8,
  },
  titleLine: {
    height: 14,
    width: '80%',
  },
  priceLine: {
    height: 14,
    width: '40%',
  },

  // Category Skeleton Styles
  categoryGraphic: {
    width: (width - 48) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    margin: 6,
  },
  categoryImage: {
    flex: 1,
    borderRadius: 16,
  },

  // Banner Skeleton Styles
  bannerContainer: {
    width: width,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  bannerImage: {
    height: 180,
    width: '100%',
    borderRadius: 20,
  }
});

export default SkeletonLoader;
