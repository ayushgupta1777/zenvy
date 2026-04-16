import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart } from '../../redux/slices/cartSlice';
import { getImageUrl } from '../../services/api';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';


const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, totalPrice, isLoading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [updating, setUpdating] = useState(false);

  // Refresh cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchCart());
    }, [])
  );

  const handleUpdateQuantity = async (itemId, qty, change) => {
    if (updating) return; // Prevent multiple rapid updates

    const newQty = qty + change;
    if (newQty < 1) return;

    try {
      setUpdating(true);
      const item = items.find(i => i._id === itemId);

      await dispatch(updateCartItem({
        itemId,
        quantity: newQty,
        resellPrice: item.resellPrice || 0
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
      console.error('Update quantity error:', error);
    } finally {
      setTimeout(() => setUpdating(false), 500);
    }
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removeFromCart(itemId)).unwrap();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item.');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to cart first.');
      return;
    }

    // Navigate to Cart stack's Checkout screen
    navigation.navigate('Checkout');
  };

  const renderItem = ({ item }) => {
    if (!item.product) return null;

    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: getImageUrl(item.product.images[0]) }} style={styles.img} />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{item.product.title}</Text>
          <Text style={styles.price}>₹{item.finalPrice}</Text>

          <View style={styles.bottom}>
            <View style={styles.qty}>
              <TouchableOpacity
                onPress={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                disabled={updating}
              >
                <Icon name="remove-circle-outline" size={20} color="#4F46E5" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                disabled={updating}
              >
                <Icon name="add-circle-outline" size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => handleRemoveItem(item._id)}>
              <Icon name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="cart-outline" size={64} color="#4F46E5" />
        <Text style={styles.emptyTitle}>Cart Empty</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.navigate('Home', { screen: 'HomeMain' })}
        >
          <Text style={styles.shopBtnText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Cart"
        showBack={true}
      // showCart={true}
      // cartCount={totalItems}
      />
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={{ backgroundColor: '#F8F9FA', height: 1000, position: 'absolute', top: -1000, left: 0, right: 0 }} />
        }
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{totalPrice}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleCheckout}
          disabled={updating || isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
          <Icon name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280'
  },
  listContent: { paddingBottom: 20 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  img: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#111827' },
  price: { fontSize: 16, fontWeight: '700', color: '#4F46E5', marginTop: 4 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyText: { fontSize: 14, fontWeight: '600', color: '#111827', minWidth: 30, textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  shopBtn: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  shopBtnText: { color: '#fff', fontWeight: '600' },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  totalLabel: { fontSize: 15, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#4F46E5' },
  checkoutBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

export default CartScreen;