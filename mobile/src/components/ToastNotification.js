// ============================================
// mobile/src/components/ToastNotification.js
// MISSING COMPONENT - Toast notifications
// ============================================
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ToastNotification = ({ visible, message, type = 'success', onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.spring(translateY, {
        toValue: 50,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      if (onHide) onHide();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#10B981' };
      case 'error':
        return { name: 'close-circle', color: '#EF4444' };
      case 'warning':
        return { name: 'warning', color: '#F59E0B' };
      case 'info':
        return { name: 'information-circle', color: '#3B82F6' };
      default:
        return { name: 'checkmark-circle', color: '#10B981' };
    }
  };

  const icon = getIcon();

  return (
    <Animated.View
      className={`toast-notification toast-${type}`}
      style={{ transform: [{ translateY }] }}
    >
      <Icon name={icon.name} size={24} color={icon.color} />
      <Text className="toast-message">{message}</Text>
      <TouchableOpacity onPress={hideToast}>
        <Icon name="close" size={20} color="#6B7280" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ToastNotification;