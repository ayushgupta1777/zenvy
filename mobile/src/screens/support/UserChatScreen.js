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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../services/api'; 
import LinearGradient from 'react-native-linear-gradient';

const UserChatScreen = ({ navigation, route }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const { orderId, orderNo } = route.params || {};
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchChatAndMessages();

    // Initialize socket
    socketRef.current = io(BASE_URL, {
      auth: { token },
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      const userId = user?.id || user?._id;
      if (userId) {
        socketRef.current.emit('join', userId);
      }
    });

    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
      // Scroll to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    socketRef.current.on('messages_seen', ({ chatId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.chatId === chatId ? { ...m, status: 'seen' } : m))
      );
    });

    socketRef.current.on('messages_seen', ({ chatId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.chatId === chatId ? { ...m, status: 'seen' } : m))
      );
    });

    socketRef.current.on('chat_resolved', ({ chatId, message }) => {
      setMessages((prev) => [...prev, message]);
      setChat((prev) => prev && prev._id === chatId ? { ...prev, status: 'resolved' } : prev);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [orderId, user?.id, user?._id]);

  const fetchChatAndMessages = async () => {
    try {
      const chatRes = await axios.get(`${BASE_URL}/api/chat/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentChat = chatRes.data.chat;
      if (!currentChat) {
        setLoading(false);
        return;
      }
      setChat(currentChat);

      const msgRes = await axios.get(`${BASE_URL}/api/chat/${currentChat._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(msgRes.data.messages);
      setLoading(false);
      
      // Mark as read
      socketRef.current?.emit('mark_read', { chatId: currentChat._id, role: 'user' });

      // If coming from "Raise Issue", send automated message if not already sent
      if (orderId && orderNo) {
        const automatedText = `I need help with Order #${orderNo}`;
        const exists = msgRes.data.messages.some(m => m.text === automatedText && m.orderId === orderId);
        if (!exists) {
          sendMessage(automatedText, orderId);
        }
      }
    } catch (error) {
      console.error('Fetch chat error:', error);
      setLoading(false);
    }
  };

  const sendMessage = (text = inputText, customOrderId = null) => {
    const finalMsg = text?.trim() || (typeof text === 'string' ? text : inputText.trim());
    if (finalMsg === '' || !chat) return;

    const messageData = {
      chatId: chat._id,
      senderId: user?.id || user?._id,
      senderRole: 'user',
      text: finalMsg,
      orderId: customOrderId || orderId
    };

    socketRef.current.emit('send_message', messageData);
    if (!text || text === inputText) setInputText('');
  };

  const QuickReplies = () => {
    const topics = [
      { id: 1, text: 'Order Status', icon: 'location-outline' },
      { id: 2, text: 'Return Policy', icon: 'return-up-back-outline' },
      { id: 3, text: 'Refund Inquiry', icon: 'card-outline' },
      { id: 4, text: 'Talk to Agent', icon: 'headset-outline' },
    ];

    if (chat?.status === 'resolved') return null;

    return (
      <View style={styles.quickRepliesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={topics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.quickReplyBtn}
              onPress={() => sendMessage(item.text)}
            >
              <Icon name={item.icon} size={16} color="#4F46E5" />
              <Text style={styles.quickReplyText}>{item.text}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    );
  };

  const renderMessage = ({ item }) => {
    if (item.messageType === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessageLine} />
          <Text style={styles.systemMessageText}>{item.text}</Text>
          <View style={styles.systemMessageLine} />
        </View>
      );
    }

    const isMine = item.senderRole === 'user';
    return (
      <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
        {!isMine && (
           <View style={styles.avatarContainer}>
              <Icon name="person-circle" size={30} color="#4F46E5" />
           </View>
        )}
        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
            {item.text}
          </Text>
          {item.orderId && (
            <TouchableOpacity 
              style={styles.orderRefBadge}
              onPress={() => navigation.navigate('OrderDetails', { orderId: item.orderId })}
            >
              <Icon name="receipt-outline" size={12} color="#4F46E5" />
              <Text style={styles.orderRefText}>View Order</Text>
            </TouchableOpacity>
          )}
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
      <View style={[styles.header, { backgroundColor: '#4F46E5' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Customer Support</Text>
          <Text style={styles.headerStatus}>{chat?.status === 'resolved' ? 'Session Resolved' : 'Online'}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {chat?.status === 'active' || !chat?.status ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.inputWrapper}
        >
          <QuickReplies />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
              onPress={() => sendMessage()}
              disabled={!inputText.trim()}
            >
              <Icon name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.resolvedFooter}>
          <Text style={styles.resolvedText}>This support session has ended.</Text>
          <TouchableOpacity 
            style={styles.newChatBtn}
            onPress={() => setChat({ ...chat, status: 'active' })}
          >
            <Text style={styles.newChatBtnText}>Start New Conversation</Text>
          </TouchableOpacity>
        </View>
      )}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  headerIcon: {
    padding: 4,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myBubble: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  orderRefText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
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
     color: 'rgba(255,255,255,0.7)',
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
    maxHeight: 120,
  },
  attachButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1E293B',
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
  quickRepliesContainer: {
    paddingVertical: 10,
  },
  quickReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6
  },
  quickReplyText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600'
  },
  systemMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20
  },
  systemMessageLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0'
  },
  systemMessageText: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 10,
    fontWeight: '600',
    textAlign: 'center'
  },
  resolvedFooter: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  resolvedText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center'
  },
  newChatBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  newChatBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700'
  }
});

export default UserChatScreen;
