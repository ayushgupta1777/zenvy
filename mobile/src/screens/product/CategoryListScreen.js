import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const CategoryListScreen = ({ navigation, route }) => {
  const { parentCategoryId } = route.params || {};
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (parentCategoryId) {
      fetchCategoryAndSubcategories();
    }
  }, [parentCategoryId]);

  const fetchCategoryAndSubcategories = async () => {
    try {
      setIsLoading(true);
      // Fetch parent category details
      const categoryResponse = await api.get(`/categories`);
      const allCategories = categoryResponse.data.data.categories;
      const parentCat = allCategories.find(cat => cat._id === parentCategoryId);
      setCategory(parentCat);

      // Fetch subcategories
      const subResponse = await api.get(`/products/categories/${parentCategoryId}/subcategories`);
      setSubcategories(subResponse.data.data.subcategories);
    } catch (error) {
      console.error('Failed to fetch category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubcategoryPress = (subcategory) => {
    navigation.navigate('ProductList', {
      subcategoryId: subcategory._id,
      subcategoryName: subcategory.name
    });
  };

  const handleShowAllProducts = () => {
    // Show all products in this parent category and its subcategories
    navigation.navigate('ProductList', {
      categoryId: parentCategoryId,
      categoryName: category?.name
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category?.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category Banner */}
        {category?.image && (
          <Image
            source={{ uri: getImageUrl(category.image) }}
            style={styles.categoryBanner}
            resizeMode="cover"
          />
        )}

        {/* Category Description */}
        {category?.description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.description}>{category.description}</Text>
          </View>
        )}

        {/* View All Products Button */}
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={handleShowAllProducts}
          activeOpacity={0.8}
        >
          <Icon name="grid" size={18} color="#fff" />
          <Text style={styles.viewAllBtnText}>View All {category?.name}</Text>
          <Icon name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>

        {/* Subcategories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Subcategories ({subcategories.length})
          </Text>

          {subcategories.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="folder-open-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No subcategories found</Text>
            </View>
          ) : (
            <FlatList
              data={subcategories}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.subcategoryCard}
                  onPress={() => handleSubcategoryPress(item)}
                  activeOpacity={0.7}
                >
                  {item.image ? (
                    <Image
                      source={{ uri: getImageUrl(item.image) }}
                      style={styles.subcategoryImage}
                    />
                  ) : (
                    <View style={styles.subcategoryImagePlaceholder}>
                      <Icon name="image-outline" size={32} color="#9CA3AF" />
                    </View>
                  )}

                  <View style={styles.subcategoryInfo}>
                    <Text style={styles.subcategoryName}>{item.name}</Text>
                    <Text style={styles.subcategorySlug}>{item.slug}</Text>
                    {item.description && (
                      <Text
                        style={styles.subcategoryDesc}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>

                  <View style={styles.arrowIcon}>
                    <Icon name="chevron-forward" size={24} color="#4F46E5" />
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center'
  },
  categoryBanner: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6'
  },
  descriptionBox: {
    padding: 16,
    backgroundColor: '#EEF2FF',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8
  },
  description: {
    fontSize: 14,
    color: '#4F46E5',
    lineHeight: 20
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8
  },
  viewAllBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff'
  },
  section: {
    padding: 16,
    marginTop: 12,
    backgroundColor: '#fff'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12
  },
  subcategoryCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  subcategoryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  subcategoryImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  subcategoryInfo: {
    flex: 1,
    marginLeft: 12
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  subcategorySlug: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6
  },
  subcategoryDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18
  },
  arrowIcon: {
    marginLeft: 8
  }
});

export default CategoryListScreen;