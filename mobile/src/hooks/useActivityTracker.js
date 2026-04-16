import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigationState } from '@react-navigation/native';
import { getSocket } from '../services/socket';

// Map raw route names → human-readable labels + intent level
const SCREEN_MAP = {
  // Home
  HomeMain:         { label: 'Browsing Home',       intent: 'low' },
  Search:           { label: 'Searching Products',  intent: 'medium' },
  Notifications:    { label: 'Reading Notifications', intent: 'low' },
  CategoryList:     { label: 'Browsing Categories', intent: 'low' },
  SubcategoryList:  { label: 'Browsing Subcategory', intent: 'low' },

  // Products
  ProductList:      { label: 'Browsing Products',   intent: 'low' },
  ProductDetails:   { label: 'Viewing Product',     intent: 'medium' },
  ShareProduct:     { label: 'Sharing a Product',   intent: 'medium' },

  // Cart & Checkout — HIGH INTENT
  Cart:             { label: '🛒 Viewing Cart',      intent: 'high' },
  Checkout:         { label: '🔥 On Checkout',       intent: 'high' },
  Payment:          { label: '💳 On Payment Screen', intent: 'critical' },
  PaymentGateway:   { label: '💳 Making Payment',    intent: 'critical' },
  OrderSuccess:     { label: '✅ Order Placed!',     intent: 'critical' },

  // Orders
  Orders:           { label: 'Checking Orders',     intent: 'low' },
  OrderDetails:     { label: 'Viewing Order Detail', intent: 'low' },
  OrderTracking:    { label: 'Tracking Shipment',   intent: 'low' },

  // Profile
  Profile:          { label: 'On Profile Page',     intent: 'low' },
  EditProfile:      { label: 'Editing Profile',     intent: 'low' },
  Addresses:        { label: 'Managing Addresses',  intent: 'medium' },
  Wishlist:         { label: 'Viewing Wishlist',    intent: 'medium' },

  // Reseller
  ResellerHub:      { label: 'On Reseller Hub',     intent: 'low' },
  WithdrawRequest:  { label: '💰 Requesting Payout', intent: 'high' },

  // Support
  UserChat:         { label: 'In Support Chat',     intent: 'low' },
};

export const INTENT_COLORS = {
  low:      '#fff',
  medium:   '#FFD60A',
  high:     '#FF9500',
  critical: '#FF3B30',
};

export const getScreenInfo = (rawName) => {
  return SCREEN_MAP[rawName] || { label: rawName, intent: 'low' };
};

/**
 * Hook to track user activity and send to developer terminal
 */
export const useActivityTracker = (productId = null, productTitle = null) => {
  const { user } = useSelector((state) => state.auth);
  const state = useNavigationState(s => s);
  const lastScreen = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Walk the full navigation state to get deepest active screen
    const getDeepestScreen = (navState) => {
      if (!navState) return 'Unknown';
      const route = navState.routes[navState.index];
      if (route?.state) return getDeepestScreen(route.state);
      return route?.name || 'Unknown';
    };

    const rawScreenName = getDeepestScreen(state);
    const { label, intent } = getScreenInfo(rawScreenName);

    // Don't spam the same screen — only emit on change
    if (rawScreenName === lastScreen.current && !productId) return;
    lastScreen.current = rawScreenName;

    socket.emit('update_activity', {
      userId: user?._id || null,
      userName: user?.name || 'Guest',
      userRole: user?.role || 'customer',
      screen: label,
      screenRaw: rawScreenName,
      intent,          // 'low' | 'medium' | 'high' | 'critical'
      productId,
      productTitle,
    });
  }, [state, productId, productTitle, user]);
};

export default useActivityTracker;
