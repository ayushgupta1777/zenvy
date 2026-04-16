import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  SafeAreaView, Animated, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, DEV_STYLES } from './utils/DevTheme';

const { width } = Dimensions.get('window');

const DUMMY_MESSAGES = [
  { id: '1', text: 'Initiating server sync with node 7...', sender: 'SysAdmin', type: 'in' },
  { id: '2', text: 'All nodes active. Reseller dashboard loading.', sender: 'Bot_Delta', type: 'in' },
  { id: '3', text: 'Checking payout statuses for Q1.', sender: 'FinControl', type: 'in' },
  { id: '4', text: 'System update scheduled for 02:00 AM.', sender: 'SysAdmin', type: 'out' },
  { id: '5', text: 'Database integrity check: 100% success.', sender: 'DB_Watcher', type: 'in' },
];

const DevFakeChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'Developer',
      type: 'out',
      isFake: true
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const renderMessage = ({ item }) => {
    const isOut = item.type === 'out';
    return (
      <View style={[styles.messageRow, isOut ? styles.outRow : styles.inRow]}>
        {!isOut && (
          <View style={styles.chatAvatar}>
            <Text style={styles.avatarText}>{item.sender[0]}</Text>
          </View>
        )}
        <View style={[styles.bubble, isOut ? styles.outBubble : styles.inBubble]}>
          {!isOut && <Text style={styles.senderName}>{item.sender}</Text>}
          <Text style={[styles.messageText, isOut && styles.outText]}>
            {item.text} <Text style={styles.fcTag}>FC</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={DEV_STYLES.container}>
      <LinearGradient colors={[COLORS.mint, '#FFFFFF']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-back" size={24} color={COLORS.forest} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>CHAT SIMULATOR</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>9 NODES ACTIVE</Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputArea}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type a simulation message..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor="rgba(16, 185, 129, 0.4)"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <Icon name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.forest, letterSpacing: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  statusText: { fontSize: 8, fontWeight: 'bold', color: COLORS.emerald, letterSpacing: 1 },
  chatContent: { padding: 20, paddingBottom: 40 },
  messageRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
  outRow: { justifyContent: 'flex-end' },
  inRow: { justifyContent: 'flex-start' },
  chatAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.emerald, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  bubble: { maxWidth: '75%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20 },
  inBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  outBubble: { backgroundColor: COLORS.emerald, borderBottomRightRadius: 5, shadowColor: COLORS.emerald, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  senderName: { fontSize: 9, fontWeight: '800', color: COLORS.emerald, marginBottom: 4, letterSpacing: 0.5 },
  messageText: { fontSize: 14, color: COLORS.forest, lineHeight: 20, fontWeight: '500' },
  outText: { color: '#fff' },
  fcTag: { fontSize: 10, fontWeight: '900', opacity: 0.6, color: 'inherit' },
  inputArea: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(16, 185, 129, 0.05)' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.mint, borderRadius: 15, paddingLeft: 15, height: 50 },
  input: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.forest },
  sendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.emerald, justifyContent: 'center', alignItems: 'center', marginRight: 3 }
});

export default DevFakeChatScreen;
