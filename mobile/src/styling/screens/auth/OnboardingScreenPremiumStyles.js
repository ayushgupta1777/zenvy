// ============================================
// mobile/src/screens/auth/OnboardingScreenPremiumStyles.js
// ============================================
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  'onboarding-premium-container': {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  
  'onboarding-premium-gradient': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#FFF8E1',
    opacity: 0.6,
  },
  
  'onboarding-premium-content': {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  
  'onboarding-premium-logo-section': {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  'onboarding-premium-logo-container': {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#D4AF37',
  },
  
  'onboarding-premium-logo-image': {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  
  'onboarding-premium-brand': {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 1,
    marginBottom: 6,
  },
  
  'onboarding-premium-brand-subtitle': {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 4,
  },
  
  'onboarding-premium-hero': {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  'onboarding-premium-title': {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  
  'onboarding-premium-subtitle': {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  
  'onboarding-premium-features': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30,
  },
  
  'onboarding-premium-feature-card': {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 110,
  },
  
  'onboarding-premium-feature-icon': {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  'onboarding-premium-feature-text': {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  'onboarding-premium-buttons': {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 10,
  },
  
  'onboarding-premium-button-primary': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    height: 54,
    marginBottom: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  
  'onboarding-premium-button-primary-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  
  'onboarding-premium-button-secondary': {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 54,
    borderWidth: 2,
    borderColor: '#D4AF37',
    marginBottom: 20,
  },
  
  'onboarding-premium-button-secondary-text': {
    fontSize: 17,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  
  'onboarding-premium-terms': {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});