import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const DevSecurityScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dev/security');
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSuspend = (userId, name) => {
    Alert.alert('⚠ SUSPEND USER', `Confirm suspension of ${name}?`, [
      { text: 'CANCEL', style: 'cancel' },
      { text: 'SUSPEND', style: 'destructive', onPress: async () => {
          await api.post(`/dev/users/${userId}/suspend`);
          Alert.alert('DONE', `${name} has been suspended.`);
          fetch();
        }
      }
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#FF3B30" /><Text style={s.loadText}>SCANNING THREATS...</Text></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Section title="⚠ SUSPICIOUS_ACCOUNTS (3+ FAILED LOGINS)">
        {(data?.suspiciousUsers || []).length === 0
          ? <Text style={s.clear}>NO THREATS DETECTED_</Text>
          : (data?.suspiciousUsers || []).map((u, i) => (
            <View key={i} style={s.alertCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.alertName}>{(u.name || 'UNKNOWN').toUpperCase()}</Text>
                <Text style={s.alertSub}>{u.email} • {u.loginAttempts || 0} ATTEMPTS</Text>
              </View>
              <TouchableOpacity style={s.suspendBtn} onPress={() => handleSuspend(u._id, u.name)}>
                <Icon name="ban" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
      </Section>

      <Section title="NEW_ACCOUNTS (LAST 24H)">
        {(data?.newUsers || []).length === 0
          ? <Text style={s.clear}>NO NEW REGISTRATIONS_</Text>
          : (data?.newUsers || []).map((u, i) => (
            <View key={i} style={s.newUserRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.alertName}>{(u.name || 'UNKNOWN').toUpperCase()}</Text>
                <Text style={s.alertSub}>{u.email || u.phone} • {u.role.toUpperCase()}</Text>
              </View>
              <Text style={s.time}>{new Date(u.createdAt).toLocaleTimeString()}</Text>
            </View>
          ))}
      </Section>
    </ScrollView>
  );
};

const Section = ({ title, children }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#FF3B30', fontSize: 12, letterSpacing: 2, marginTop: 12 },
  section: { marginBottom: 28 },
  sectionTitle: { color: '#FF3B30', fontSize: 10, letterSpacing: 2, marginBottom: 14, fontWeight: 'bold' },
  clear: { color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: 1 },
  alertCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#FF3B30', padding: 12, marginBottom: 10 },
  alertName: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
  alertSub: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 3 },
  suspendBtn: { padding: 8 },
  newUserRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', paddingVertical: 10 },
  time: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
});

export default DevSecurityScreen;
