// ============================================
// mobile/src/screens/LoadingScreen.js
// ============================================
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View className="loading-container">
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
};

export default LoadingScreen;