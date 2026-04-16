import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../../services/api';
import { io } from 'socket.io-client';

const AdminChatListScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchConversations();

    socketRef.current = io(BASE_URL, {
      auth: { token },
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', 'admin_room');
    });

    socketRef.current.on('chat_updated', (updatedChat) => {
      setChats((prev) => {
        const index = prev.findIndex((c) => c._id === updatedChat.chatId);
        if (index !== -1) {
          const newChats = [...prev];
          newChats[index] = { 
            ...newChats[index], 
            lastMessage: updatedChat.lastMessage,
            updatedAt: updatedChat.updatedAt,
            unreadCountAdmin: updatedChat.unreadCountAdmin,
            lastOrderId: updatedChat.lastOrderId
          };
          // Move to top
          const moved = newChats.splice(index, 1)[0];
          return [moved, ...newChats];
        }
        return prev;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/chat/admin/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data.chats);
      setLoading(false);
    } catch (error) {
      console.error('Fetch conversations error:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('AdminChat', { 
        chatId: item._id, 
        userName: item.userId?.name || 'User' 
      })}
    >
      <View style={styles.avatarContainer}>
        <Icon name="person-circle" size={50} color="#4F46E5" />
        {item.unreadCountAdmin > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCountAdmin}</Text>
          </View>
        )}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.userId?.name || 'Unknown User'}</Text>
          <Text style={styles.timeText}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={[styles.lastMessage, item.unreadCountAdmin > 0 && styles.unreadText]} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text>
          {item.lastOrderId && (
            <View style={styles.orderBadgeMini}>
              <Icon name="receipt" size={10} color="#10B981" />
              <Text style={styles.orderBadgeText}>Order</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support Inbox</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={renderChatItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No active conversations</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'BOLD',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
  },
  unreadText: {
    color: '#1E293B',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  orderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
  },
});

export default AdminChatListScreen;
