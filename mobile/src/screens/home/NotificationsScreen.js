import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';
import styles from './NotificationsScreen.Styles';
import useNotifications from '../../hooks/useNotifications';

const NotificationsScreen = ({ navigation }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    refreshing,
    refresh,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const handleNotificationPress = (notification) => {
    if (!notification.isRead) markAsRead(notification._id);
    if (notification.type === 'order' && notification.referenceId) {
      navigation.navigate('OrderDetails', { orderId: notification.referenceId });
    }
  };

  const getNotificationIcon = (type) => {
    const icons = { order: 'receipt', payment: 'card', wallet: 'wallet', reseller: 'trending-up', general: 'notifications' };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colors = { order: '#4F46E5', payment: '#10B981', wallet: '#F59E0B', reseller: '#8B5CF6', general: '#6B7280' };
    return colors[type] || '#6B7280';
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notifDate.toLocaleDateString();
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.notificationUnread]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.type) + '20' }]}>
        <Icon name={getNotificationIcon(item.type)} size={24} color={getNotificationColor(item.type)} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (isLoading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4F46E5" /></View>;

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Notifications" 
        showBack 
        rightComponent={unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} style={{ justifyContent: 'center' }}>
            <Text style={styles.markAllBtn}>Mark all</Text>
          </TouchableOpacity>
        ) : null}
      />

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Icon name="mail-unread" size={18} color="#4F46E5" />
          <Text style={styles.unreadText}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="notifications-off-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>We'll notify you when something important happens</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#4F46E5" />}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;