// ============================================
// mobile/src/screens/auth/RegisterScreenPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'register-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  'register-premium-scroll': {
    flexGrow: 1,
    paddingBottom: 40,
  },
  
  'register-premium-header': {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  
  'register-premium-title': {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  
  'register-premium-subtitle': {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  
  'register-premium-form': {
    paddingHorizontal: 24,
  },
  
  'register-premium-input-group': {
    marginBottom: 20,
  },
  
  'register-premium-input-label': {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  
  'register-premium-optional': {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  
  'register-premium-input-container': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'register-premium-input-icon': {
    marginRight: 12,
  },
  
  'register-premium-input-field': {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  
  'register-premium-eye-button': {
    padding: 4,
  },
  
  'register-premium-role-container': {
    gap: 12,
  },
  
  'register-premium-role-card': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'register-premium-role-card-active': {
    borderColor: '#0A84FF',
    backgroundColor: '#F0F9FF',
  },
  
  'register-premium-role-icon-container': {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  'register-premium-role-text': {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  
  'register-premium-role-text-active': {
    color: '#0A84FF',
  },
  
  'register-premium-role-check': {
    marginLeft: 8,
  },
  
  'register-premium-button': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    height: 56,
    marginTop: 12,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  'register-premium-button-disabled': {
    opacity: 0.6,
  },
  
  'register-premium-button-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  
  'register-premium-terms': {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  
  'register-premium-terms-link': {
    color: '#0A84FF',
    fontWeight: '600',
  },
  
  'register-premium-footer': {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  
  'register-premium-footer-text': {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  'register-premium-footer-link': {
    fontSize: 15,
    color: '#0A84FF',
    fontWeight: '700',
  },
});