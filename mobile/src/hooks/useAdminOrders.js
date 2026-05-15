import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useAdminOrders = (filter, timeframe) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/orders', {
        params: { 
          status: filter !== 'all' ? filter : undefined,
          timeframe: timeframe !== 'all' ? timeframe : undefined
        }
      });
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, timeframe]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/orders/stats', {
        params: { timeframe: timeframe !== 'all' ? timeframe : undefined }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  return {
    orders,
    stats,
    isLoading,
    refresh: fetchOrders
  };
};

export default useAdminOrders;
