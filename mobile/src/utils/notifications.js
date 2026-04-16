// ============================================
// mobile/src/utils/notifications.js
// ============================================
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Request Notification Permission
export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    await getFCMToken();
  }
};

// Get FCM token and store it
export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    await AsyncStorage.setItem('fcmToken', token);
    // also send token to your backend if required
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Create Android notification channel
export const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
};

// Foreground & background listener setup
export const notificationListener = () => {
  // Foreground messages
  messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground message:', remoteMessage);

    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
      },
    });
  });

  // Background messages are handled in index.js
  // messaging().setBackgroundMessageHandler(...) goes in index.js
};
