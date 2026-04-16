import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const DevControlPanelScreen = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    api.get('/dev/maintenance/status')
      .then(r => setMaintenance(r.data.data.maintenanceMode))
      .finally(() => setLoading(false));
  }, []);

  const handleMaintenanceToggle = async () => {
    Alert.alert(
      '⚠ MAINTENANCE MODE',
      maintenance ? 'RESTORE APP TO LIVE?' : 'TAKE APP OFFLINE FOR ALL USERS?',
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'CONFIRM', style: 'destructive', onPress: async () => {
            try {
              setToggling(true);
              const res = await api.post('/dev/maintenance/toggle');
              setMaintenance(res.data.data.maintenanceMode);
              Alert.alert('DONE', res.data.data.message);
            } catch (e) { Alert.alert('ERROR', 'TOGGLE FAILED'); }
            finally { setToggling(false); }
          }
        }
      ]
    );
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#fff" /></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Maintenance Mode */}
      <View style={[s.controlCard, maintenance && s.dangerCard]}>
        <View style={{ flex: 1 }}>
          <Text style={s.controlTitle}>MAINTENANCE_MODE</Text>
          <Text style={s.controlSub}>{maintenance ? '🔴 APP IS OFFLINE' : '🟢 APP IS LIVE'}</Text>
          <Text style={s.controlDesc}>When ON, all users will see a maintenance message and cannot use the app.</Text>
        </View>
        {toggling
          ? <ActivityIndicator color="#fff" />
          : <Switch
              value={maintenance}
              onValueChange={handleMaintenanceToggle}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#FF3B30' }}
              thumbColor={maintenance ? '#fff' : '#fff'}
            />
        }
      </View>

      {/* Broadcast placeholder */}
      <View style={s.controlCard}>
        <View style={{ flex: 1 }}>
          <Text style={s.controlTitle}>BROADCAST_ANNOUNCEMENT</Text>
          <Text style={s.controlDesc}>Send a push notification to all users. (Coming soon)</Text>
        </View>
        <Icon name="megaphone-outline" size={24} color="rgba(255,255,255,0.3)" />
      </View>

      {/* Danger zone */}
      <Text style={s.dangerZone}>⚠ DANGER_ZONE</Text>
      <View style={[s.controlCard, s.dangerCard]}>
        <Icon name="warning-outline" size={24} color="#FF3B30" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[s.controlTitle, { color: '#FF3B30' }]}>MASS_DATA_ACTIONS</Text>
          <Text style={s.controlDesc}>Actions here affect all users. Use with extreme caution.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  controlCard: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  dangerCard: { borderColor: '#FF3B30' },
  controlTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  controlSub: { color: '#fff', fontSize: 12, marginBottom: 6, fontWeight: 'bold' },
  controlDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 16 },
  dangerZone: { color: '#FF3B30', fontSize: 10, letterSpacing: 2, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
});

export default DevControlPanelScreen;
