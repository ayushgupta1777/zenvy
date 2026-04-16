import React, { Fragment } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { TouchableOpacity, View } from 'react-native';
import AdminStack from './AdminNavigator';
import useActivityTracker from '../hooks/useActivityTracker';

// Customer/Reseller Screens
import HomeScreen from '../screens/home/HomeScreen';
import ProductDetailsScreen from '../screens/product/ProductDetailsScreen';
import ProductListScreen from '../screens/product/ProductListScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import OrderSuccessScreen from '../screens/orders/OrderSuccessScreen';
import PaymentGatewayScreen from '../screens/payment/PaymentGatewayScreen';
import CreateSupportTicketScreen from '../screens/orders/CreateSupportTicketScreen';
import UserChatScreen from '../screens/support/UserChatScreen';

import CategoryListScreen from '../screens/product/CategoryListScreen';
import SubcategoryListScreen from '../screens/product/SubcategoryListScreen';

// Search and Notifications Screens
import SearchScreen from '../screens/home/SearchScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';

// Reseller Feature Screens (Core Feature)
import ResellerHubScreen from '../screens/reseller/ResellerHubScreen_np';
import ShareProductScreen from '../screens/reseller/ShareProductScreen';
// import MyEarningsScreen from '../screens/reseller/MyEarningsScreen';  
import WithdrawScreen from '../screens/reseller/WithdrawRequestScreen';
// import MySalesScreen from '../screens/reseller/MySalesScreen';
import BecomeResellerScreen from '../screens/reseller/ApplyResellerScreen_np';


// Np Reseller
import ResellerHubScreen_np from '../screens/reseller/ResellerHubScreen_np';
import TransactionHistoryScreen from '../screens/reseller/TransactionHistoryScreen_np';
import SalesHistoryScreen from '../screens/reseller/SalesHistoryScreen_np';
import WithdrawalHistoryScreen from '../screens/reseller/WithdrawalHistoryScreen_np';
import ApplyResellerScreen from '../screens/reseller/ApplyResellerScreen_np';
import ResellerWalletScreen from '../screens/reseller/ResellerWalletScreen';
import WithdrawRequestScreen from '../screens/reseller/WithdrawRequestScreen';



// Admin Screens
// import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminOrderDetailsScreen from '../screens/admin/AdminOrderDetailsScreen';
import ProductManagementScreen from '../screens/admin/AdminProductManagementScreen';
import AddProductScreen from '../screens/admin/AdminAddProductScreen';
// import EditProductScreen from '../screens/admin/EditProductScreen';
import ShiprocketSettingsScreen from '../screens/admin/ShiprocketSettingsScreen';
import CouponManagementScreen from '../screens/admin/CouponManagementScreen';
import OrdersDashboardScreen from '../screens/admin/OrdersDashboardScreen';
import CategoryManagementScreen from '../screens/admin/CategoryManagementScreen';

// ProfileScreen
import WishlistScreen from '../screens/profile/WishlistScreen';
import MyReviewsScreen from '../screens/profile/AddReviewScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
// import EditAddressScreen from '../screens/profile/EditAddressScreen';
import InitiateReturnScreen from '../screens/returns/InitiateReturnScreen';
import MyReturnsScreen from '../screens/returns/MyReturnsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import PaymentMethodsScreen from '../screens/payment/PaymentMethodsScreen';

