// ============================================
// mobile/src/screens/profile/ProfilePremiumStyles.js
// ============================================
import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const shadowStyles = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.2,
  shadowRadius: 10,
  elevation: Platform.OS === 'android' ? 6 : 0,
};

export const styles = StyleSheet.create({
  // ========== CONTAINER ==========
  'profile-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // ========== HEADER SECTION ==========
  'profile-premium-header': {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  'profile-premium-avatar': {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...shadowStyles,
  },

  'profile-premium-name': {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  'profile-premium-email': {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 14,
  },

  'profile-premium-role-badge': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#5E5CE6',
    borderRadius: 12,
  },

  'profile-premium-role-text': {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'capitalize',
  },

  // ========== STATS SECTION ==========
  'profile-premium-stats-section': {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },

  'profile-premium-stat-card': {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...shadowStyles,
  },

  'profile-premium-stat-label': {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 4,
  },

  'profile-premium-stat-value': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // ========== MENU SECTION ==========
  'profile-premium-menu-section': {
    paddingHorizontal: 16,
    marginVertical: 12,
  },

  'profile-premium-section-title': {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A4A4A',
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  'profile-premium-menu-item': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  'profile-premium-menu-icon-bg': {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  'profile-premium-menu-title': {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // ========== LOGOUT SECTION ==========
  'profile-premium-logout-section': {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },

  'profile-premium-logout-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF3B30',
  },

  'profile-premium-logout-text': {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },

  // ========== VERSION SECTION ==========
  'profile-premium-version-section': {
    alignItems: 'center',
    paddingVertical: 20,
  },

  'profile-premium-version-text': {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
});