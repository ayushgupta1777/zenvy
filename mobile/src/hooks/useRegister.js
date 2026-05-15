import { useState, useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../redux/slices/authSlice';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

const useRegister = (navigation) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', googleId: '', profileImage: '',
    password: '', confirmPassword: '', role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: true });
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

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
      const userInfo = response.data || response;
      const user = userInfo.user || userInfo;
      setFormData(prev => ({ ...prev, email: user.email, name: user.name, googleId: user.id, profileImage: user.photo }));
      setStep(2);
    } catch (err) {
      if (err.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Google Error', err.message || 'Something went wrong');
      }
    }
  };

  const handleRegister = () => {
    if (formData.password !== formData.confirmPassword) return Alert.alert('Error', 'Passwords do not match');
    dispatch(register({ ...formData, phone }));
  };

  return {
    step, setStep, phone, setPhone, formData, setFormData,
    showPassword, setShowPassword, isLoading,
    handleGoogleSignIn, handleRegister
  };
};

export default useRegister;
