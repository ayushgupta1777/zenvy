// ============================================
// mobile/src/services/socket.js
// ============================================
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './api';

let socket = null;

/**
 * Initialize and connect the socket client.
 * Call this once when the app is authenticated.
 */
export const initSocket = async () => {
  if (socket && socket.connected) return socket;

  const token = await AsyncStorage.getItem('token');

  socket = io(BASE_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected');
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Error:', err.message);
  });

  return socket;
};

/**
 * Get the current socket instance.
 * Returns null if not yet initialized.
 */
export const getSocket = () => socket;

/**
 * Disconnect and clear the socket.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
