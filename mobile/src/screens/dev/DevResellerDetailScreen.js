import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, Dimensions, Vibration
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import api from '../../services/api';
import { COLORS, DEV_STYLES } from './utils/DevTheme';

const { width } = Dimensions.get('window');

const DevResellerDetailScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unmasked, setUnmasked] = useState(false);

  useEffect(() => {
    fetchResellerDetail();
  }, []);

  const fetchResellerDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dev/users');
      const found = response.data.data.users.find(u => u._id === userId);
      setUser(found);
    } catch (err) {
      Alert.alert('SYSTEM ERROR', 'UNABLE TO RETRIEVE RESELLER METADATA');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.emerald} />
        <Text style={styles.loadingText}>DECRYPTING RECORDS...</Text>
      </View>
    );
  }

  const res = user.resellerApplication || {};
  const pay = user.paymentMethods || {};

  return (
    <SafeAreaView style={DEV_STYLES.container}>
      <ScrollView stickyHeaderIndices={[0]}>
        {/* Animated Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[COLORS.emerald, COLORS.forest]}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.avatarLarge}>
                <Icon name="business" size={40} color={COLORS.emerald} />
              </View>
              <Text style={styles.headerName}>{(res.businessName || user.name || 'UNKNOWN').toUpperCase()}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>VERIFIED RESELLER</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Identity Vault */}
          <Section icon="shield-checkmark" title="CREDENTIAL VAULT" color={COLORS.emerald}>
            <View style={styles.vaultCard}>
              <Row label="GMAIL LOGIN" value={user.email || 'N/A'} />
              <View style={styles.passwordRow}>
                <Text style={styles.vaultLabel}>SYSTEM PASSWORD</Text>
                {unmasked ? (
                  <Text style={styles.passwordText}>{user.password || 'HASH_ENCRYPTED'}</Text>
                ) : (
                  <TouchableOpacity 
                    style={styles.unmaskBtn} 
                    onPress={() => { Vibration.vibrate(50); setUnmasked(true); }}
                  >
                    <Icon name="eye-off" size={16} color={COLORS.emerald} style={{ marginRight: 8 }} />
                    <Text style={styles.unmaskText}>TAP TO UNMASK SECRET</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Section>

          {/* Banking Intelligence */}
          <Section icon="card" title="BANKING INTELLIGENCE" color={COLORS.amber}>
             <InfoCard title="Primary Payout Account">
                <Row label="ACC HOLDER" value={pay.accountHolderName || res.accountHolderName || 'N/A'} />
                <Row label="BANK NAME" value={pay.bankName || res.bankName || 'N/A'} />
                <Row label="ACC NUMBER" value={pay.accountNumber || res.accountNumber || 'N/A'} color={COLORS.emerald} />
                <Row label="IFSC CODE" value={pay.ifscCode || res.ifscCode || 'N/A'} />
                <Row label="UPI ID" value={pay.upiId || 'N/A'} />
             </InfoCard>
          </Section>

          {/* Performance Insight */}
          <Section icon="trending-up" title="PERFORMANCE DATA" color="#8B5CF6">
            <View style={styles.statsGrid}>
              <StatBox label="TOTAL REVENUE" value={`₹${pay.totalEarnings || 0}`} icon="cash" />
              <StatBox label="PENDING AMOUNT" value={`₹${pay.pendingAmount || 0}`} icon="time" />
              <StatDivider />
              <StatBox label="ORDER COUNT" value="24" icon="cart" />
              <StatBox label="NETWORK SIZE" value="12" icon="people" />
            </View>
          </Section>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('ACTION', 'INITIATING SYSTEM OVERRIDE...')}
          >
            <Icon name="rocket" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.actionText}>SYSTEM OVERRIDE</Text>
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ icon, title, color, children }) => (
  <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={18} color={color} />
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
    {children}
  </Animated.View>
);

const Row = ({ label, value, color }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, color && { color }]}>{value}</Text>
  </View>
);

const InfoCard = ({ title, children }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoCardTitle}>{title}</Text>
    {children}
  </View>
);

const StatBox = ({ label, value, icon }) => (
  <View style={styles.statBox}>
    <View style={styles.statIcon}>
      <Icon name={icon} size={16} color={COLORS.emerald} />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const StatDivider = () => <View style={styles.statDivider} />;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 15, fontSize: 12, fontWeight: 'bold', color: COLORS.emerald, letterSpacing: 2 },
  headerContainer: { overflow: 'hidden' },
  header: { padding: 24, paddingTop: 40, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  backBtn: { position: 'absolute', top: 50, left: 24, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerContent: { alignItems: 'center', marginTop: 10 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  headerName: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 1, textAlign: 'center' },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  roleText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  content: { padding: 20 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  vaultCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.1)', shadowColor: COLORS.emerald, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  vaultLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.textSub, marginBottom: 8, letterSpacing: 1 },
  passwordRow: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  passwordText: { fontSize: 13, color: COLORS.forest, fontWeight: 'bold' },
  unmaskBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.05)', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  unmaskText: { fontSize: 11, fontWeight: '800', color: COLORS.emerald },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  rowLabel: { fontSize: 11, color: COLORS.textSub, fontWeight: '600' },
  rowValue: { fontSize: 12, color: COLORS.forest, fontWeight: '800', textAlign: 'right', maxWidth: '60%' },
  infoCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  infoCardTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.forest, marginBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: COLORS.white, borderRadius: 24, padding: 20, justifyContent: 'space-between' },
  statBox: { width: '45%', marginBottom: 20 },
  statIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 9, color: COLORS.textSub, fontWeight: '700', letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '900', color: COLORS.forest, marginTop: 4 },
  statDivider: { width: '100%', height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 },
  actionButton: { backgroundColor: COLORS.emerald, paddingVertical: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.emerald, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});

export default DevResellerDetailScreen;
