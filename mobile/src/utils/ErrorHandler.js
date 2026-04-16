import { Alert } from 'react-native';

// Global error boundary for React Native
export const setupGlobalErrorHandler = () => {
  // Catch all unhandled promise rejections
  const rejectionTracking = require('promise/setimmediate/rejection-tracking');
  
  rejectionTracking.enable({
    allRejections: true,
    onUnhandled: (id, error) => {
      console.error('🔴 UNHANDLED PROMISE REJECTION:', error);
      
      Alert.alert(
        'Something went wrong',
        'Please try again. If the problem persists, restart the app.',
        [{ text: 'OK' }]
      );
    },
    onHandled: (id) => {
      console.log('Promise rejection was handled:', id);
    }
  });

  // Catch all console errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
    
    // Don't crash the app, just log
    const errorMessage = args.join(' ');
    if (errorMessage.includes('Navigation') || 
        errorMessage.includes('dispatch') || 
        errorMessage.includes('order')) {
      console.log('🔴 CAUGHT ERROR - Prevented crash:', errorMessage);
    }
  };
};