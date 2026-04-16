// ============================================
// COMPLETE PRODUCT DETAILS WITH WISHLIST + REVIEWS + FULLSCREEN IMAGE
// Mobile: ProductDetailsScreen.js
// ============================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, Modal, TextInput, Dimensions, Share
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { getImageUrl, BASE_URL } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ZoomableImage from '../../components/ZoomableImage';

const screenWidth = Dimensions.get('window').width;

const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Image Gallery
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const scrollRef = React.useRef(null);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { selectedProduct: product, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProductDetails(productId));
    checkWishlist();
    fetchReviews();
  }, [productId]);

  // ============================================
  // WISHLIST FUNCTIONS
  // ============================================
  const checkWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      const wishlist = response.data.data.products;
      setIsInWishlist(wishlist.some(p => p._id === productId));
    } catch (error) {
      console.log('Wishlist check error:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to use wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${productId}`);
        setIsInWishlist(false);
        Alert.alert('Removed', 'Removed from wishlist');
      } else {
        await api.post('/wishlist', { productId });
        setIsInWishlist(true);
        Alert.alert('Added', 'Added to wishlist');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  // ============================================
  // REVIEWS FUNCTIONS
  // ============================================
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await api.get(`/reviews/product/${productId}`);
      setReviews(response.data.data.reviews);
    } catch (error) {
      console.log('Reviews fetch error:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to write a review');
      return;
    }

    if (!reviewForm.comment.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment
      });

      Alert.alert('Success', 'Review submitted successfully!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchReviews();
      dispatch(fetchProductDetails(productId)); // Refresh to get updated rating
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, size = 16, interactive = false, onPress) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && onPress && onPress(star)}
          >
            <Icon
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color="#FFB800"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // ============================================
  // ADD TO CART
  // ============================================
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAdding(true);
    try {
      const result = await dispatch(addToCart({
        productId: product._id,
        quantity,
        resellPrice: 0
      }));

      if (result.type === 'cart/addToCart/fulfilled') {
        Alert.alert(
          'Success!',
          'Product added to cart',
          [
            { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
            { text: 'Continue Shopping', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    try {
      const productUrl = `${BASE_URL}/product/${productId}`;
      const result = await Share.share({
        message: `Check out this product: ${product.title}\n\nPrice: ₹${product.price}\n\nView here: ${productUrl}`,
        url: productUrl,
        title: product.title
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share product');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const productImages = product.images || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* Header with Wishlist */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={28} color="#111827" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={handleShare}>
              <Icon name="share-social-outline" size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleWishlist} disabled={wishlistLoading}>
              {wishlistLoading ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Icon
                  name={isInWishlist ? 'heart' : 'heart-outline'}
                  size={28}
                  color={isInWishlist ? '#FF3B30' : '#111827'}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Enhanced Image Section */}
          <View style={styles.imageContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedImageIndex(0);
                setShowFullscreenImage(true);
              }}
            >
              <Image
                source={{ uri: getImageUrl(productImages[0]) }}
                style={styles.mainImage}
              />
              {/* Fullscreen Icon */}
              <View style={styles.fullscreenBadge}>
                <Icon name="expand-outline" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailsScroll}
              >
                {productImages.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedImageIndex(index);
                      setShowFullscreenImage(true);
                    }}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailActive
                    ]}
                  >
                    <Image
                      source={{ uri: getImageUrl(image) }}
                      style={styles.thumbnailImage}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Details */}
          <View style={styles.details}>
            <Text style={styles.title}>{product.title}</Text>

            {/* SKU Display */}
            {product.sku && (
              <View style={styles.skuRow}>
                <Text style={styles.skuLabel}>SKU: </Text>
                <Text style={styles.skuValue}>{product.sku}</Text>
              </View>
            )}

            {/* Rating */}
            {product.averageRating > 0 && (
              <View style={styles.ratingRow}>
                {renderStars(product.averageRating)}
                <Text style={styles.ratingText}>
                  {product.averageRating.toFixed(1)} ({product.totalReviews || 0} reviews)
                </Text>
              </View>
            )}

            {/* Price */}
            <View style={styles.priceBox}>
              <Text style={styles.price}>₹{product.price}</Text>
              {product.mrp > product.price && (
                <>
                  <Text style={styles.mrp}>₹{product.mrp}</Text>
                  <Text style={styles.discount}>{product.discount}% OFF</Text>
                </>
              )}
            </View>

            {/* Description */}
            {product.description && (
              <View style={styles.descBox}>
                <Text style={styles.descTitle}>Description</Text>
                <Text style={styles.description}>{product.description}</Text>
              </View>
            )}

            {/* Stock */}
            <View style={styles.stockBox}>
              {product.stock > 0 ? (
                <>
                  <Icon name="checkmark-circle" size={18} color="#10B981" />
                  <Text style={styles.inStock}>In Stock ({product.stock} available)</Text>
                </>
              ) : (
                <>
                  <Icon name="close-circle" size={18} color="#EF4444" />
                  <Text style={styles.outOfStock}>Out of Stock</Text>
                </>
              )}
            </View>

            {/* Reviews Section */}
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.reviewsTitle}>
                  Customer Reviews ({reviews.length})
                </Text>
                <TouchableOpacity
                  style={styles.writeReviewBtn}
                  onPress={() => setShowReviewModal(true)}
                >
                  <Icon name="create-outline" size={18} color="#4F46E5" />
                  <Text style={styles.writeReviewText}>Write Review</Text>
                </TouchableOpacity>
              </View>

              {reviewsLoading ? (
                <ActivityIndicator color="#4F46E5" style={{ marginTop: 20 }} />
              ) : reviews.length === 0 ? (
                <View style={styles.noReviews}>
                  <Icon name="star-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.noReviewsText}>No reviews yet</Text>
                  <Text style={styles.noReviewsSubtext}>Be the first to review!</Text>
                </View>
              ) : (
                reviews.map((review) => (
                  <View key={review._id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View>
                        <Text style={styles.reviewerName}>
                          {review.user?.name || 'Anonymous'}
                        </Text>
                        {renderStars(review.rating, 14)}
                      </View>
                      {review.verified && (
                        <View style={styles.verifiedBadge}>
                          <Icon name="checkmark-circle" size={14} color="#10B981" />
                          <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                      )}
                    </View>
                    {review.title && (
                      <Text style={styles.reviewTitle}>{review.title}</Text>
                    )}
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {/* Quantity */}
          <View style={styles.quantityBox}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isAdding}
            >
              <Icon name="remove-circle-outline" size={28} color="#4F46E5" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={isAdding || quantity >= product.stock}
            >
              <Icon name="add-circle-outline" size={28} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            style={[
              styles.addBtn,
              (isAdding || product.stock === 0) && styles.addBtnDisabled
            ]}
            onPress={handleAddToCart}
            disabled={isAdding || product.stock === 0}
          >
            {isAdding ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="cart-outline" size={20} color="#fff" />
                <Text style={styles.addBtnText}>
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Fullscreen Image Viewer Modal */}
        <Modal
          visible={showFullscreenImage}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowFullscreenImage(false);
            setIsZoomed(false);
          }}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.fullscreenContainer}>
              {/* Header */}
              <View style={styles.fullscreenHeader}>
                <TouchableOpacity onPress={() => {
                  setShowFullscreenImage(false);
                  setIsZoomed(false);
                }}>
                  <Icon name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.fullscreenCounter}>
                  {selectedImageIndex + 1} / {productImages.length}
                </Text>
                <View style={{ width: 28 }} />
              </View>

              {/* Main Image */}
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled={!isZoomed}
                scrollEnabled={!isZoomed}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / screenWidth
                  );
                  setSelectedImageIndex(index);
                }}
                scrollIndicatorInsets={{ right: 1 }}
              >
                {productImages.map((image, index) => (
                  <View key={index} style={{ width: screenWidth }}>
                    <ZoomableImage
                      uri={getImageUrl(image)}
                      style={styles.fullscreenImage}
                      resizeMode="contain"
                      onZoomChange={setIsZoomed}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <TouchableOpacity
                    style={[styles.arrowButton, styles.arrowLeft]}
                    onPress={() => {
                      const newIndex = Math.max(0, selectedImageIndex - 1);
                      setSelectedImageIndex(newIndex);
                      scrollRef.current?.scrollTo({ x: newIndex * screenWidth, animated: true });
                    }}
                  >
                    <Icon name="chevron-back" size={32} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.arrowButton, styles.arrowRight]}
                    onPress={() => {
                      const newIndex = Math.min(
                        productImages.length - 1,
                        selectedImageIndex + 1
                      );
                      setSelectedImageIndex(newIndex);
                      scrollRef.current?.scrollTo({ x: newIndex * screenWidth, animated: true });
                    }}
                  >
                    <Icon name="chevron-forward" size={32} color="#fff" />
                  </TouchableOpacity>
                </>
              )}

              {/* Thumbnail Gallery at Bottom */}
              {productImages.length > 1 && (
                <View style={styles.fullscreenThumbnails}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {productImages.map((image, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedImageIndex(index);
                          scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
                        }}
                        style={[
                          styles.fullscreenThumbnail,
                          selectedImageIndex === index && styles.fullscreenThumbnailActive
                        ]}
                      >
                        <Image
                          source={{ uri: getImageUrl(image) }}
                          style={styles.fullscreenThumbnailImage}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </SafeAreaView>
          </GestureHandlerRootView>
        </Modal>

        {/* Review Modal */}
        <Modal
          visible={showReviewModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowReviewModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Write a Review</Text>
                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Rating */}
                <Text style={styles.modalLabel}>Rating</Text>
                <View style={styles.modalRating}>
                  {renderStars(reviewForm.rating, 32, true, (rating) =>
                    setReviewForm({ ...reviewForm, rating })
                  )}
                </View>

                {/* Title */}
                <Text style={styles.modalLabel}>Title (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Summary of your review"
                  value={reviewForm.title}
                  onChangeText={(text) => setReviewForm({ ...reviewForm, title: text })}
                  maxLength={100}
                />

                {/* Comment */}
                <Text style={styles.modalLabel}>Review *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Share your experience with this product..."
                  value={reviewForm.comment}
                  onChangeText={(text) => setReviewForm({ ...reviewForm, comment: text })}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  onPress={submitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitReviewText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#6B7280', marginTop: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  imageContainer: {
    backgroundColor: '#F9FAFB',
    paddingBottom: 12
  },
  mainImage: {
    width: '100%',
    height: 420,
    backgroundColor: '#F3F4F6'
  },
  fullscreenBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  thumbnailsScroll: {
    paddingHorizontal: 12,
    paddingTop: 12
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden'
  },
  thumbnailActive: {
    borderColor: '#4F46E5'
  },
  thumbnailImage: {
    width: '100%',
    height: '100%'
  },
  details: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  skuRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  skuLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  skuValue: { fontSize: 12, fontWeight: '700', color: '#111827' },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingText: { fontSize: 14, color: '#6B7280', marginLeft: 4 },
  priceBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  price: { fontSize: 24, fontWeight: '700', color: '#4F46E5' },
  mrp: { fontSize: 16, color: '#9CA3AF', textDecorationLine: 'line-through' },
  discount: { fontSize: 12, fontWeight: '600', color: '#EF4444', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  descBox: { marginBottom: 16 },
  descTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  stockBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  inStock: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  outOfStock: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  reviewsSection: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 24 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewsTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  writeReviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EEF2FF', borderRadius: 6 },
  writeReviewText: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  noReviews: { alignItems: 'center', paddingVertical: 40 },
  noReviewsText: { fontSize: 16, fontWeight: '600', color: '#9CA3AF', marginTop: 12 },
  noReviewsSubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  reviewCard: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 14, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  verifiedText: { fontSize: 11, fontWeight: '600', color: '#10B981' },
  reviewTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  reviewComment: { fontSize: 13, color: '#4B5563', marginBottom: 8, lineHeight: 18 },
  reviewDate: { fontSize: 11, color: '#9CA3AF' },
  footer: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' },
  quantityBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityText: { fontSize: 16, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  addBtn: { flex: 1, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  addBtnDisabled: { opacity: 0.6 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  fullscreenCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  fullscreenImage: {
    width: screenWidth,
    height: '100%',
    backgroundColor: '#000'
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  arrowLeft: {
    left: 16
  },
  arrowRight: {
    right: 16
  },
  fullscreenThumbnails: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  fullscreenThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden'
  },
  fullscreenThumbnailActive: {
    borderColor: '#4F46E5'
  },
  fullscreenThumbnailImage: {
    width: '100%',
    height: '100%'
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalBody: { padding: 20 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  modalRating: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 15, color: '#111827', marginBottom: 16 },
  modalTextArea: { height: 120 },
  submitReviewBtn: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitReviewText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

export default ProductDetailsScreen;