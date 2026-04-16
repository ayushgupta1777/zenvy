import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const STATUS_COLOR = (code) => {
  if (code >= 500) return '#FF3B30';
  if (code >= 400) return '#FF9500';
  return '#fff';
};

const DevErrorLogScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dev/errors');
      setLogs(res.data.data.logs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); const t = setInterval(fetch, 15000); return () => clearInterval(t); }, []);

  const renderItem = ({ item }) => (
    <View style={s.logItem}>
      <View style={s.logHeader}>
        <Text style={[s.status, { color: STATUS_COLOR(item.status) }]}>{item.status}</Text>
        <Text style={s.method}>{item.method}</Text>
        <Text style={s.path} numberOfLines={1}>{item.path}</Text>
      </View>
      <Text style={s.message}>{item.message}</Text>
      <Text style={s.time}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  if (loading) return <View style={s.center}><ActivityIndicator color="#FF3B30" /><Text style={s.loadText}>SCANNING CRASH LOGS...</Text></View>;

  return (
    <View style={s.container}>
      <View style={s.toolbar}>
        <Text style={s.count}>{logs.length} ENTRIES</Text>
        <TouchableOpacity onPress={fetch}>
          <Icon name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={logs}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={<View style={s.emptyBox}><Icon name="checkmark-circle-outline" size={48} color="#fff" /><Text style={s.emptyText}>NO ERRORS DETECTED_</Text></View>}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#FF3B30', fontSize: 12, letterSpacing: 2, marginTop: 12 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#fff' },
  count: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  logItem: { borderLeftWidth: 2, borderLeftColor: '#FF3B30', paddingLeft: 12, marginBottom: 16 },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  status: { fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
  method: { color: '#fff', fontSize: 11, opacity: 0.6, fontWeight: 'bold' },
  path: { color: 'rgba(255,255,255,0.5)', fontSize: 11, flex: 1 },
  message: { color: '#fff', fontSize: 12, marginBottom: 4 },
  time: { color: 'rgba(255,255,255,0.3)', fontSize: 9 },
  emptyBox: { alignItems: 'center', marginTop: 80, opacity: 0.3 },
  emptyText: { color: '#fff', fontSize: 12, letterSpacing: 2, marginTop: 12 },
});

export default DevErrorLogScreen;
