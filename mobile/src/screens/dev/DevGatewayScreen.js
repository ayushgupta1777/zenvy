import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Animated,
  TouchableOpacity, Keyboard, Vibration
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DevGatewayScreen = ({ navigation }) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // The secret passcode to enter the terminal
  const SECRET_PASSCODE = 'root'; // You can change this later

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, []);

  const handleAccess = async () => {
    Keyboard.dismiss();
    
    if (passcode.toLowerCase() === SECRET_PASSCODE) {
      // 1. Success feedback
      Vibration.vibrate([0, 100, 50, 100]);
      
      // 2. Temporarily elevate privileges in Redux
      const elevatedUser = { ...user, role: 'developer' };
      dispatch(updateUser(elevatedUser));
      
      // We don't save this to AsyncStorage! 
      // This ensures if they close the app, they revert to normal admin status for safety.
      
      // Navigation will automatically swap out MainNavigator for DeveloperNavigator inside AppNavigator!
    } else {
      // 3. Failure feedback
      Vibration.vibrate(500);
      setErrorMsg('ACCESS_DENIED: INVALID_CREDENTIALS');
      setPasscode('');
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.terminalBox, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>RESTRICTED_ACCESS</Text>
        <Text style={styles.subText}>DEVELOPER_TERMINAL_V1.0</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.prompt}>root@sys:~$</Text>
          <TextInput
            style={styles.input}
            value={passcode}
            onChangeText={setPasscode}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry // Hides text visually
            selectionColor="#fff"
            autoFocus
            onSubmitEditing={handleAccess}
          />
        </View>

        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : (
          <Text style={styles.infoText}>AWAITING_INPUT...</Text>
        )}

        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>ABORT_SEQUENCE</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 },
  terminalBox: { width: '100%', maxWidth: 400 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 4, marginBottom: 5 },
  subText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 2, marginBottom: 40 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  prompt: { color: '#fff', fontSize: 16, fontFamily: 'monospace', marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'monospace', borderBottomWidth: 1, borderBottomColor: '#fff', paddingBottom: 5 },
  infoText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'monospace', marginTop: 10 },
  errorText: { color: '#EF4444', fontSize: 12, fontFamily: 'monospace', marginTop: 10, fontWeight: 'bold', letterSpacing: 1 },
  cancelBtn: { marginTop: 50, paddingVertical: 10, alignSelf: 'flex-start' },
  cancelText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textDecorationLine: 'underline', letterSpacing: 1 }
});

export default DevGatewayScreen;
