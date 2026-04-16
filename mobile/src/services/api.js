// ============================================
// mobile/src/services/api.js
// ============================================
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL as ENV_API_BASE_URL, BASE_URL as ENV_BASE_URL } from '@env';

// Base URL - Environment Based
const API_BASE_URL = ENV_API_BASE_URL || 'http://192.168.10.10:5000/api';
export const BASE_URL = ENV_BASE_URL || 'http://192.168.10.10:5000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;

  // Handle paths starting with /
  let path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // If it's a relative path starting with /uploads, it's already full
  if (path.startsWith('/uploads/')) {
    return `${BASE_URL}${path}`;
  }

  // If it's a filename starting with 'temp-', prepend /temp/
  if (path.startsWith('/temp-')) {
    return `${BASE_URL}/temp${path}`;
  }

  // If it contains 'temp/' but not '/uploads/', it might be a direct alias
  if (path.includes('temp/') && !path.startsWith('/uploads/')) {
    return `${BASE_URL}${path}`;
  }

  // Default fallback: assume it might be in uploads or just prepend base
  // Check if it already has a folder prefix like /banners/, /products/ etc.
  const knownPrefixes = ['/products/', '/banners/', '/logos/', '/users/', '/temp/'];
  const hasPrefix = knownPrefixes.some(prefix => path.startsWith(prefix));

  if (hasPrefix) {
    return `${BASE_URL}${path}`;
  }

  // If no prefix, default to /uploads/
  return `${BASE_URL}/uploads${path}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigate to login screen (implement with navigation ref if needed)
    }
    return Promise.reject(error);
  }
);

export default api;
