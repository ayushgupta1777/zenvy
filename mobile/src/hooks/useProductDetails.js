import { useState, useEffect, useCallback } from 'react';
import { Alert, Share } from 'react-redux';
import api, { BASE_URL } from '../services/api';
import { fetchProductDetails } from '../redux/slices/productSlice';
import { useDispatch, useSelector } from 'react-redux';

const useProductDetails = (productId) => {
  const dispatch = useDispatch();
  const { selectedProduct: product, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const response = await api.get(`/reviews/product/${productId}`);
      setReviews(response.data.data.reviews);
    } catch (error) {
      console.log('Reviews fetch error:', error);
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  const checkWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/wishlist');
      const wishlist = response.data.data.products;
      setIsInWishlist(wishlist.some(p => p._id === productId));
    } catch (error) {
      console.log('Wishlist check error:', error);
    }
  }, [productId, user]);

  useEffect(() => {
    dispatch(fetchProductDetails(productId));
    checkWishlist();
    fetchReviews();
  }, [productId, dispatch, checkWishlist, fetchReviews]);

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
      } else {
        await api.post('/wishlist', { productId });
        setIsInWishlist(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      const productUrl = `${BASE_URL}/product/${productId}`;
      await Share.share({
        message: `Check out ${product.title} on Zenvy!\nPrice: ₹${product.price}\n${productUrl}`,
        url: productUrl,
        title: product.title
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return {
    product,
    isLoading,
    user,
    quantity,
    setQuantity,
    isInWishlist,
    wishlistLoading,
    toggleWishlist,
    reviews,
    reviewsLoading,
    fetchReviews,
    handleShare
  };
};

export default useProductDetails;
