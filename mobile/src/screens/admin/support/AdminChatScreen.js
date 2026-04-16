import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../../services/api';
import LinearGradient from 'react-native-linear-gradient';

const AdminChatScreen = ({ route, navigation }) => {
  const { chatId, userName } = route.params;
  const { user, token } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    socketRef.current = io(BASE_URL, {
      auth: { token },
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', 'admin_room');
    });

    socketRef.current.on('chat_resolved', ({ chatId: resolvedChatId, message }) => {
      if (resolvedChatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.current.on('receive_message', (message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      }
    });

    socketRef.current.on('messages_seen', ({ chatId: seenChatId }) => {
      if (seenChatId === chatId) {
        setMessages((prev) =>
          prev.map((m) => (m.chatId === seenChatId ? { ...m, status: 'seen' } : m))
        );
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const msgRes = await axios.get(`${BASE_URL}/api/chat/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(msgRes.data.messages);
      setLoading(false);
      
      // Mark as read
      socketRef.current?.emit('mark_read', { chatId, role: 'admin' });
    } catch (error) {
      console.error('Fetch messages error:', error);
      setLoading(false);
    }
  };

  const handleResolve = () => {
    Alert.alert(
      'Resolve Chat',
      'Are you sure you want to mark this support session as resolved? This will notify the user.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Resolve', 
          onPress: () => {
            socketRef.current.emit('resolve_chat', { chatId });
            Alert.alert('Success', 'Chat session resolved');
          } 
        }
      ]
    );
  };

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const messageData = {
      chatId,
      senderId: user?.id || user?._id,
      senderRole: 'admin',
      text: inputText.trim(),
    };

    socketRef.current.emit('send_message', messageData);
    setInputText('');
  };

  const renderOrderReference = (itemOrderId) => {
    if (!itemOrderId) return null;
    return (
      <TouchableOpacity 
        style={styles.orderRefBadge}
        onPress={() => navigation.navigate('AdminOrderDetails', { orderId: itemOrderId })}
      >
        <Icon name="receipt-outline" size={12} color="#10B981" />
        <Text style={styles.orderRefText}>View Order</Text>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }) => {
    if (item.messageType === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    const isMine = item.senderRole === 'admin';
    return (
      <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
            {item.text}
          </Text>
          {renderOrderReference(item.orderId)}
          <View style={styles.messageFooter}>
            <Text style={[styles.timeText, isMine && styles.myTimeText]}>
               {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMine && (
              <Icon 
                name={item.status === 'seen' ? "checkmark-done" : "checkmark"} 
                size={16} 
                color={item.status === 'seen' ? "#3B82F6" : "#CCD1D1"} 
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#1E293B' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{userName}</Text>
          <Text style={styles.headerStatus}>Customer Support</Text>
        </View>
        <TouchableOpacity onPress={handleResolve} style={styles.resolveHeaderBtn}>
           <Icon name="checkmark-done-circle-outline" size={24} color="#10B981" />
           <Text style={styles.resolveHeaderText}>Resolve</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a reply..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: '#1E293B',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#1E293B',
  },
  orderRefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  orderRefText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
  },
  myTimeText: {
     color: 'rgba(255,255,255,0.6)',
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 25,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  resolveHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  resolveHeaderText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700'
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  systemMessageText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  }
});

export default AdminChatScreen;
