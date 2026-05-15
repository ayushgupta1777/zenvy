import { useState, useEffect, useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import api from '../services/api';

const useHomeData = () => {
  const dispatch = useDispatch();
  
  const [bannerIndex, setBannerIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const fetchBanners = useCallback(async () => {
    try {
      const response = await api.get('/banners');
      setBanners(response.data.data.banners);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      const topLevelCategories = response.data.data.categories.filter(cat =>
        !cat.parent || cat.parent === null
      );
      setCategories(topLevelCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await api.get('/products/featured');
      setFeaturedProducts(response.data.data.products);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  }, []);

  const fetchNotificationCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Fetch data independently to avoid blocking UI (Lazy Loading)
    fetchBanners();
    fetchCategories();
    fetchFeaturedProducts();
    fetchNotificationCount();
    
    setIsInitialLoading(false);
  }, [dispatch, fetchBanners, fetchCategories, fetchFeaturedProducts, fetchNotificationCount]);

  return {
    banners,
    categories,
    featuredProducts,
    unreadCount,
    isInitialLoading,
    bannerIndex,
    setBannerIndex,
    fadeAnim,
    slideAnim,
    refresh: () => {
        setIsInitialLoading(true);
        return Promise.all([
            fetchBanners(),
            fetchCategories(),
            fetchFeaturedProducts(),
            fetchNotificationCount()
        ]).finally(() => setIsInitialLoading(false));
    }
  };
};

export default useHomeData;
