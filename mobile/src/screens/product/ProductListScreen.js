import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  TextInput, ScrollView, RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getImageUrl } from '../../services/api';
import CustomHeader from '../../components/CustomHeader';
import styles from './ProductListScreen.Styles';
import useProductList from '../../hooks/useProductList';

const ProductListScreen = ({ route, navigation }) => {
  const { categoryId, categoryName, subcategoryId, subcategoryName } = route.params || {};

  const {
    products,
    isLoading,
    pagination,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    refresh,
    loadMore
  } = useProductList(categoryId, subcategoryId);

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
        {item.images?.length > 0 ? (
          <Image source={{ uri: getImageUrl(item.images[0]) }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}><Icon name="image-outline" size={32} color="#9CA3AF" /></View>
        )}
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{item.discount}%</Text>
            <Text style={styles.discountLabel}>OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        {item.averageRating > 0 && (
          <View style={styles.productRating}>
            <Icon name="star" size={13} color="#FF9500" /><Text style={styles.productRatingText}>{item.averageRating.toFixed(1)}</Text>
            <Text style={styles.productReviewCount}>({item.reviewCount || 0})</Text>
          </View>
        )}
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {item.mrp > item.price && <Text style={styles.productMRP}>₹{item.mrp}</Text>}
        </View>
        <View style={styles.productStockIndicator}>
          {item.stock > 0 ? (
            <View style={styles.stockIn}><View style={styles.stockDot} /><Text style={styles.stockText}>In Stock</Text></View>
          ) : (
            <View style={styles.stockOut}><View style={styles.stockDotOut} /><Text style={styles.stockTextOut}>Out of Stock</Text></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={subcategoryName || categoryName || 'Products'} showBack showSearch />

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
            <TouchableOpacity onPress={() => setSearchQuery('')}><Icon name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Icon name={showFilters ? 'close' : 'filter-outline'} size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sortChip, sortBy === opt.value && styles.sortChipActive]}
                onPress={() => setSortBy(opt.value)}
              >
                <Text style={[styles.sortChipText, sortBy === opt.value && styles.sortChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>{pagination.total || 0} Products Found</Text>
      </View>

      {products.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Icon name="search-outline" size={56} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridWrapper}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#4F46E5" />}
        />
      )}
    </SafeAreaView>
  );
};

export default ProductListScreen;