import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { COLORS, DEV_STYLES } from './utils/DevTheme';

const { width } = Dimensions.get('window');
const CARD_W = (width - 45) / 2;

const MODULES = [
  { id: 'DevResellerList',    icon: 'business',       label: 'RESELLER\nINTEL',    danger: false, premium: true },
  { id: 'DevFakeChat',       icon: 'chatbubble-ellipses', label: 'CHAT\nSIMULATOR', danger: false, premium: true },
  { id: 'DevServerHealth',   icon: 'server',         label: 'SERVER\nHEALTH',   danger: false },
  { id: 'DevFinancials',     icon: 'cash',           label: 'FINANCIAL\nINTEL',  danger: false },
  { id: 'DevOrderPulse',     icon: 'cart',           label: 'ORDER\nPULSE',     danger: false },
  { id: 'DevUserList',       icon: 'people',         label: 'USER\nDATABASE',   danger: false },
  { id: 'DevGeoPresence',    icon: 'earth',          label: 'GEO\nPRESENCE',    danger: false },
  { id: 'DevErrorLog',       icon: 'warning',        label: 'ERROR\nLOGS',      danger: true  },
  { id: 'DevSecurity',       icon: 'shield-half',    label: 'SECURITY\nALERTS', danger: true  },
  { id: 'DevControlPanel',   icon: 'settings-sharp', label: 'CONTROL\nPANEL',   danger: true  },
];

const DevHubScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const pulseAnims = useRef(MODULES.map(() => new Animated.Value(1))).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    MODULES.forEach((_, i) => {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnims[i], { toValue: 1.02, duration: 1500 + i * 100, useNativeDriver: true }),
        Animated.timing(pulseAnims[i], { toValue: 1,    duration: 1500 + i * 100, useNativeDriver: true }),
      ])).start();
    });
  }, []);

  const handleLogout = () => {
    import('react-native').then(({ Alert }) => {
      Alert.alert(
        "TERMINATE SESSION",
        "ARE YOU SURE YOU WANT TO LOGOUT FROM DEVELOPER TERMINAL?",
        [
          { text: "CANCEL", style: "cancel" },
          { text: "LOGOUT", style: "destructive", onPress: () => dispatch(logout()) }
        ]
      );
    });
  };

  const renderModule = (mod, i) => {
    const isPremium = mod.premium;
    const isDanger = mod.danger;
    
    return (
      <Animated.View 
        key={mod.id} 
        style={[
          { transform: [{ scale: pulseAnims[i] }] },
          styles.cardWrapper
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card, 
            isDanger && styles.dangerCard,
            isPremium && styles.premiumCard
          ]}
          onPress={() => navigation.navigate(mod.id)}
        >
          <LinearGradient
            colors={isPremium ? ['#F0FDF4', '#FFFFFF'] : ['#FFFFFF', '#F9FAFB']}
            style={styles.cardGradient}
          >
            <View style={[
              styles.iconCircle, 
              isDanger && styles.dangerIconCircle,
              isPremium && styles.premiumIconCircle
            ]}>
              <Icon 
                name={mod.icon} 
                size={26} 
                color={isDanger ? COLORS.danger : (isPremium ? COLORS.emerald : COLORS.forest)} 
              />
            </View>
            <Text style={[
              styles.cardLabel, 
              isDanger && styles.dangerLabel,
              isPremium && styles.premiumLabel
            ]}>
              {mod.label}
            </Text>
            {isPremium && <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>PREMIUM</Text></View>}
            {isDanger && <Icon name="alert-circle" size={14} color={COLORS.danger} style={styles.dangerIndicator} />}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={DEV_STYLES.container}>
      <LinearGradient colors={[COLORS.mint, COLORS.white]} style={{ flex: 1 }}>
        <View style={[DEV_STYLES.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={DEV_STYLES.headerTitle}>DEVELOPER HUB</Text>
            <Text style={DEV_STYLES.headerSubtitle}>SYSTEM ARCHITECTURE — PREMIUM MINT EDITION</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Icon name="log-out-outline" size={28} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView 
          style={{ opacity: fadeAnim }} 
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {MODULES.map((mod, i) => renderModule(mod, i))}
          <View style={{ height: 40, width: '100%' }} />
        </Animated.ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    padding: 15, 
    justifyContent: 'space-between' 
  },
  cardWrapper: {
    width: CARD_W,
    marginBottom: 15,
  },
  card: {
    height: CARD_W * 1.05,
    borderRadius: 24,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.05)',
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  premiumCard: {
    borderColor: COLORS.emerald,
    borderWidth: 1.5,
  },
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  premiumIconCircle: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  dangerIconCircle: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  cardLabel: { 
    color: COLORS.forest, 
    fontSize: 10, 
    fontWeight: '800', 
    letterSpacing: 1, 
    textAlign: 'center',
    lineHeight: 14
  },
  premiumLabel: {
    color: COLORS.emerald,
  },
  dangerLabel: {
    color: COLORS.danger,
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 6,
    fontWeight: '900'
  },
  dangerIndicator: {
    position: 'absolute',
    top: 10,
    right: 10
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  }
});

export default DevHubScreen;
