import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Request location permission on Android
 * @returns {Promise<boolean>} True if granted, false otherwise
 */
export const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location to provide better service.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Permission request error:', err);
    return false;
  }
};

/**
 * Check if location permission is already granted
 * @returns {Promise<boolean>} True if granted, false otherwise
 */
export const checkLocationPermission = async () => {
  if (Platform.OS !== 'android') return true;
  
  try {
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
  } catch (err) {
    console.warn('Permission check error:', err);
    return false;
  }
};
