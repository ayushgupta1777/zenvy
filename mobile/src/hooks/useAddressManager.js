import { useState, useEffect, useCallback } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import api from '../services/api';

const useAddressManager = (onSuccess) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingPincode, setIsSearchingPincode] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/addresses');
      setAddresses(response.data.data.addresses || []);
    } catch (error) {
      console.error('Fetch addresses error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Zenvy needs access to your location to autofill your address.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return Alert.alert('Permission Denied', 'Allow location access to use this feature.');

    setIsLocating(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await api.get(`/addresses/reverse-geocode?lat=${latitude}&lng=${longitude}`);
          if (response.data.success) {
            onSuccess && onSuccess(response.data.data);
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to get address from your location.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        Alert.alert('Error', 'Failed to get your current location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const lookupPincode = async (pincode) => {
    if (pincode.length !== 6) return;
    setIsSearchingPincode(true);
    try {
      const response = await api.get(`/addresses/pincode/${pincode}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.log('Pincode lookup failed');
    } finally {
      setIsSearchingPincode(false);
    }
  };

  const deleteAddress = async (id) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/addresses/${id}`);
            fetchAddresses();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete address.');
          }
        }
      }
    ]);
  };

  return {
    addresses,
    isLoading,
    isLocating,
    isSearchingPincode,
    getCurrentLocation,
    lookupPincode,
    deleteAddress,
    refresh: fetchAddresses
  };
};

export default useAddressManager;
