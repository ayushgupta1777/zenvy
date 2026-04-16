import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, SectionList, SafeAreaView, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { getImageUrl } from '../../services/api';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    products: [],
    categories: [],
    subcategories: []
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.trim().length > 1) {
      const debounce = setTimeout(() => {
        handleSearch();
        fetchSuggestions();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setResults({ products: [], categories: [], subcategories: [] });
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setShowSuggestions(false);
      const response = await api.get('/search', {
        params: { query }
      });
      setResults(response.data.data);

      // Save to recent searches
      if (query && query.trim() !== '' && !recentSearches.includes(query.trim())) {
        setRecentSearches(prev => [query.trim(), ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/search/suggestions', {
        params: { query }
      });
      setSuggestions(response.data.data);
      setShowSuggestions(response.data.data.length > 0);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch();
  };

  // Handle category press - show subcategories or products
  const handleCategoryPress = async (category) => {
    // Check if this category has subcategories
    if (!category.parent || category.parent === null) {
      // It's a parent category, navigate to SubcategoryList (fixed from CategoryList based on HomeScreen)
      navigation.navigate('SubcategoryList', {
        categoryId: category._id,
        categoryName: category.name
      });
    } else {
      // It's a subcategory, show its products directly
      navigation.navigate('ProductList', {
        subcategoryId: category._id,
        subcategoryName: category.name
      });
    }
  };

  const handleProductPress = (productId) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item._id)}
      activeOpacity={0.7}
    >
      {item.images && item.images.length > 0 ? (
        <Image
          source={{ uri: getImageUrl(item.images[0]) }}
          style={styles.productImage}
        />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Icon name="image-outline" size={24} color="#9CA3AF" />
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {item.mrp > item.price && (
            <Text style={styles.productMRP}>₹{item.mrp}</Text>
          )}
        </View>
        {item.subcategory?.name && (
          <Text style={styles.productCategory}>
            in {item.subcategory.name}
          </Text>
        )}
      </View>

      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>{item.discount}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      {item.image ? (
        <Image
          source={{ uri: getImageUrl(item.image) }}
          style={styles.categoryImage}
        />
      ) : (
        <View style={styles.categoryImagePlaceholder}>
          <Icon name="folder-outline" size={32} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.categoryCardInfo}>
        <Text style={styles.categoryCardName}>{item.name}</Text>
        {item.slug && <Text style={styles.categoryCardSlug}>{item.slug}</Text>}
      </View>
      <Icon name="chevron-forward" size={20} color="#4F46E5" />
    </TouchableOpacity>
  );

  const renderSubcategory = ({ item }) => (
    <TouchableOpacity
      style={styles.subcategoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      {item.image ? (
        <Image
          source={{ uri: getImageUrl(item.image) }}
          style={styles.subcategoryImage}
        />
      ) : (
        <View style={styles.subcategoryImagePlaceholder}>
          <Icon name="folder-outline" size={28} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.subcategoryCardInfo}>
        <View style={styles.subcategoryBadge}>
          <Text style={styles.subcategoryBadgeText}>Subcategory</Text>
        </View>
        <Text style={styles.subcategoryCardName}>{item.name}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#4F46E5" />
    </TouchableOpacity>
  );

  const hasResults =
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.subcategories.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, categories..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (text.length > 1) setShowSuggestions(true);
            }}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Icon
                name={suggestion.type === 'category' ? 'folder-outline' : 'search-outline'}
                size={18}
                color="#6B7280"
              />
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
              <Icon name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : query.trim().length === 0 ? (
        // Empty state with recent searches
        <View style={styles.emptyState}>
          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={() => setRecentSearches([])}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => setQuery(search)}
                >
                  <Icon name="time-outline" size={18} color="#6B7280" />
                  <Text style={styles.recentText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.emptyIconContainer}>
            <Icon name="search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Start typing to search</Text>
            <Text style={styles.emptySubtext}>
              Find products, categories & more
            </Text>
          </View>
        </View>
      ) : !hasResults && !showSuggestions ? (
        // No results state
        <View style={styles.emptyState}>
          <Icon name="sad-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try different keywords</Text>
        </View>
      ) : (
        // Results using SectionList (Fixed)
        <SectionList
          sections={[
            {
              title: `Categories (${results.categories.length})`,
              data: results.categories,
              renderItem: renderCategory
            },
            {
              title: `Subcategories (${results.subcategories.length})`,
              data: results.subcategories,
              renderItem: renderSubcategory
            },
            {
              title: `Products (${results.products.length})`,
              data: results.products,
              renderItem: renderProduct
            }
          ].filter(section => section.data.length > 0)}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.resultsContainer}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
    backgroundColor: '#fff'
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827'
  },
  // Suggestions
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 250
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151'
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
  emptyIconContainer: {
    alignItems: 'center',
    marginTop: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8
  },
  recentSection: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    marginBottom: 40,
    width: '100%'
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  clearText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600'
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  recentText: {
    fontSize: 15,
    color: '#374151'
  },
  resultsContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12
  },
  // Category Card
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  categoryImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryCardInfo: {
    flex: 1,
    marginLeft: 12
  },
  categoryCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  categoryCardSlug: {
    fontSize: 12,
    color: '#6B7280'
  },
  // Subcategory Card
  subcategoryCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  subcategoryImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  subcategoryImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  subcategoryCardInfo: {
    flex: 1,
    marginLeft: 12
  },
  subcategoryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  subcategoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284C7'
  },
  subcategoryCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  // Product Card
  productCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative'
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5'
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
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
  productCategory: {
    fontSize: 12,
    color: '#6B7280'
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff'
  }
});

export default SearchScreen;