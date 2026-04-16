// ============================================
// mobile/src/screens/auth/LoginScreen.js
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/slices/authSlice';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../../styling/screens/auth/LoginScreenPremiumStyles';
import AdsngrowFooter from '../../components/AdsngrowFooter';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '898387401992-2lohdfq6nabu10ak96c3ovis8uehres5.apps.googleusercontent.com', // User needs to replace this
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
      dispatch(clearError());
    }
  }, [error]);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const userInfo = response.data ? response.data : response;
      const user = userInfo.user || userInfo;

      dispatch(login({ email: user.email, googleId: user.id }));
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available or outdated');
      } else {
        Alert.alert('Google Sign-In Error', error.message || 'Something went wrong');
      }
    }
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    dispatch(login({ email, password }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles['login-premium-container']}
    >
      <ScrollView contentContainerStyle={styles['login-premium-scroll']} showsVerticalScrollIndicator={false}>
        <View style={styles['login-premium-header']}>
          <View style={styles['login-premium-logo-container']}>
            <View style={styles['login-premium-logo-wrapper']}>
              <Image source={require('../../assets/Logo_NRF.png')} style={styles['login-premium-logo-image']} resizeMode="contain" />
            </View>
          </View>
          <View style={styles['login-premium-brand-container']}>
            <Text style={styles['login-premium-brand-name']}>New Raj Fancy</Text>
          </View>
          <Text style={styles['login-premium-title']}>Welcome Back</Text>
          <Text style={styles['login-premium-subtitle']}>Sign in to continue</Text>
        </View>

        <View style={styles['login-premium-form']}>

          <View style={styles['login-premium-input-group']}>
            <Text style={styles['login-premium-input-label']}>Email Address</Text>
            <View style={styles['login-premium-input-container']}>
              <Icon name="mail-outline" size={20} color="#5E5CE6" style={styles['login-premium-input-icon']} />
              <TextInput
                style={styles['login-premium-input-field']}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles['login-premium-input-group']}>
            <View style={styles['login-premium-password-header']}>
              <Text style={styles['login-premium-input-label']}>Password</Text>
              <TouchableOpacity>
                <Text style={styles['login-premium-forgot-text']}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles['login-premium-input-container']}>
              <Icon name="lock-closed-outline" size={20} color="#5E5CE6" style={styles['login-premium-input-icon']} />
              <TextInput
                style={styles['login-premium-input-field']}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles['login-premium-eye-button']}>
                <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles['login-premium-button'], isLoading && styles['login-premium-button-disabled']]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <Text style={styles['login-premium-button-text']}>Sign In</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 25 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            <Text style={{ marginHorizontal: 15, color: '#9CA3AF', fontSize: 14 }}>OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          </View>

          <TouchableOpacity
            style={[styles['login-premium-button'], { backgroundColor: '#4285F4' }]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Icon name="logo-google" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles['login-premium-button-text']}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles['login-premium-footer']}>
            <Text style={styles['login-premium-footer-text']}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles['login-premium-footer-link']}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <AdsngrowFooter marginTop={30} paddingBottom={20} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
