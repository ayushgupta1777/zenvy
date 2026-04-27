import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../../styling/screens/auth/RegisterScreenPremiumStyles';
import useRegister from '../../hooks/useRegister';

const RegisterScreen = ({ navigation }) => {
  const {
    step, setStep, phone, setPhone, formData, setFormData,
    showPassword, setShowPassword, isLoading,
    handleGoogleSignIn, handleRegister
  } = useRegister(navigation);

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
      <TouchableOpacity 
        style={styles['register-premium-back-button']}
        onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}
      >
        <Icon name="chevron-back" size={28} color="#111827" />
      </TouchableOpacity>

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
              <TouchableOpacity style={styles['register-premium-button']} onPress={() => phone.length >= 10 ? setStep(3) : Alert.alert('Error', 'Invalid phone')}>
                <Text style={styles['register-premium-button-text']}>Continue</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View>
              <View style={styles['register-premium-input-group']}>
                <Text style={styles['register-premium-input-label']}>Create Password</Text>
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
