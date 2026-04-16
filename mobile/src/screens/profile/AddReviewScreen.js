// ============================================
// MyReviewsScreen.js - User's Reviews Management
// mobile/screens/profile/MyReviewsScreen.js
// ============================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const MyReviewsScreen = ({ navigation }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setIsLoading(true);
      // Replace with actual API when ready
      // const response = await api.get('/reviews/my-reviews');
      // setReviews(response.data.data.reviews || []);
      setReviews([]); // Empty for now
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (reviewId) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(reviewId);
              // await api.delete(`/reviews/${reviewId}`);
              setReviews(reviews.filter(r => r._id !== reviewId));
              Alert.alert('Success', 'Review deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete review');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="star-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No Reviews Yet</Text>
        <Text style={styles.emptyText}>
          Start reviewing products you've purchased to help other shoppers!
        </Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.navigate('OrdersList')}
        >
          <Text style={styles.shopBtnText}>View Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Total Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>

        {reviews.map((review) => (
          <View key={review._id} style={styles.reviewCard}>
            {/* Product Info */}
            <TouchableOpacity
              style={styles.productInfo}
              onPress={() => navigation.navigate('ProductDetails', { 
                productId: review.product._id 
              })}
            >
              <Image
                source={{ uri: review.product.images?.[0] }}
                style={styles.productImage}
              />
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {review.product.title}
                </Text>
                {review.verified && (
                  <View style={styles.verifiedBadge}>
                    <Icon name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified Purchase</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Review Content */}
            <View style={styles.reviewContent}>
              <View style={styles.reviewHeader}>
                {renderStars(review.rating)}
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>

              {review.title && (
                <Text style={styles.reviewTitle}>{review.title}</Text>
              )}

              <Text style={styles.reviewComment}>{review.comment}</Text>

              {/* Review Stats */}
              <View style={styles.reviewStats}>
                <View style={styles.statBadge}>
                  <Icon name="thumbs-up-outline" size={14} color="#6B7280" />
                  <Text style={styles.statBadgeText}>
                    {review.helpful || 0} helpful
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('ProductDetails', { 
                  productId: review.product._id 
                })}
              >
                <Icon name="eye-outline" size={18} color="#4F46E5" />
                <Text style={styles.actionBtnText}>View Product</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDelete(review._id)}
                disabled={deletingId === review._id}
              >
                {deletingId === review._id ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <>
                    <Icon name="trash-outline" size={18} color="#EF4444" />
                    <Text style={[styles.actionBtnText, styles.deleteBtnText]}>
                      Delete
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  headerPlaceholder: {
    width: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA'
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  shopBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8
  },
  shopBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 16
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280'
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center'
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500'
  },
  reviewContent: {
    marginBottom: 16
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12
  },
  reviewStats: {
    flexDirection: 'row',
    gap: 12
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  statBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500'
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    borderRadius: 8
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5'
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2'
  },
  deleteBtnText: {
    color: '#EF4444'
  }
});

export default MyReviewsScreen;