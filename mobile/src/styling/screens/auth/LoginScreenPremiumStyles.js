// ============================================
// mobile/src/screens/auth/LoginScreenPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'login-premium-container': {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  'login-premium-scroll': {
    flexGrow: 1,
    paddingBottom: 40,
  },
  
  'login-premium-header': {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  
  'login-premium-logo-container': {
    marginBottom: 16,
  },
  
  'login-premium-logo-wrapper': {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  
  'login-premium-logo-image': {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  
  'login-premium-brand-container': {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  'login-premium-brand-name': {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 1,
    marginBottom: 4,
  },
  
  'login-premium-brand-tagline': {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  
  'login-premium-title': {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  
  'login-premium-subtitle': {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  
  'login-premium-form': {
    paddingHorizontal: 24,
  },
  
  'login-premium-input-group': {
    marginBottom: 24,
  },
  
  'login-premium-input-label': {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  
  'login-premium-input-container': {
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
  
  'login-premium-input-icon': {
    marginRight: 12,
  },
  
  'login-premium-input-field': {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  
  'login-premium-password-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  'login-premium-forgot-text': {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  
  'login-premium-eye-button': {
    padding: 4,
  },
  
  'login-premium-button': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    height: 56,
    marginTop: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  'login-premium-button-disabled': {
    opacity: 0.6,
  },
  
  'login-premium-button-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  
  'login-premium-divider': {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  
  'login-premium-divider-line': {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  
  'login-premium-divider-text': {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  
  'login-premium-social-container': {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  
  'login-premium-social-button': {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  'login-premium-footer': {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  'login-premium-footer-text': {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  'login-premium-footer-link': {
    fontSize: 15,
    color: '#D4AF37',
    fontWeight: '700',
  },
});