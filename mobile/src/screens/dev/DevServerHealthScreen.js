import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const formatUptime = (secs) => {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};

const DevServerHealthScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dotAnim = useRef(new Animated.Value(0)).current;

  const fetch = async () => {
    try {
      const res = await api.get('/dev/health');
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 10000); // refresh every 10s
    Animated.loop(Animated.sequence([
      Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(dotAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ])).start();
    return () => clearInterval(interval);
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color="#fff" /><Text style={s.loadText}>PINGING SERVER...</Text></View>;

  const db = data?.database;
  const mem = data?.memory;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* DB Status */}
      <View style={s.statusRow}>
        <Animated.View style={[s.dot, { opacity: dotAnim, backgroundColor: db?.connected ? '#4ADE80' : '#FF3B30' }]} />
        <Text style={s.statusLabel}>DATABASE: {(db?.status || '').toUpperCase()}</Text>
      </View>

      <Row label="PLATFORM" value={(data?.platform || '').toUpperCase()} />
      <Row label="NODE VERSION" value={data?.nodeVersion} />
      <Row label="UPTIME" value={formatUptime(data?.uptime || 0)} />

      <Divider title="CPU_LOAD_AVG" />
      <Row label="1 MIN" value={`${data?.cpu?.load1}`} />
      <Row label="5 MIN" value={`${data?.cpu?.load5}`} />
      <Row label="15 MIN" value={`${data?.cpu?.load15}`} />

      <Divider title="MEMORY" />
      <Row label="TOTAL" value={`${mem?.totalMB} MB`} />
      <Row label="USED" value={`${mem?.usedMB} MB (${mem?.percent}%)`} />
      <Row label="FREE" value={`${mem?.freeMB} MB`} />
      <BarPercent percent={mem?.percent} />

      <TouchableOpacity style={s.refreshBtn} onPress={fetch}>
        <Icon name="refresh" size={18} color="#000" />
        <Text style={s.refreshText}>REFRESH</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Row = ({ label, value }) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={s.rowValue}>{value}</Text>
  </View>
);

const Divider = ({ title }) => (
  <View style={s.divider}><Text style={s.dividerText}>{title}</Text></View>
);

const BarPercent = ({ percent = 0 }) => (
  <View style={s.barTrack}>
    <View style={[s.barFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: percent > 80 ? '#FF3B30' : '#fff' }]} />
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#fff', fontSize: 12, letterSpacing: 2, marginTop: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  statusLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  rowLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 1 },
  rowValue: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  divider: { paddingVertical: 10, marginTop: 10 },
  dividerText: { color: '#fff', fontSize: 10, letterSpacing: 3, opacity: 0.5 },
  barTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 12, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', padding: 14, marginTop: 24, borderRadius: 2 },
  refreshText: { color: '#000', fontWeight: 'bold', letterSpacing: 2, fontSize: 13 }
});

export default DevServerHealthScreen;
