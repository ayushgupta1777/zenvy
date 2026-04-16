import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const DevFinancialsScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dev/financials');
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color="#fff" /><Text style={s.loadText}>CRUNCHING NUMBERS...</Text></View>;

  const { revenue, pendingOrders, topProducts } = data || {};

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Revenue Cards */}
      <View style={s.cardsRow}>
        <RevenueCard label="TODAY" amount={revenue?.today} />
        <RevenueCard label="7 DAYS" amount={revenue?.week} />
        <RevenueCard label="MONTH" amount={revenue?.month} />
      </View>

      <View style={s.statBox}>
        <Icon name="time-outline" size={22} color="#fff" />
        <Text style={s.statLabel}>ORDERS PENDING ACTION</Text>
        <Text style={s.statValue}>{pendingOrders || 0}</Text>
      </View>

      <Text style={s.sectionTitle}>TOP_PRODUCTS_BY_UNITS_SOLD</Text>
      {(topProducts || []).map((p, i) => (
        <View key={i} style={s.productRow}>
          <Text style={s.rank}>#{i + 1}</Text>
          <View style={s.productInfo}>
            <Text style={s.productName} numberOfLines={1}>{(p.title || 'UNKNOWN').toUpperCase()}</Text>
            <Text style={s.productSub}>{p.totalSold} UNITS • ₹{p.revenue?.toLocaleString()}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={s.refreshBtn} onPress={fetch}>
        <Icon name="refresh" size={18} color="#000" />
        <Text style={s.refreshText}>REFRESH</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const RevenueCard = ({ label, amount }) => (
  <View style={s.revenueCard}>
    <Text style={s.revLabel}>{label}</Text>
    <Text style={s.revAmount}>₹{(amount || 0).toLocaleString()}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#fff', fontSize: 12, letterSpacing: 2, marginTop: 12 },
  cardsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  revenueCard: { flex: 1, borderWidth: 1, borderColor: '#fff', padding: 14, alignItems: 'center' },
  revLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: 2, marginBottom: 6 },
  revAmount: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statBox: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, flex: 1, letterSpacing: 1 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, marginBottom: 14 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  rank: { color: '#fff', fontSize: 16, fontWeight: 'bold', width: 28 },
  productInfo: { flex: 1 },
  productName: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
  productSub: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 3 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', padding: 14, marginTop: 24, borderRadius: 2 },
  refreshText: { color: '#000', fontWeight: 'bold', letterSpacing: 2, fontSize: 13 },
});

export default DevFinancialsScreen;
