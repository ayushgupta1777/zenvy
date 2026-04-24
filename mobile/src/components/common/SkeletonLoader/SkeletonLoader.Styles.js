import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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

export default styles;
