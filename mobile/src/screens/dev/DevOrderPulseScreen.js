import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Animated } from 'react-native';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const STATUS_COLOR = { pending: '#FF9500', confirmed: '#34C759', delivered: '#fff', cancelled: '#FF3B30', shipped: '#5AC8FA' };

const DevOrderPulseScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const flashAnim = useRef(new Animated.Value(1)).current;

  const flash = () => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    // Initial load
    api.get('/dev/orders/live')
      .then(r => setOrders(r.data.data.orders || []))
      .finally(() => setLoading(false));

    // Socket listener
    const socket = getSocket();
    if (socket) {
      socket.on('new_order', (order) => {
        flash();
        setOrders(prev => [order, ...prev.slice(0, 19)]);
      });
    }

    return () => { socket?.off('new_order'); };
  }, []);

  const renderItem = ({ item, index }) => (
    <Animated.View style={[s.orderCard, { opacity: index === 0 ? flashAnim : 1 }]}>
      <View style={s.cardTop}>
        <Text style={s.orderId}>ORD_{item._id?.slice(-6)?.toUpperCase()}</Text>
        <View style={[s.statusBadge, { borderColor: STATUS_COLOR[item.status] || '#fff' }]}>
          <Text style={[s.statusText, { color: STATUS_COLOR[item.status] || '#fff' }]}>
            {(item.status || '').toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={s.customer}>{(item.user?.name || 'GUEST').toUpperCase()}</Text>
      <View style={s.cardBottom}>
        <Text style={s.amount}>₹{(item.totalAmount || 0).toLocaleString()}</Text>
        <Text style={s.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
      </View>
    </Animated.View>
  );

  if (loading) return <View style={s.center}><ActivityIndicator color="#fff" /><Text style={s.loadText}>TAPPING ORDER STREAM...</Text></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.liveDot} />
        <Text style={s.headerText}>LIVE_ORDER_PULSE</Text>
        <Text style={s.count}>{orders.length}</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item, i) => item._id || String(i)}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={<Text style={s.empty}>AWAITING ORDER SIGNAL...</Text>}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#fff', fontSize: 12, letterSpacing: 2, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: '#fff' },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  headerText: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, flex: 1 },
  count: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  orderCard: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: 1 },
  statusBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2 },
  statusText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  customer: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  amount: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  time: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 80, fontSize: 12, letterSpacing: 2 },
});

export default DevOrderPulseScreen;
