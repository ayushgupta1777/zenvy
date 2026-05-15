import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput, Dimensions
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import api, { getImageUrl } from '../../services/api';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchProductDetails } from '../../redux/slices/productSlice';
import ZoomableImage from '../../components/ZoomableImage';
import styles from './ProductDetailsScreen.Styles';
import useProductDetails from '../../hooks/useProductDetails';

const screenWidth = Dimensions.get('window').width;

const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const dispatch = useDispatch();
  const {
    product, isLoading, user, quantity, setQuantity,
    isInWishlist, wishlistLoading, toggleWishlist,
    reviews, reviewsLoading, fetchReviews, handleShare
  } = useProductDetails(productId);

  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const scrollRef = useRef(null);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      const result = await dispatch(addToCart({ productId: product._id, quantity, resellPrice: 0 }));
      if (result.type === 'cart/addToCart/fulfilled') {
        Alert.alert('Success!', 'Product added to cart', [
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
          { text: 'Continue Shopping', style: 'cancel' }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const submitReview = async () => {
    if (!user) return Alert.alert('Login Required', 'Please login to write a review');
    if (!reviewForm.comment.trim()) return Alert.alert('Error', 'Please write a review');

    setSubmittingReview(true);
    try {
      await api.post('/reviews', { productId, ...reviewForm });
      Alert.alert('Success', 'Review submitted successfully!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchReviews();
      dispatch(fetchProductDetails(productId));
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, size = 16, interactive = false) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
            key={star} 
            disabled={!interactive} 
            onPress={() => interactive && setReviewForm(prev => ({ ...prev, rating: star }))}
        >
          <Icon name={star <= rating ? 'star' : 'star-outline'} size={size} color="#FFB800" />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  if (!product) return <View style={styles.errorContainer}><Icon name="alert-circle-outline" size={48} color="#EF4444" /><Text style={styles.errorText}>Product not found</Text></View>;

  const productImages = product.images || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="chevron-back" size={28} color="#111827" /></TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={handleShare}><Icon name="share-social-outline" size={24} color="#111827" /></TouchableOpacity>
          <TouchableOpacity onPress={toggleWishlist} disabled={wishlistLoading}>
            {wishlistLoading ? <ActivityIndicator size="small" color="#FF3B30" /> : <Icon name={isInWishlist ? 'heart' : 'heart-outline'} size={28} color={isInWishlist ? '#FF3B30' : '#111827'} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => { setSelectedImageIndex(0); setShowFullscreenImage(true); }}>
            <Image source={{ uri: getImageUrl(productImages[0]) }} style={styles.mainImage} />
            <View style={styles.fullscreenBadge}><Icon name="expand-outline" size={20} color="#fff" /></View>
          </TouchableOpacity>

          {productImages.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsScroll}>
              {productImages.map((img, idx) => (
                <TouchableOpacity key={idx} onPress={() => { setSelectedImageIndex(idx); setShowFullscreenImage(true); }} style={[styles.thumbnail, selectedImageIndex === idx && styles.thumbnailActive]}>
                  <Image source={{ uri: getImageUrl(img) }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.title}>{product.title}</Text>
          {product.sku && <View style={styles.skuRow}><Text style={styles.skuLabel}>SKU: </Text><Text style={styles.skuValue}>{product.sku}</Text></View>}
          <View style={styles.ratingRow}>{renderStars(product.averageRating)}<Text style={styles.ratingText}>{product.averageRating?.toFixed(1)} ({product.totalReviews || 0} reviews)</Text></View>

          <View style={styles.priceBox}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.mrp > product.price && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.mrp}>₹{product.mrp}</Text>
                <View style={styles.discountBadge}><Text style={styles.discountText}>{product.discount}% OFF</Text></View>
              </View>
            )}
          </View>

          <View style={styles.descBox}><Text style={styles.descTitle}>Description</Text><Text style={styles.description}>{product.description}</Text></View>

          <View style={styles.stockBox}>
            {product.stock > 0 ? (
              <><Icon name="checkmark-circle" size={18} color="#10B981" /><Text style={styles.inStock}>In Stock ({product.stock} available)</Text></>
            ) : (
              <><Icon name="close-circle" size={18} color="#EF4444" /><Text style={styles.outOfStock}>Out of Stock</Text></>
            )}
          </View>

          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Customer Reviews ({reviews.length})</Text>
              <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setShowReviewModal(true)}>
                <Icon name="create-outline" size={18} color="#4F46E5" /><Text style={styles.writeReviewText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            {reviewsLoading ? <ActivityIndicator color="#4F46E5" /> : reviews.map((rev) => (
              <View key={rev._id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}><Text style={styles.reviewerName}>{rev.user?.name || 'Anonymous'}</Text><Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text></View>
                {renderStars(rev.rating, 14)}
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityBox}>
          <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}><Icon name="remove-circle-outline" size={28} color="#4F46E5" /></TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}><Icon name="add-circle-outline" size={28} color="#4F46E5" /></TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.addBtn, (isAdding || product.stock === 0) && styles.addBtnDisabled]} onPress={handleAddToCart} disabled={isAdding || product.stock === 0}>
          {isAdding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</Text>}
        </TouchableOpacity>
      </View>

      {/* Fullscreen Image Modal */}
      <Modal visible={showFullscreenImage} transparent animationType="fade">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={styles.fullscreenContainer}>
            <View style={styles.fullscreenHeader}>
              <TouchableOpacity onPress={() => setShowFullscreenImage(false)}><Icon name="close" size={28} color="#fff" /></TouchableOpacity>
              <Text style={styles.fullscreenCounter}>{selectedImageIndex + 1} / {productImages.length}</Text>
              <View style={{ width: 28 }} />
            </View>
            <ScrollView ref={scrollRef} horizontal pagingEnabled={!isZoomed} scrollEnabled={!isZoomed} onMomentumScrollEnd={(e) => setSelectedImageIndex(Math.round(e.nativeEvent.contentOffset.x / screenWidth))}>
              {productImages.map((img, idx) => (
                <View key={idx} style={{ width: screenWidth }}>
                  <ZoomableImage uri={getImageUrl(img)} style={styles.fullscreenImage} resizeMode="contain" onZoomChange={setIsZoomed} />
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </GestureHandlerRootView>
      </Modal>

      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Write a Review</Text><TouchableOpacity onPress={() => setShowReviewModal(false)}><Icon name="close" size={24} color="#6B7280" /></TouchableOpacity></View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Rating</Text>
              <View style={{ marginBottom: 20 }}>{renderStars(reviewForm.rating, 32, true)}</View>
              <Text style={styles.modalLabel}>Review *</Text>
              <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Share your experience..." value={reviewForm.comment} onChangeText={(t) => setReviewForm({ ...reviewForm, comment: t })} multiline numberOfLines={5} />
              <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={submittingReview}>
                {submittingReview ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Review</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;