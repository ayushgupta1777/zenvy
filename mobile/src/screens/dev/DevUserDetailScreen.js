import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Vibration
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const ROLE_COLORS = { developer: '#FF3B30', admin: '#FF9500', reseller: '#FFD60A', vendor: '#34C759', customer: '#fff', delivery_agent: '#5AC8FA' };

const DevUserDetailScreen = ({ route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHash, setShowHash] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const userResponse = await api.get('/dev/users');
      const foundUser = userResponse.data.data.users.find(u => u._id === userId);
      setUser(foundUser);

      const activityResponse = await api.get(`/dev/activity/${userId}`);
      setActivities(activityResponse.data.data.activities);
    } catch {
      Alert.alert('SYSTEM ERROR', 'UNABLE TO ACCESS DATA');
    } finally { setIsLoading(false); }
  };

  const handleResetPassword = () => {
    Alert.prompt(
      'FORCE_PASSWORD_RESET',
      `NEW PASSWORD FOR ${(user?.name || '').toUpperCase()}`,
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'RESET', style: 'destructive', onPress: async (newPass) => {
            if (!newPass) return;
            try {
              await api.post(`/dev/users/${userId}/reset-password`, { newPassword: newPass });
              Alert.alert('SUCCESS', 'CREDENTIALS UPDATED');
            } catch { Alert.alert('ERROR', 'OVERRIDE FAILED'); }
          }
        }
      ]
    );
  };

  const handleSuspend = async () => {
    const isActive = user?.isActive !== false;
    Alert.alert(
      isActive ? '⚠ SUSPEND USER' : '✅ RESTORE USER',
      `${isActive ? 'Suspend' : 'Reactivate'} ${user?.name}?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'CONFIRM', style: 'destructive', onPress: async () => {
            const endpoint = isActive ? `/dev/users/${userId}/suspend` : `/dev/users/${userId}/unsuspend`;
            await api.post(endpoint);
            fetchData();
          }
        }
      ]
    );
  };

  if (isLoading || !user) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={s.loadText}>DECRYPTING_USER_FILE...</Text>
      </View>
    );
  }

  const roleColor = ROLE_COLORS[user.role] || '#fff';
  const isReseller = user.role === 'reseller' || user.resellerData;
  const r = user.resellerData;

  return (
    <View style={s.container}>
      <ScrollView>
        {/* Header */}
        <View style={[s.header, { borderBottomColor: roleColor }]}>
          <View style={[s.avatar, { backgroundColor: roleColor }]}>
            <Icon name="person" size={36} color="#000" />
          </View>
          <Text style={s.name}>{(user.name || 'UNKNOWN').toUpperCase()}</Text>
          <Text style={s.uid}>UID: {user._id}</Text>
          <View style={[s.roleBadge, { borderColor: roleColor }]}>
            <Text style={[s.roleText, { color: roleColor }]}>{user.role.toUpperCase()}</Text>
          </View>
          <View style={s.statusRow}>
            <View style={[s.statusDot, { backgroundColor: user.isActive !== false ? '#4ADE80' : '#FF3B30' }]} />
            <Text style={s.statusText}>{user.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}</Text>
          </View>
        </View>

        {/* Core Identifiers */}
        <Section title="CORE_IDENTIFIERS">
          <Row label="NAME"           value={user.name || 'NULL'} />
          <Row label="EMAIL"          value={user.email || 'NULL'} />
          <Row label="PHONE"          value={user.phone || 'NULL'} />
          <Row label="ROLE"           value={user.role?.toUpperCase()} color={roleColor} />
          <Row label="JOINED"         value={new Date(user.createdAt).toLocaleDateString()} />
          <Row label="LAST_LOGIN"     value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'NEVER'} />
          <Row label="EMAIL_VERIFIED" value={user.emailVerified ? 'YES' : 'NO'} />
        </Section>

        {/* Reseller Section */}
        {isReseller && r && (
          <Section title="RESELLER_INTELLIGENCE">
            <Row label="REFERRAL_CODE"  value={r.referralCode || 'N/A'} color="#FFD60A" />
            <Row label="TOTAL_EARNINGS" value={`₹${r.totalEarnings || 0}`} color="#FFD60A" />
            <Row label="PENDING_PAYOUT" value={`₹${r.pendingAmount || 0}`} />
          </Section>
        )}

        {/* Encryption */}
        <Section title="ENCRYPTION_LAYER">
          <View style={s.hashBox}>
            <Text style={s.label}>PWD_HASH (BCRYPT)</Text>
            {showHash
              ? <Text style={s.hashText}>{user.password || 'HASH_UNAVAILABLE'}</Text>
              : <TouchableOpacity onPress={() => { Vibration.vibrate([0, 50, 20, 50]); setShowHash(true); }}>
                  <Text style={s.unmaskBtn}>⚠ TAP TO UNMASK ENCRYPTED HASH</Text>
                </TouchableOpacity>
            }
          </View>
        </Section>

        {/* Actions */}
        <Section title="SYSTEM_ACTIONS">
          <TouchableOpacity style={s.actionBtn} onPress={handleResetPassword}>
            <Icon name="key-outline" size={18} color="#000" />
            <Text style={s.actionBtnText}>FORCE_PASSWORD_RESET</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: user.isActive !== false ? '#FF3B30' : '#4ADE80', marginTop: 10 }]} onPress={handleSuspend}>
            <Icon name={user.isActive !== false ? 'ban' : 'checkmark-circle'} size={18} color="#fff" />
            <Text style={[s.actionBtnText, { color: '#fff' }]}>
              {user.isActive !== false ? 'SUSPEND_ACCOUNT' : 'RESTORE_ACCOUNT'}
            </Text>
          </TouchableOpacity>
        </Section>

        {/* Activity */}
        <Section title={`ACTIVITY_LOGS — ${activities.length} ENTRIES`}>
          {activities.length === 0
            ? <Text style={s.emptyText}>NO HISTORY_</Text>
            : activities.map((act, i) => (
              <View key={i} style={s.actItem}>
                <View style={s.actDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.actScreen}>{(act.screen || '').toUpperCase()}</Text>
                  {act.productTitle && <Text style={s.actProduct}>► {act.productTitle.toUpperCase()}</Text>}
                  <Text style={s.actTime}>{new Date(act.timestamp).toLocaleString()}</Text>
                </View>
              </View>
            ))
          }
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const Section = ({ title, children }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Row = ({ label, value, color }) => (
  <View style={s.row}>
    <Text style={s.label}>{label}</Text>
    <Text style={[s.value, color && { color }]}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#fff', fontSize: 12, marginTop: 20, letterSpacing: 3 },
  header: { padding: 28, alignItems: 'center', borderBottomWidth: 2 },
  avatar: { width: 72, height: 72, borderRadius: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  uid: { color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 4, letterSpacing: 1 },
  roleBadge: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 3, marginTop: 12, borderRadius: 2 },
  roleText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: 10, letterSpacing: 1 },
  section: { padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 2, fontWeight: 'bold', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700' },
  value: { color: '#fff', fontSize: 11, fontWeight: 'bold', maxWidth: '55%', textAlign: 'right' },
  hashBox: { borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.2)', padding: 14 },
  hashText: { color: '#fff', fontSize: 9, lineHeight: 14, marginTop: 8 },
  unmaskBtn: { color: '#FF3B30', fontSize: 11, fontWeight: 'bold', marginTop: 8, textDecorationLine: 'underline' },
  actionBtn: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 13, borderRadius: 2 },
  actionBtnText: { color: '#000', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  actItem: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', marginTop: 5 },
  actScreen: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  actProduct: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 },
  actTime: { color: 'rgba(255,255,255,0.25)', fontSize: 9, marginTop: 4 },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: 1 },
});

export default DevUserDetailScreen;