// Policy & Legal Pages
import TermsScreen from '../screens/profile/Policies/TermsScreen';
import PrivacyScreen from '../screens/profile/Policies/PrivacyScreen';
import CancellationScreen from '../screens/profile/Policies/CancellationScreen';
import ShippingScreen from '../screens/profile/Policies/ShippingScreen';
import ContactUsScreen from '../screens/profile/Policies/ContactUsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// HOME STACK
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} style={{ flex: 1, backgroundColor: '#fff' }}>

    <Stack.Screen name="HomeMain" component={HomeScreen} />

    <Stack.Screen name='CategoryList' component={CategoryListScreen} />
    <Stack.Screen name='SubcategoryList' component={SubcategoryListScreen} />

    <Stack.Screen name="ProductList" component={ProductListScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    <Stack.Screen name="ShareProduct" component={ShareProductScreen} />

    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="ShiprocketSettings" component={ShiprocketSettingsScreen} />
    <Stack.Screen name="UserChat" component={UserChatScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
  </Stack.Navigator>
);

// CART STACK
// const CartStack = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="CartMain" component={CartScreen} />
//     <Stack.Screen name="Checkout" component={CheckoutScreen} />
//     <Stack.Screen 
//       name="Payment" 
//       component={PaymentScreen}
//       options={{ gestureEnabled: false }}
//     />
//     <Stack.Screen 
//       name="PaymentGateway" 
//       component={PaymentGatewayScreen}
//       options={{ gestureEnabled: false }}
//     />
//     <Stack.Screen 
//       name="OrderSuccess" 
//       component={OrderSuccessScreen}
//       options={{ gestureEnabled: false }}
//     />
//   </Stack.Navigator>
// );

// CART STACK - ADD ALL REQUIRED SCREENS
// CART STACK - This is the ONLY cart implementation
const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}  >

    <Stack.Screen
      name="CartMain"
      component={CartScreen}
      options={{ title: 'Cart' }}
    />
    <Stack.Screen
      name="Checkout"
      component={CheckoutScreen}
      options={{ title: 'Checkout' }}
    />
    <Stack.Screen
      name="Payment"
      component={PaymentScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="PaymentGateway"
      component={PaymentGatewayScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="OrderSuccess"
      component={OrderSuccessScreen}
      options={{ gestureEnabled: false }}
    />
  </Stack.Navigator>
);

// RESELLER HUB STACK (Core Feature - Most Important)
// ✅ UPDATED RESELLER STACK
const ResellerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Main Hub */}
    <Stack.Screen name="ResellerHubMain" component={ResellerHubScreen} />

    {/* Application */}
    <Stack.Screen name="BecomeReseller" component={ApplyResellerScreen} />

    {/* Wallet & Money */}
    <Stack.Screen name="ResellerWallet" component={ResellerWalletScreen} />
    <Stack.Screen name="Withdraw" component={WithdrawRequestScreen} />

    {/* History Screens */}
    <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    <Stack.Screen name="SalesHistory" component={SalesHistoryScreen} />
    <Stack.Screen name="WithdrawHistory" component={WithdrawalHistoryScreen} />

    {/* Product Sharing */}
    <Stack.Screen name="ShareProduct" component={ShareProductScreen} />
    <Stack.Screen name="ProductList" component={ProductListScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
  </Stack.Navigator>
);

// ORDERS STACK
const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OrdersList" component={OrdersScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    <Stack.Screen
      name="CreateSupportTicket"
      component={CreateSupportTicketScreen}
    />
    <Stack.Screen name="UserChat" component={UserChatScreen} />

    <Stack.Screen
      name="PaymentGateway"
      component={PaymentGatewayScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen name="InitiateReturn" component={InitiateReturnScreen} />
    <Stack.Screen name="MyReturns" component={MyReturnsScreen} />


  </Stack.Navigator>
);

