import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, SafeAreaView, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import api from '../../services/api';
import { COLORS, DEV_STYLES } from './utils/DevTheme';

const { width } = Dimensions.get('window');

const DevResellerListScreen = ({ navigation }) => {
  const [resellers, setResellers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResellers();
  }, []);

  const fetchResellers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dev/users');
      // Filter only resellers
      const allResellers = response.data.data.users.filter(u => u.role === 'reseller');
      setResellers(allResellers);
      setFiltered(allResellers);
    } catch (err) {
      Alert.alert('DATABASE ERROR', 'FAILED TO LOAD RESELLER RECORDS');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = resellers.filter(u => 
      u.name.toLowerCase().includes(text.toLowerCase()) ||
      u.resellerApplication?.businessName?.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filtered);
  };

  const renderReseller = ({ item, index }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(500)}
      layout={Layout.springify()}
    >
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('DevResellerDetail', { userId: item._id })}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F0FDF4']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Icon name="person" size={24} color={COLORS.emerald} />
            </View>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>{item._id.slice(-6).toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.name}>{item.name.toUpperCase()}</Text>
          <Text style={styles.businessName}>
            {item.resellerApplication?.businessName || 'UNREGISTERED BUSINESS'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>TOTAL EARNED</Text>
              <Text style={styles.statValue}>₹{item.paymentMethods?.totalEarnings || 0}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>STATUS</Text>
              <Text style={[styles.statValue, { color: COLORS.emerald }]}>
                {item.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
              </Text>
            </View>
          </View>
          
          <Icon name="chevron-forward" size={20} color={COLORS.emerald} style={styles.arrow} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={DEV_STYLES.container}>
      <LinearGradient
        colors={[COLORS.mint, '#FFFFFF']}
        style={styles.container}
      >
        {/* Premium Header */}
        <View style={DEV_STYLES.header}>
          <Text style={DEV_STYLES.headerTitle}>RESELLER INTEL</Text>
          <Text style={DEV_STYLES.headerSubtitle}>CENTRAL DATABASE — VERIFIED PARTNERS</Text>
          
          <View style={styles.searchBox}>
            <Icon name="search" size={20} color={COLORS.emerald} />
            <TextInput 
              style={styles.input}
              placeholder="Search Name or Business..."
              value={search}
              onChangeText={handleSearch}
              placeholderTextColor="rgba(16, 185, 129, 0.4)"
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.emerald} />
            <Text style={styles.loadingText}>ACCESSING SECURE DATA...</Text>
          </View>
        ) : (
          <FlatList 
            data={filtered}
            renderItem={renderReseller}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Icon name="people-outline" size={64} color="rgba(16, 185, 129, 0.1)" />
                <Text style={styles.emptyText}>NO RESELLERS FOUND</Text>
              </View>
            }
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginTop: 20,
    height: 50,
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.forest,
  },
  list: { padding: 20, paddingBottom: 40 },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardGradient: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
  idBadge: { backgroundColor: 'rgba(16, 185, 129, 0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  idText: { fontSize: 10, fontWeight: '800', color: COLORS.emerald, letterSpacing: 1 },
  name: { fontSize: 16, fontWeight: '800', color: COLORS.forest, letterSpacing: 0.5 },
  businessName: { fontSize: 12, color: COLORS.textSub, marginTop: 4, fontWeight: '500' },
  statsRow: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(16, 185, 129, 0.05)', alignItems: 'center' },
  stat: { flex: 1 },
  statLabel: { fontSize: 8, fontWeight: 'bold', color: COLORS.textSub, letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '800', color: COLORS.forest },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(16, 185, 129, 0.1)', marginHorizontal: 15 },
  arrow: { position: 'absolute', bottom: 20, right: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 12, fontWeight: 'bold', color: COLORS.emerald, letterSpacing: 2 },
  empty: { flex: 1, paddingTop: 60, alignItems: 'center' },
  emptyText: { marginTop: 15, color: COLORS.textSub, fontWeight: 'bold', letterSpacing: 2 }
});

export default DevResellerListScreen;
