import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './SkeletonLoader.Styles';

const { width } = Dimensions.get('window');

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

export default SkeletonLoader;
