import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { getImageUrl } from '../../services/api';
import CustomHeader from '../../components/CustomHeader';

const WishlistScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch wishlist directly
  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      setItems(res.data.data.products || []);
    } catch (err) {
      console.log('Wishlist error:', err?.response?.data || err.message);
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  // ✅ Remove item
  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        style={styles.productContent}
        onPress={() =>
          navigation.navigate('ProductDetails', { productId: item._id })
        }
      >
        <Image
          source={{ uri: getImageUrl(item.images?.[0]) }}
          style={styles.productImage}
        />

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {item.stock === 0 && (
            <Text style={styles.outOfStock}>Out of Stock</Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemove(item._id)}
      >
        <Icon name="trash-outline" size={22} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Icon name="heart-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyText}>Your wishlist is empty</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <CustomHeader title="My Wishlist" showBack={true} />
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6B7280'
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2
  },
  productContent: {
    flexDirection: 'row',
    flex: 1
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12
  },
  productInfo: {
    flex: 1
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600'
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 6
  },
  outOfStock: {
    color: '#EF4444',
    marginTop: 4
  },
  removeBtn: {
    padding: 8
  }
});
