import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  ActivityIndicator, StyleSheet, SafeAreaView, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { getImageUrl } from '../../services/api';

const { width } = Dimensions.get('window');

const SubcategoryListScreen = ({ route }) => {
  const { categoryId, categoryName } = route.params;
  const navigation = useNavigation();

  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubcategories();
  }, [categoryId]);

  const fetchSubcategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/categories', {
        params: { parent: categoryId }
      });
      setSubcategories(response.data.data.categories);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSubcategory = ({ item }) => (
    <TouchableOpacity
      style={styles.subcategoryCard}
      onPress={() => navigation.navigate('ProductList', {
        subcategoryId: item._id,
        subcategoryName: item.name,
        categoryName: categoryName
      })}
      activeOpacity={0.9}
    >
      {/* Black Background with Gold Border */}
      <View style={styles.cardInner}>
        {/* Product Image on Left */}
        <View style={styles.imageSection}>
          <View style={styles.imageBorder}>
            {item.image ? (
              <Image
                source={{ uri: getImageUrl(item.image) }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="image-outline" size={48} color="#D4AF37" />
              </View>
            )}
          </View>
        </View>

        {/* Text Section on Right */}
        <View style={styles.textSection}>
          <Text style={styles.subcategoryTitle}>{item.name}</Text>
          <Text style={styles.exclusiveText}>Exclusive Collections</Text>

          {/* Explore More Button */}
          <View style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explore More</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading collections...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Subcategories List */}
      {subcategories.length > 0 ? (
        <FlatList
          data={subcategories}
          renderItem={renderSubcategory}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="folder-open-outline" size={64} color="#D4AF37" />
          <Text style={styles.emptyText}>No collections found</Text>
          <Text style={styles.emptySubtext}>
            New collections will be added soon for {categoryName}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },

  // Premium Card Styles - Like Client Reference
  subcategoryCard: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 180,
  },

  // Image Section (Left Side)
  imageSection: {
    width: width * 0.4,

    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBorder: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text Section (Right Side)
  textSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  subcategoryTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  exclusiveText: {
    fontSize: 13,
    color: '#A0A0A0',
    marginBottom: 20,
    fontWeight: '400',
    letterSpacing: 1,
  },
  exploreButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  exploreButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SubcategoryListScreen;