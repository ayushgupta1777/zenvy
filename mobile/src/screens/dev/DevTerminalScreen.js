import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Animated, Dimensions, ActivityIndicator, Vibration
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getSocket } from '../../services/socket';
import { INTENT_COLORS } from '../../hooks/useActivityTracker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const INTENT_ICONS = {
  low:      'ellipse',
  medium:   'alert-circle',
  high:     'flame',
  critical: 'flash',
};

const DevTerminalScreen = ({ navigation }) => {
  const [activeUsers, setActiveUsers] = useState({});
  const [totalPings, setTotalPings] = useState(0);
  const [highIntentCount, setHighIntentCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const activeUsersRef = useRef({});

  useEffect(() => {
    setTimeout(() => {
      setIsInitializing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    }, 1200);

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])
    ).start();

    const socket = getSocket();
    if (!socket) return;

    socket.on('activity_update', (data) => {
      const isNew = !activeUsersRef.current[data.socketId];
      activeUsersRef.current = { ...activeUsersRef.current, [data.socketId]: data };
      setActiveUsers({ ...activeUsersRef.current });
      setTotalPings(p => p + 1);

      // Vibrate on high-intent actions
      if (data.intent === 'critical') Vibration.vibrate([0, 100, 50, 100]);
      else if (data.intent === 'high') Vibration.vibrate(30);
      else if (isNew) Vibration.vibrate(10);

      // Update high-intent count
      const highCount = Object.values(activeUsersRef.current)
        .filter(u => u.intent === 'high' || u.intent === 'critical').length;
      setHighIntentCount(highCount);
    });

    socket.on('user_disconnected', ({ socketId }) => {
      delete activeUsersRef.current[socketId];
      setActiveUsers({ ...activeUsersRef.current });
    });

    return () => {
      socket.off('activity_update');
      socket.off('user_disconnected');
    };
  }, []);

  // Sort: critical first, then high, medium, low
  const INTENT_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedUsers = Object.values(activeUsers).sort(
    (a, b) => (INTENT_ORDER[a.intent] ?? 3) - (INTENT_ORDER[b.intent] ?? 3)
  );

  const renderItem = ({ item: userData }) => {
    const intentColor = INTENT_COLORS[userData.intent] || '#fff';
    const intentIcon  = INTENT_ICONS[userData.intent]  || 'ellipse';
    const isCritical  = userData.intent === 'critical' || userData.intent === 'high';

    return (
      <TouchableOpacity
        style={[styles.userCard, isCritical && { borderColor: intentColor }]}
        onPress={() => userData.userId && navigation.navigate('DevUserDetail', { userId: userData.userId })}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{(userData.userName || 'GUEST').toUpperCase()}</Text>
            <Text style={[styles.roleTag, { color: intentColor }]}>
              {(userData.userRole || 'customer').toUpperCase()}
            </Text>
          </View>
          <View style={styles.livePill}>
            <View style={[styles.liveDot, { backgroundColor: intentColor }]} />
            <Text style={[styles.liveText, { color: intentColor }]}>LIVE</Text>
          </View>
        </View>

        {/* Screen row */}
        <View style={styles.activityRow}>
          <Icon name={intentIcon} size={16} color={intentColor} />
          <Text style={[styles.screenLabel, { color: intentColor }]}>{userData.screen}</Text>
        </View>

        {/* Product row */}
        {userData.productTitle && (
          <View style={styles.productRow}>
            <Icon name="cube-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.productValue} numberOfLines={1}>
              {userData.productTitle.toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.timestamp}>{new Date(userData.lastUpdate).toLocaleTimeString()}</Text>
      </TouchableOpacity>
    );
  };

  if (isInitializing) {
    return (
      <View style={styles.initContainer}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.initText}>INITIALIZING TERMINAL_...</Text>
        <Text style={styles.initSubText}>CONNECTING TO GLOBAL NODE...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scanning line */}
      <Animated.View style={[styles.scanLine, {
        transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_HEIGHT] }) }]
      }]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Stats bar */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>LIVE_NODES</Text>
            <Text style={styles.statValue}>{sortedUsers.length}</Text>
          </View>
          <View style={[styles.statBox, styles.borderMid]}>
            <Text style={styles.statLabel}>DATA_STREAM</Text>
            <Text style={styles.statValue}>{totalPings}</Text>
          </View>
          <View style={[styles.statBox, styles.borderMid]}>
            <Text style={[styles.statLabel, { color: '#FF9500' }]}>🔥 HIGH_INTENT</Text>
            <Text style={[styles.statValue, highIntentCount > 0 && { color: '#FF9500' }]}>
              {highIntentCount}
            </Text>
          </View>
        </View>

        {/* Live user list */}
        <FlatList
          data={sortedUsers}
          renderItem={renderItem}
          keyExtractor={(item, i) => item.socketId || String(i)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="pulse-outline" size={64} color="#fff" />
              <Text style={styles.emptyText}>NO ACTIVE SIGNALS DETECTED_</Text>
            </View>
          }
        />

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate('DevUserList')}>
            <Icon name="people" size={20} color="#000" />
            <Text style={styles.footerBtnText}>USER_DATABASE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, { backgroundColor: '#FF3B30', marginTop: 10 }]}
            onPress={() => {
              import('react-native').then(({ Alert }) => {
                Alert.alert('WARNING', 'EXIT SECURE TERMINAL?', [
                  { text: 'CANCEL', style: 'cancel' },
                  { text: 'CONFIRM', style: 'destructive', onPress: () => {
                    const { store } = require('../../redux/store');
                    const { logout } = require('../../redux/slices/authSlice');
                    store.dispatch(logout());
                  }}
                ]);
              });
            }}
          >
            <Icon name="log-out-outline" size={20} color="#FFF" />
            <Text style={[styles.footerBtnText, { color: '#FFF' }]}>TERMINATE_SESSION</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  initContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  initText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20, letterSpacing: 3 },
  initSubText: { color: '#fff', fontSize: 10, marginTop: 8, opacity: 0.5 },
  scanLine: { position: 'absolute', width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.15)', zIndex: 10 },
  content: { flex: 1 },
  statsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#fff' },
  statBox: { flex: 1, padding: 16, alignItems: 'center' },
  borderMid: { borderLeftWidth: 1, borderLeftColor: '#fff' },
  statLabel: { color: '#fff', fontSize: 9, letterSpacing: 1.5, marginBottom: 4, opacity: 0.7 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  listContent: { padding: 12 },
  userCard: { backgroundColor: '#000', borderWidth: 1, borderColor: '#fff', padding: 14, marginBottom: 12, borderRadius: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userName: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
  roleTag: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginTop: 2 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  screenLabel: { fontSize: 13, fontWeight: 'bold' },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  productValue: { color: 'rgba(255,255,255,0.7)', fontSize: 11, flex: 1 },
  timestamp: { color: 'rgba(255,255,255,0.3)', fontSize: 9, alignSelf: 'flex-end', marginTop: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100, opacity: 0.3 },
  emptyText: { color: '#fff', fontSize: 12, marginTop: 20, letterSpacing: 2 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#fff' },
  footerBtn: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 13, borderRadius: 2 },
  footerBtnText: { color: '#000', fontSize: 13, fontWeight: 'bold', letterSpacing: 2 },
});

export default DevTerminalScreen;
