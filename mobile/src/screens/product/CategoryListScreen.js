import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { getImageUrl } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import { BannerSkeleton } from '../../components/common/SkeletonLoader';
import styles from './CategoryListScreen.Styles';

const CategoryListScreen = ({ navigation, route }) => {
  const { parentCategoryId } = route.params || {};
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (parentCategoryId) fetchCategoryAndSubcategories();
  }, [parentCategoryId]);

  const fetchCategoryAndSubcategories = async () => {
    try {
      setIsLoading(true);
      const categoryResponse = await api.get(`/categories`);
      const allCategories = categoryResponse.data.data.categories;
      const parentCat = allCategories.find(cat => cat._id === parentCategoryId);
      setCategory(parentCat);
      const subResponse = await api.get(`/products/categories/${parentCategoryId}/subcategories`);
      setSubcategories(subResponse.data.data.subcategories);
    } catch (error) {
      console.error('Failed to fetch category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Loading..." showBack />
        <ScrollView showsVerticalScrollIndicator={false}>
          <BannerSkeleton />
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonLine1} />
            <View style={styles.skeletonLine2} />
            <View style={styles.skeletonLine3} />
          </View>
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map(i => <View key={i} style={styles.skeletonItem} />)}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={category?.name || 'Category'} showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {category?.image && (
          <Image source={{ uri: getImageUrl(category.image) }} style={styles.categoryBanner} resizeMode="cover" />
        )}

        {category?.description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.description}>{category.description}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('ProductList', { categoryId: parentCategoryId, categoryName: category?.name })} activeOpacity={0.8}>
          <Icon name="grid" size={18} color="#fff" />
          <Text style={styles.viewAllBtnText}>View All {category?.name}</Text>
          <Icon name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subcategories ({subcategories.length})</Text>
          {subcategories.length === 0 ? (
            <View style={styles.emptyState}><Icon name="folder-open-outline" size={48} color="#D1D5DB" /><Text style={styles.emptyText}>No subcategories found</Text></View>
          ) : (
            <FlatList
              data={subcategories}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.subcategoryCard} onPress={() => navigation.navigate('ProductList', { subcategoryId: item._id, subcategoryName: item.name })} activeOpacity={0.7}>
                  {item.image ? <Image source={{ uri: getImageUrl(item.image) }} style={styles.subcategoryImage} /> : <View style={styles.subcategoryImagePlaceholder}><Icon name="image-outline" size={32} color="#9CA3AF" /></View>}
                  <View style={styles.subcategoryInfo}>
                    <Text style={styles.subcategoryName}>{item.name}</Text>
                    <Text style={styles.subcategorySlug}>{item.slug}</Text>
                    {item.description && <Text style={styles.subcategoryDesc} numberOfLines={2}>{item.description}</Text>}
                  </View>
                  <View style={styles.arrowIcon}><Icon name="chevron-forward" size={24} color="#4F46E5" /></View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
            />
          )}
        </View>
        <View style={styles.spacer40} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CategoryListScreen;