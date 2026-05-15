import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useProductList = (categoryId, subcategoryId, initialSort = 'popular') => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(initialSort);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const getSortParam = (sort) => {
    const sortMap = {
      popular: '-soldCount',
      price_asc: 'price',
      price_desc: '-price',
      newest: '-createdAt',
      rating: '-averageRating'
    };
    return sortMap[sort] || '-soldCount';
  };

  const fetchProductsList = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        sort: getSortParam(sortBy),
        page,
        limit: 20
      };

      if (searchQuery) params.search = searchQuery;
      if (subcategoryId) params.subcategory = subcategoryId;
      else if (categoryId) params.category = categoryId;

      const response = await api.get('/products', { params });
      if (page === 1) {
        setProducts(response.data.data.products);
      } else {
        setProducts(prev => [...prev, ...response.data.data.products]);
      }
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, subcategoryId, searchQuery, sortBy]);

  useEffect(() => {
    fetchProductsList(1);
  }, [fetchProductsList]);

  return {
    products,
    isLoading,
    pagination,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    refresh: () => fetchProductsList(1),
    loadMore: () => {
      if (pagination.page < pagination.pages && !isLoading) {
        fetchProductsList(pagination.page + 1);
      }
    }
  };
};

export default useProductList;