// PROFILE STACK
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="BecomeReseller" component={BecomeResellerScreen} />
    {/*<Stack.Screen name="MyEarnings" component={MyEarningsScreen} />
    <Stack.Screen name="MySales" component={MySalesScreen} /> */}
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />

    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="MyReviews" component={MyReviewsScreen} />

    <Stack.Screen name="OrdersList" component={OrdersScreen} />

    <Stack.Screen name="Addresses" component={AddressesScreen} />
    {/* <Stack.Screen name="EditAddress" component={EditAddressScreen} />*/}
    <Stack.Screen name="InitiateReturn" component={InitiateReturnScreen} />
    <Stack.Screen name="MyReturns" component={MyReturnsScreen} />

    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />

    {/* Legal & Policy Pages */}
    <Stack.Screen
      name="Terms"
      component={TermsScreen}
      options={({ navigation }) => ({
        headerShown: true,
        title: 'Terms & Conditions',
        headerStyle: { backgroundColor: '#4F46E5' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileMain')}
            style={{ marginLeft: 16 }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )
      })}
    />
    <Stack.Screen
      name="Privacy"
      component={PrivacyScreen}
      options={({ navigation }) => ({
        headerShown: true,
        title: 'Privacy Policy',
        headerStyle: { backgroundColor: '#10B981' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileMain')}
            style={{ marginLeft: 16 }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )
      })}
    />
    <Stack.Screen
      name="Cancellation"
      component={CancellationScreen}
      options={({ navigation }) => ({
        headerShown: true,
        title: 'Cancellation & Refund',
        headerStyle: { backgroundColor: '#FF9500' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileMain')}
            style={{ marginLeft: 16 }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )
      })}
    />
    <Stack.Screen
      name="Shipping"
      component={ShippingScreen}
      options={({ navigation }) => ({
        headerShown: true,
        title: 'Shipping & Delivery',
        headerStyle: { backgroundColor: '#0A84FF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileMain')}
            style={{ marginLeft: 16 }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )
      })}
    />
    <Stack.Screen name="ContactUs" component={ContactUsScreen} />
    <Stack.Screen name="UserChat" component={UserChatScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
  </Stack.Navigator>
);

// ADMIN STACK
// const AdminStack = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     {/* <Stack.Screen name="AdminDashboardMain" component={AdminDashboardScreen} /> */}
//     <Stack.Screen name="OrdersDashboard" component={OrdersDashboardScreen} />
//     <Stack.Screen name="AdminOrderDetails" component={AdminOrderDetailsScreen} />
//     <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
//      <Stack.Screen name="AddProduct" component={AddProductScreen} />
//     {/*<Stack.Screen name="EditProduct" component={EditProductScreen} /> */}
//      <Stack.Screen name="ShiprocketSettings" component={ShiprocketSettingsScreen} />
//   </Stack.Navigator>
// );

import axios from 'axios';
import { BASE_URL } from '../services/api';
import UpgradeModal from '../components/common/UpgradeModal';

// APP VERSION
const CURRENT_VERSION = '1.0.4';

// MAIN NAVIGATOR
const MainNavigator = () => {
  useActivityTracker(); // 🟢 Real-time monitoring for Developer Terminal
  const { user, token } = useSelector((state) => state.auth);
  const [upgradeInfo, setUpgradeInfo] = React.useState({ visible: false, version: '', url: '' });

  React.useEffect(() => {
    checkAppVersion();
  }, []);

  const checkAppVersion = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/settings/latest_app_version`);
      const serverVersion = response.data.data.value;

      if (serverVersion && serverVersion !== CURRENT_VERSION) {
        // Version mismatch, fetch update URL
        const urlRes = await axios.get(`${BASE_URL}/api/settings/app_update_url`);
        const updateUrl = urlRes.data.data.value;

        setUpgradeInfo({
          visible: true,
          version: serverVersion,
          url: updateUrl || ''
        });
      }
    } catch (error) {
      console.warn('App version check failed:', error.message);
    }
  };
  const isAdmin = user?.role === 'admin';
  const isReseller = user?.isReseller === true; // Customer who became reseller

  // ADMIN SEES DIFFERENT INTERFACE
  if (isAdmin) {
    return (
      <AdminStack />
      // <Tab.Navigator
      //   screenOptions={({ route }) => ({
      //     tabBarIcon: ({ focused, color, size }) => {
      //       let iconName;
      //       if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
      //       else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
      //       else if (route.name === 'Products') iconName = focused ? 'cube' : 'cube-outline';
      //       else if (route.name === 'Resellers') iconName = focused ? 'people' : 'people-outline';
      //       else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
      //       return <Icon name={iconName} size={size} color={color} />;
      //     },
      //     tabBarActiveTintColor: '#4F46E5',
      //     tabBarInactiveTintColor: 'gray',
      //     headerShown: false
      //   })}
      // >
      //   <Tab.Screen name="Dashboard" component={AdminStack} />
      //   <Tab.Screen name="Orders" component={OrdersDashboardScreen} />
      //   <Tab.Screen name="Products" component={AddProductScreen} />
      //   {/* <Tab.Screen name="Resellers" component={ResellerManagementScreen} /> */}
      //   <Tab.Screen name="Categories" component={CategoryManagementScreen} />
      //   <Tab.Screen name="Settings" component={ShiprocketSettingsScreen} />
      // </Tab.Navigator>
    );
  }

  // CUSTOMER/RESELLER INTERFACE
  return (
    <Fragment>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'ResellerHub') {
              iconName = focused ? 'cash' : 'cash-outline';
            } else if (route.name === 'Cart') {
              iconName = focused ? 'cart' : 'cart-outline';
            } else if (route.name === 'Orders') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          // Highlight Reseller Hub if user is a reseller
          tabBarBadge: route.name === 'ResellerHub' && isReseller ? '•' : undefined,
          tabBarBadgeStyle: { backgroundColor: '#10B981' }
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ title: 'Shop' }}
        />

        {/* RESELLER HUB - Always visible, most prominent */}
        <Tab.Screen
          name="ResellerHub"
          component={ResellerStack}
          options={{
            title: 'Earn Money',
            tabBarLabel: 'Earn'
          }}
        />

        <Tab.Screen name="Cart" component={CartStack} />
        <Tab.Screen name="Orders" component={OrdersStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
      <UpgradeModal
        visible={upgradeInfo.visible}
        version={upgradeInfo.version}
        updateUrl={upgradeInfo.url}
        onDismiss={() => setUpgradeInfo({ ...upgradeInfo, visible: false })}
      />
    </Fragment>
  );
};


export default MainNavigator;