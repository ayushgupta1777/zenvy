import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  TextInput, ScrollView, RefreshControl, ActivityIndicator, StyleSheet
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { getImageUrl } from '../../services/api';

const ProductListScreen = ({ route, navigation }) => {
  const {
    categoryId,
    categoryName,
    subcategoryId,
    subcategoryName
  } = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const dispatch = useDispatch();

  useEffect(() => {
    fetchProductsList();
  }, [categoryId, subcategoryId, searchQuery, sortBy]);

  const fetchProductsList = async () => {
    try {
      setIsLoading(true);
      const params = {
        sort: getSortParam(sortBy),
        page: 1,
        limit: 20
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (subcategoryId) {
        params.subcategory = subcategoryId;
      } else if (categoryId) {
        params.category = categoryId;
      }

      const response = await api.get('/products', { params });
      setProducts(response.data.data.products);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortParam = (sort) => {
    const sortMap = {
      popular: '-soldCount',
      price_asc: 'price',
      price_desc: '-price',
      newest: '-createdAt',
      rating: '-averageRating'
    };
    return sortMap[sort] || '-soldCount';
  };

  const sortOptions = [
    { label: 'Popular', value: 'popular' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Rating', value: 'rating' }
  ];

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: getImageUrl(item.images[0]) }}
            style={styles.productImage}
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Icon name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}

        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{item.discount}%</Text>
            <Text style={styles.discountLabel}>OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.averageRating > 0 && (
          <View style={styles.productRating}>
            <Icon name="star" size={13} color="#FF9500" />
            <Text style={styles.productRatingText}>
              {item.averageRating.toFixed(1)}
            </Text>
            <Text style={styles.productReviewCount}>
              ({item.reviewCount || 0})
            </Text>
          </View>
        )}

        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {item.mrp > item.price && (
            <Text style={styles.productMRP}>₹{item.mrp}</Text>
          )}
        </View>

        <View style={styles.productStockIndicator}>
          {item.stock > 0 ? (
            <View style={styles.stockIn}>
              <View style={styles.stockDot} />
              <Text style={styles.stockText}>In Stock</Text>
            </View>
          ) : (
            <View style={styles.stockOut}>
              <View style={styles.stockDotOut} />
              <Text style={styles.stockTextOut}>Out of Stock</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const headerTitle = subcategoryName || categoryName || 'Products';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Icon name="search-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Icon name="search-outline" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in this category..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
        >
          <Icon
            name={showFilters ? 'close' : 'filter-outline'}
            size={20}
            color="#4F46E5"
          />
        </TouchableOpacity>
      </View>

      {/* Filters & Sort */}
      {showFilters && (
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Sort By</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sortScroll}
          >
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortChip,
                  sortBy === option.value && styles.sortChipActive
                ]}
                onPress={() => setSortBy(option.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    sortBy === option.value && styles.sortChipTextActive
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {pagination.total || 0} Products
        </Text>
      </View>

      {/* Products Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="search-outline" size={56} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridWrapper}
          ListHeaderComponent={
            <View style={{ backgroundColor: '#fff', height: 1000, position: 'absolute', top: -1000, left: 0, right: 0 }} />
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchProductsList}
              tintColor="#4F46E5"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827'
  },
  filterButton: {
    padding: 8
  },
  filtersSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  sortScroll: {
    gap: 8
  },
  sortChip: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sortChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280'
  },
  sortChipTextActive: {
    color: '#fff'
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8
  },
  gridContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  gridWrapper: {
    gap: 8,
    paddingHorizontal: 8
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6'
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6'
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff'
  },
  discountLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff'
  },
  productInfo: {
    padding: 12
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6
  },
  productRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827'
  },
  productReviewCount: {
    fontSize: 11,
    color: '#9CA3AF'
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
    color: '#4F46E5'
  },
  productMRP: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },
  productStockIndicator: {
    marginTop: 6
  },
  stockIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  stockOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981'
  },
  stockDotOut: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444'
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981'
  },
  stockTextOut: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444'
  }
});

export default ProductListScreen;