// ============================================
// mobile/src/navigation/AppNavigator.js
// ============================================
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { loadUser } from '../redux/slices/authSlice';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import DeveloperNavigator from './DeveloperNavigator';
import { initSocket, disconnectSocket } from '../services/socket';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    dispatch(loadUser()).finally(() => setInitializing(false));
  }, [dispatch]);

  // Initialize socket when authenticated, disconnect on logout
  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  if (initializing || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        user?.role === 'developer' ? (
          <Stack.Screen name="DeveloperMain" component={DeveloperNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;