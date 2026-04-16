import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Admin Screens
import OrdersDashboardScreen from '../screens/admin/OrdersDashboardScreen';
import AdminOrderDetailsScreen from '../screens/admin/AdminOrderDetailsScreen';
// import AdminProductManagementScreen from '../screens/admin/AdminProductManagementScreen';
import AdminProductManagementScreen from '../screens/admin/AdminProductManagementScreen';

import AddProductScreen from '../screens/admin/AdminAddProductScreen';
import CategoryManagementScreen from '../screens/admin/CategoryManagementScreen';
import BannerManagementScreen from '../screens/admin/BannerManagementScreen';
import ShiprocketSettingsScreen from '../screens/admin/ShiprocketSettingsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import AdminWithdrawalsScreen from '../screens/admin/AdminWithdrawalsScreen';
import AdminResellerApplicationsScreen from '../screens/admin/AdminResellerApplicationsScreen';
import CouponManagementScreen from '../screens/admin/CouponManagementScreen';
import GeneralSettingsScreen from '../screens/admin/GeneralSettingsScreen';
import AdminChatListScreen from '../screens/admin/support/AdminChatListScreen';
import AdminChatScreen from '../screens/admin/support/AdminChatScreen';
import ReleaseManagementScreen from '../screens/admin/ReleaseManagementScreen';
import CreateShipmentScreen from '../screens/admin/CreateShipmentScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Orders Stack
const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OrdersDashboard" component={OrdersDashboardScreen} />
    <Stack.Screen name="AdminOrderDetails" component={AdminOrderDetailsScreen} />
    <Stack.Screen name="AdminChat" component={AdminChatScreen} />
    <Stack.Screen name="CreateShipment" component={CreateShipmentScreen} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
  </Stack.Navigator>
);

// Products Stack
const ProductsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductManagement" component={AdminProductManagementScreen} />
    <Stack.Screen name="AddProduct" component={AddProductScreen} />


  </Stack.Navigator>
);

// Support Stack
const SupportStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminChatList" component={AdminChatListScreen} />
    <Stack.Screen name="AdminChat" component={AdminChatScreen} />
  </Stack.Navigator>
);

// Settings Stack
const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
    <Stack.Screen name="GeneralSettings" component={GeneralSettingsScreen} />
    <Stack.Screen name="ProductManagement" component={AdminProductManagementScreen} />
    <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
    <Stack.Screen name="BannerManagement" component={BannerManagementScreen} />
    <Stack.Screen name="ShiprocketSettings" component={ShiprocketSettingsScreen} />
    <Stack.Screen name="AdminWithdrawals" component={AdminWithdrawalsScreen} />
    <Stack.Screen name="AdminResellerApplications" component={AdminResellerApplicationsScreen} />
    <Stack.Screen name="CouponManagement" component={CouponManagementScreen} />
    <Stack.Screen name="ReleaseManagement" component={ReleaseManagementScreen} />
    <Stack.Screen name="OrdersDashboard" component={OrdersDashboardScreen} />
    <Stack.Screen name="AdminOrderDetails" component={AdminOrderDetailsScreen} />
    <Stack.Screen name="AddProduct" component={AddProductScreen} />
  </Stack.Navigator>
);

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Support') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        }
      })}
    >
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Support" component={SupportStack} options={{ tabBarLabel: 'Support' }} />
      <Tab.Screen name="Products" component={ProductsStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;