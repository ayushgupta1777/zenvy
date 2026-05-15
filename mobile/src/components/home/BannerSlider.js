import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BannerSkeleton } from '../common/SkeletonLoader';
import { getImageUrl } from '../../services/api';

const { width } = Dimensions.get('window');

const BannerSlider = ({ 
  banners, 
  isLoading, 
  bannerIndex, 
  scrollRef, 
  onScroll, 
  styles 
}) => {
  if (isLoading) return <BannerSkeleton />;

  return (
    <View style={styles.bannerContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
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
  );
};

export default BannerSlider;
