import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const DevDeviceIntelScreen = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dev/devices')
      .then(r => setActivity(r.data.data.activity || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Icon name="person-circle-outline" size={22} color="#fff" />
        <Text style={s.name}>{(item.user?.name || 'UNKNOWN').toUpperCase()}</Text>
      </View>
      <Row label="EMAIL" value={item.user?.email || 'N/A'} />
      <Row label="SCREEN" value={(item.screen || '--').toUpperCase()} />
      <Row label="TIME" value={new Date(item.timestamp).toLocaleString()} />
    </View>
  );

  if (loading) return <View style={s.center}><ActivityIndicator color="#fff" /><Text style={s.loadText}>PROBING DEVICES...</Text></View>;

  return (
    <FlatList
      data={activity}
      renderItem={renderItem}
      keyExtractor={(_, i) => String(i)}
      style={s.container}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={<Text style={s.empty}>NO DEVICE DATA_</Text>}
    />
  );
};

const Row = ({ label, value }) => (
  <View style={s.row}>
    <Text style={s.label}>{label}</Text>
    <Text style={s.value} numberOfLines={1}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#fff', fontSize: 12, letterSpacing: 2, marginTop: 12 },
  card: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  name: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  value: { color: '#fff', fontSize: 11, fontWeight: 'bold', maxWidth: '60%', textAlign: 'right' },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 80, fontSize: 12, letterSpacing: 2 },
});

export default DevDeviceIntelScreen;
