// ============================================
// mobile/src/screens/auth/OnboardingScreen.js
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../../styling/screens/auth/OnboardingScreenPremiumStyles';
import AdsngrowFooter from '../../components/AdsngrowFooter';

const OnboardingScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles['onboarding-premium-container']}>
      {/* Gradient Background Overlay */}
      <View style={styles['onboarding-premium-gradient']} />

      {/* Premium Content */}
      <View style={styles['onboarding-premium-content']}>
        {/* Logo Section */}
        <View style={styles['onboarding-premium-logo-section']}>
          <View style={styles['onboarding-premium-logo-container']}>
            <Image
              source={require('../../assets/Logo_NRF.png')}
              style={styles['onboarding-premium-logo-image']}
              resizeMode="contain"
            />
          </View>
          <Text style={styles['onboarding-premium-brand']}>New Raj Fancy</Text>
          <Text style={styles['onboarding-premium-brand-subtitle']}>NRF</Text>
        </View>

        {/* Hero Text */}
        <View style={styles['onboarding-premium-hero']}>
          <Text style={styles['onboarding-premium-title']}>
            Welcome to{'\n'}Your New Raj Fancy
          </Text>
          <Text style={styles['onboarding-premium-subtitle']}>
            Shop exclusive jewelry, become a vendor, or earn as a reseller
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles['onboarding-premium-features']}>
          <View style={styles['onboarding-premium-feature-card']}>
            <View style={[styles['onboarding-premium-feature-icon'], { backgroundColor: '#FFF8E1' }]}>
              <Icon name="cart" size={24} color="#D4AF37" />
            </View>
            <Text style={styles['onboarding-premium-feature-text']}>Shop{'\n'}Premium</Text>
          </View>

          <View style={styles['onboarding-premium-feature-card']}>
            <View style={[styles['onboarding-premium-feature-icon'], { backgroundColor: '#F3E5F5' }]}>
              <Icon name="storefront" size={24} color="#5E5CE6" />
            </View>
            <Text style={styles['onboarding-premium-feature-text']}>Sell{'\n'}Products</Text>
          </View>

          <View style={styles['onboarding-premium-feature-card']}>
            <View style={[styles['onboarding-premium-feature-icon'], { backgroundColor: '#E8F5E9' }]}>
              <Icon name="share-social" size={24} color="#4CAF50" />
            </View>
            <Text style={styles['onboarding-premium-feature-text']}>Earn{'\n'}Money</Text>
          </View>
        </View>
      </View>

      {/* Premium Buttons */}
      <View style={styles['onboarding-premium-buttons']}>
        <TouchableOpacity
          style={styles['onboarding-premium-button-primary']}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles['onboarding-premium-button-primary-text']}>Sign In</Text>
          <Icon name="arrow-forward" size={20} color="#1A1A1A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles['onboarding-premium-button-secondary']}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
        >
          <Text style={styles['onboarding-premium-button-secondary-text']}>Create Account</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles['onboarding-premium-terms']}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>

        {/* Adsngrow Credit */}
        <AdsngrowFooter marginTop={30} paddingBottom={20} />
      </View>
    </ScrollView>
  );
};

export default OnboardingScreen;