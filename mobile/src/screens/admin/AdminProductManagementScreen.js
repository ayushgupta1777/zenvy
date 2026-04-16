import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, TextInput, Image, ScrollView, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { getImageUrl } from '../../services/api';

const AdminProductManagementScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, approved, pending, rejected
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Category Filters
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch Categories on Mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/tree');
      // Root categories don't have a parent, tree returns them at top level
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch Subcategories when Category Changes
  const fetchSubcategories = async (categoryId) => {
    if (!categoryId || categoryId === 'all') {
      setSubcategories([]);
      return;
    }
    try {
      const response = await api.get(`/categories/${categoryId}/subcategories`);
      setSubcategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  };

  // Refresh when screen focuses or filter changes
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchProducts(1, true);
    }, [filter, selectedCategory, selectedSubcategory])
  );

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        setPage(1);
        fetchProducts(1, true, searchQuery);
      } else if (searchQuery === '') {
        // Unconditionally reset if it was cleared
        setPage(1);
        fetchProducts(1, true, '');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchProducts = async (pageNumber = 1, shouldReset = false, currentSearch = searchQuery) => {
    try {
      if (pageNumber === 1) {
        setIsLoading(true);
      } else {
        setIsMoreLoading(true);
      }

      const response = await api.get('/admin/products', {
        params: {
          status: filter !== 'all' ? filter : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
          page: pageNumber,
          limit: 20,
          search: currentSearch || undefined
        }
      });

      const newProducts = response.data.data.products;
      if (shouldReset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setTotalPages(response.data.data.pagination.pages);
      setPage(pageNumber);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isMoreLoading && page < totalPages) {
      fetchProducts(page + 1, false, searchQuery);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts(1, true, searchQuery);
  };

  const handleDelete = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/products/${productId}`);
              Alert.alert('Success', 'Product deleted');
              fetchProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      await api.patch(`/admin/products/${productId}/toggle`, {
        isActive: !currentStatus
      });
      // Update local state to reflect change immediately
      setProducts(prev => prev.map(p =>
        p._id === productId ? { ...p, isActive: !currentStatus } : p
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update product status');
    }
  };

  const handleToggleFeatured = async (productId, currentFeatured) => {
    try {
      const response = await api.patch(`/admin/products/${productId}/featured`, {
        isFeatured: !currentFeatured
      });
      
      if (response.data.success) {
        setProducts(prev => prev.map(p =>
          p._id === productId ? { ...p, isFeatured: !currentFeatured } : p
        ));
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update featured status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6B7280',
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const getActiveFilterLabel = () => {
    if (selectedCategory === 'all') return 'All Categories';
    
    const cat = categories.find(c => c._id === selectedCategory);
    if (!cat) return 'All Categories';

    if (selectedSubcategory === 'all') {
      return cat.name;
    }

    const sub = subcategories.find(s => s._id === selectedSubcategory);
    return sub ? `${cat.name} > ${sub.name}` : cat.name;
  };

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
         <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Category</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <TouchableOpacity
                style={[
                  styles.filterListItem,
                  selectedCategory === 'all' && styles.filterListItemActive
                ]}
                onPress={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                  setSubcategories([]);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterListText,
                  selectedCategory === 'all' && styles.filterListTextActive
                ]}>All Categories</Text>
                {selectedCategory === 'all' && <Icon name="checkmark" size={20} color="#4F46E5" />}
              </TouchableOpacity>

              {categories.map((cat) => (
                <View key={cat._id}>
                  <TouchableOpacity
                    style={[
                      styles.filterListItem,
                      selectedCategory === cat._id && selectedSubcategory === 'all' && styles.filterListItemActive
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat._id);
                      setSelectedSubcategory('all');
                      fetchSubcategories(cat._id);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={[
                      styles.filterListText,
                      selectedCategory === cat._id && selectedSubcategory === 'all' && styles.filterListTextActive
                    ]}>{cat.name}</Text>
                    {selectedCategory === cat._id && selectedSubcategory === 'all' && <Icon name="checkmark" size={20} color="#4F46E5" />}
                  </TouchableOpacity>

                  {/* Show Subcategories if this category is selected */}
                  {selectedCategory === cat._id && subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub._id}
                      style={[
                        styles.filterListSubItem,
                        selectedSubcategory === sub._id && styles.filterListItemActive
                      ]}
                      onPress={() => {
                        setSelectedSubcategory(sub._id);
                        setShowFilterModal(false);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="return-down-forward-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                        <Text style={[
                          styles.filterListText,
                          selectedSubcategory === sub._id && styles.filterListTextActive
                        ]}>{sub.name}</Text>
                      </View>
                      {selectedSubcategory === sub._id && <Icon name="checkmark" size={20} color="#4F46E5" />}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
         </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Management</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Icon name="add-circle" size={28} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            setPage(1);
            fetchProducts(1, true, '');
          }}>
            <Icon name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filters */}
      <View style={{ height: 50, marginTop: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={{ alignItems: 'center', paddingRight: 16 }}
        >
          {['all', 'approved', 'pending', 'rejected'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filter === status && styles.filterChipActive
              ]}
              onPress={() => setFilter(status)}
            >
              <Text style={[
                styles.filterChipText,
                filter === status && styles.filterChipTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Filter Button */}
      <View style={styles.filterBarContainer}>
        <TouchableOpacity 
          style={styles.filterMainButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter-outline" size={20} color="#4F46E5" />
          <Text style={styles.filterMainButtonText} numberOfLines={1}>
            {getActiveFilterLabel()}
          </Text>
          <Icon name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <FilterModal />

      {/* Products List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item: product }) => (
          <View style={styles.productCard}>
            <Image
              source={{ uri: getImageUrl(product.images[0]) }}
              style={styles.productImage}
            />

            <View style={styles.productDetails}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title}
              </Text>
              <View style={styles.productIdRow}>
                <Text style={styles.productIdText}>ID: {product._id}</Text>
                <Text style={styles.productIdText}> | SKU: {product.sku}</Text>
              </View>

              <View style={styles.productMeta}>
                <Text style={styles.productPrice}>₹{product.price}</Text>
                <Text style={styles.productMRP}>₹{product.mrp}</Text>
                <Text style={styles.productDiscount}>{product.discount}% OFF</Text>
              </View>

              <View style={styles.productStats}>
                <View style={styles.statItem}>
                  <Icon name="eye-outline" size={14} color="#6B7280" />
                  <Text style={styles.statText}>{product.viewCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="cart-outline" size={14} color="#6B7280" />
                  <Text style={styles.statText}>{product.soldCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="cube-outline" size={14} color="#6B7280" />
                  <Text style={styles.statText}>Stock: {product.stock}</Text>
                </View>
              </View>

              <View style={styles.productFooter}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(product.status) + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(product.status) }
                  ]}>
                    {product.status.toUpperCase()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.activeToggle, !product.isActive && styles.inactiveToggle]}
                  onPress={() => handleToggleStatus(product._id, product.isActive)}
                >
                  <Icon
                    name={product.isActive ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.activeText}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.featuredToggle, product.isFeatured && styles.featuredToggleActive]}
                  onPress={() => handleToggleFeatured(product._id, product.isFeatured)}
                >
                  <Icon
                    name={product.isFeatured ? 'star' : 'star-outline'}
                    size={16}
                    color={product.isFeatured ? '#fff' : '#4F46E5'}
                  />
                  <Text style={[styles.activeText, { color: product.isFeatured ? '#fff' : '#4F46E5' }]}>
                    {product.isFeatured ? 'Featured' : 'Pin'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('AddProduct', { product })}
              >
                <Icon name="create-outline" size={20} color="#4F46E5" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDelete(product._id)}
              >
                <Icon name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyState}>
              <Icon name="cube-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )
        }
        ListHeaderComponent={
          isLoading && page === 1 ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
          ) : null
        }
        ListFooterComponent={
          isMoreLoading ? (
            <ActivityIndicator size="small" color="#4F46E5" style={{ marginVertical: 20 }} />
          ) : <View style={{ height: 100 }} />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827'
  },
  addBtn: {
    padding: 4
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  searchIcon: {
    marginRight: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827'
  },
  filtersContainer: {
    paddingLeft: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    height: 36, // Explicit height to avoid stretching
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  filterChipTextActive: {
    color: '#fff'
  },
  filterBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterMainButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  productDetails: {
    flex: 1,
    marginLeft: 12
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2
  },
  productIdRow: {
    flexDirection: 'row',
    marginBottom: 6
  },
  productIdText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'monospace'
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  productMRP: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },
  productDiscount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981'
  },
  productStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statText: {
    fontSize: 12,
    color: '#6B7280'
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700'
  },
  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  inactiveToggle: {
    backgroundColor: '#EF4444'
  },
  activeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff'
  },
  featuredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4F46E5'
  },
  featuredToggleActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B'
  },
  productActions: {
    justifyContent: 'space-between'
  },
  actionBtn: {
    padding: 8
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4F46E5',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  filterListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterListSubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  filterListItemActive: {
    backgroundColor: '#EEF2FF',
  },
  filterListText: {
    fontSize: 15,
    color: '#374151',
  },
  filterListTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  }
});

export default AdminProductManagementScreen;