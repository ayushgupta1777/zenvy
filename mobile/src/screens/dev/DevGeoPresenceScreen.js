import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import api from '../../services/api';

const DevGeoPresenceScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dev/geo')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color="#fff" /><Text style={s.loadText}>TRIANGULATING...</Text></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.sectionTitle}>ORDERS_BY_STATE</Text>
      {(data?.ordersByState || []).map((item, i) => (
        <View key={i} style={s.row}>
          <Text style={s.rank}>#{i + 1}</Text>
          <Text style={s.state}>{(item._id || 'UNKNOWN').toUpperCase()}</Text>
          <Text style={s.count}>{item.orders} ORDERS</Text>
        </View>
      ))}

      <Text style={[s.sectionTitle, { marginTop: 24 }]}>TOP_CITIES_BY_USERS</Text>
      {(data?.cities || []).map((city, i) => (
        <View key={i} style={s.row}>
          <Text style={s.rank}>#{i + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.state}>{(city._id || 'UNKNOWN').toUpperCase()}</Text>
            {city.state ? <Text style={s.sub}>{city.state.toUpperCase()}</Text> : null}
          </View>
          <Text style={s.count}>{city.count} USERS</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#fff', fontSize: 12, letterSpacing: 2, marginTop: 12 },
  sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 2, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  rank: { color: 'rgba(255,255,255,0.4)', fontSize: 12, width: 26 },
  state: { color: '#fff', fontSize: 13, fontWeight: 'bold', flex: 1, letterSpacing: 1 },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },
  count: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

export default DevGeoPresenceScreen;
