// ============================================
// mobile/src/screens/auth/RegisterScreen.js
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
  BackHandler
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../redux/slices/authSlice';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../../styling/screens/auth/RegisterScreenPremiumStyles';

const RegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Google Auth, 2: Phone, 3: Password
  const [phone, setPhone] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    googleId: '',
    profileImage: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '898387401992-2lohdfq6nabu10ak96c3ovis8uehres5.apps.googleusercontent.com', // User needs to replace this
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    const backAction = () => {
      if (step > 1 && step <= 3) {
        setStep(step - 1);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [step]);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const userInfo = response.data ? response.data : response; // Handle different package versions
      const user = userInfo.user || userInfo;

      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.name || '',
        googleId: user.id || '',
        profileImage: user.photo || ''
      }));
      setStep(2);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available or outdated');
      } else {
        Alert.alert('Google Sign-In Error', error.message || 'Something went wrong');
      }
    }
  };

  const validatePhoneAndContinue = () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setStep(3);
  };

  const handleRegister = () => {
    const { name, email, googleId, profileImage, password, confirmPassword, role } = formData;

    if (!password) {
      Alert.alert('Error', 'Password is required');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    dispatch(register({
      name,
      email,
      googleId,
      profileImage,
      phone,
      password,
      role
    }));
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30, gap: 10 }}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={[{ width: 30, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' }, step >= s && { backgroundColor: '#5E5CE6' }]} />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles['register-premium-container']}>
      <ScrollView contentContainerStyle={styles['register-premium-scroll']} showsVerticalScrollIndicator={false}>
        <View style={styles['register-premium-header']}>
          <Text style={styles['register-premium-title']}>Join Us</Text>
          <Text style={styles['register-premium-subtitle']}>
            Step {step} of 3: {step === 1 ? 'Verify Google' : step === 2 ? 'Mobile Number' : 'Create Password'}
          </Text>
        </View>

        <View style={styles['register-premium-form']}>
          {renderStepIndicator()}

          {step === 1 && (
            <View>
              <Text style={{ textAlign: 'center', marginBottom: 20, color: '#6B7280' }}>
                Quickly sign up using your Google account. Your email will be automatically verified.
              </Text>

              <TouchableOpacity style={[styles['register-premium-button'], { backgroundColor: '#4285F4' }]} onPress={handleGoogleSignIn}>
                <Icon name="logo-google" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles['register-premium-button-text']}>Continue with Google</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <View style={styles['register-premium-input-group']}>
                <Text style={styles['register-premium-input-label']}>Phone Number</Text>
                <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>We need your mobile number for shipping and delivery updates.</Text>
                <View style={styles['register-premium-input-container']}>
                  <Icon name="call-outline" size={20} color="#5E5CE6" style={styles['register-premium-input-icon']} />
                  <TextInput
                    style={styles['register-premium-input-field']}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles['register-premium-button']} onPress={validatePhoneAndContinue}>
                <Text style={styles['register-premium-button-text']}>Continue</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View>
              <View style={styles['register-premium-input-group']}>
                <Text style={styles['register-premium-input-label']}>Create Password</Text>
                <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>Create a password so you can also log in using your email and password later.</Text>
                <View style={styles['register-premium-input-container']}>
                  <Icon name="lock-closed-outline" size={20} color="#5E5CE6" style={styles['register-premium-input-icon']} />
                  <TextInput
                    style={styles['register-premium-input-field']}
                    placeholder="Password"
                    value={formData.password}
                    onChangeText={(v) => updateFormData('password', v)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles['register-premium-eye-button']}>
                    <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles['register-premium-input-group']}>
                <Text style={styles['register-premium-input-label']}>Confirm Password</Text>
                <View style={styles['register-premium-input-container']}>
                  <Icon name="lock-closed-outline" size={20} color="#5E5CE6" style={styles['register-premium-input-icon']} />
                  <TextInput
                    style={styles['register-premium-input-field']}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChangeText={(v) => updateFormData('confirmPassword', v)}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles['register-premium-button']} onPress={handleRegister} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={styles['register-premium-button-text']}>Complete Registration</Text>
                    <Icon name="checkmark-circle" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles['register-premium-footer']}>
            <Text style={styles['register-premium-footer-text']}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles['register-premium-footer-link']}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
