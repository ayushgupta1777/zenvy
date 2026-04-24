// ============================================
// mobile/App.js
// ============================================
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import codePush from 'react-native-code-push'; // Added CodePush
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { requestUserPermission, notificationListener } from './src/utils/notifications';

// CodePush Options
const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
  installMode: codePush.InstallMode.IMMEDIATE,
};

const linking = {
  prefixes: ['https://newrajfancystore.adsngrow.in', 'rajfancy://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            screens: {
              ProductDetails: 'product/:productId',
            },
          },
        },
      },
      Auth: {
        screens: {
          Login: 'login',
        }
      }
    },
  },
};

const App = () => {
  useEffect(() => {
    // Request notification permission
    requestUserPermission();

    // Listen for notifications
    notificationListener();

    // 🚀 CodePush Logging
    codePush.sync(
      { installMode: codePush.InstallMode.IMMEDIATE },
      (status) => {
        switch (status) {
          case codePush.SyncStatus.CHECKING_FOR_UPDATE:
            console.log('[CodePush] Checking for updates...');
            break;
          case codePush.SyncStatus.DOWNLOADING_PACKAGE:
            console.log('[CodePush] Downloading package...');
            break;
          case codePush.SyncStatus.INSTALLING_UPDATE:
            console.log('[CodePush] Installing update...');
            break;
          case codePush.SyncStatus.UP_TO_DATE:
            console.log('[CodePush] App is up to date.');
            break;
          case codePush.SyncStatus.UPDATE_INSTALLED:
            console.log('[CodePush] Update installed and will be applied on next restart.');
            break;
        }
      }
    );
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <NavigationContainer linking={linking}>
          <AppNavigator />
        </NavigationContainer>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default codePush(codePushOptions)(App);