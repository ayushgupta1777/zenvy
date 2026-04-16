import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const ROLE_COLORS = { developer: '#FF3B30', admin: '#FF9500', reseller: '#FFD60A', vendor: '#34C759', customer: '#fff', delivery_agent: '#5AC8FA' };

const DevUserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | reseller | customer | admin

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dev/users');
      const all = response.data.data.users;
      setUsers(all);
      applyFilter(all, filter, search);
    } catch {
      Alert.alert('SYSTEM ERROR', 'CRITICAL DATA ACCESS FAILURE');
    } finally { setIsLoading(false); }
  };

  const applyFilter = (data, f, s) => {
    let result = data;
    if (f !== 'all') result = result.filter(u => u.role === f);
    if (s) {
      const q = s.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    }
    setFilteredUsers(result);
  };

  const handleSearch = (text) => { setSearch(text); applyFilter(users, filter, text); };
  const handleFilter = (f) => { setFilter(f); applyFilter(users, f, search); };

  const renderItem = ({ item }) => {
    const roleColor = ROLE_COLORS[item.role] || '#fff';
    const isReseller = item.role === 'reseller' || item.resellerData;
    return (
      <TouchableOpacity
        style={[styles.userCard, isReseller && { borderColor: ROLE_COLORS.reseller }]}
        onPress={() => navigation.navigate('DevUserDetail', { userId: item._id })}
      >
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{(item.name || 'UNKNOWN').toUpperCase()}</Text>
            <View style={[styles.roleBadge, { borderColor: roleColor }]}>
              <Text style={[styles.roleText, { color: roleColor }]}>{item.role.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.userSub}>{item.email || item.phone || 'NO_ID'}</Text>
          {item.resellerData && (
            <Text style={styles.resellerTag}>
              💰 Earnings: ₹{item.resellerData.totalEarnings || 0}  •  Pending: ₹{item.resellerData.pendingAmount || 0}
            </Text>
          )}
        </View>
        <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
      </TouchableOpacity>
    );
  };

  const FILTERS = ['all', 'customer', 'reseller', 'vendor', 'admin'];

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#fff" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="SEARCH NAME / EMAIL / PHONE..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => handleFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredUsers.length} RECORDS</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>FETCHING_RECORDS...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.emptyText}>NO RECORDS FOUND_</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#fff', paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  chip: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2 },
  chipActive: { backgroundColor: '#fff' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  chipTextActive: { color: '#000' },
  countRow: { paddingHorizontal: 15, paddingVertical: 8 },
  countText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 12, marginTop: 15, letterSpacing: 3 },
  listContent: { padding: 12 },
  userCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', padding: 14, marginBottom: 10, borderRadius: 2 },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  userName: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, flex: 1 },
  roleBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  roleText: { fontSize: 8, fontWeight: 'bold', letterSpacing: 1 },
  userSub: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 4 },
  resellerTag: { color: '#FFD60A', fontSize: 10, marginTop: 2 },
  emptyText: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 60, fontSize: 12, letterSpacing: 2 },
});

export default DevUserListScreen;
