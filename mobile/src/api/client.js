import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Cloud backend and local network fallback
export const CLOUDFLARE_TUNNEL_URL = 'https://food-waste-reducer-3.onrender.com/api';
export const LOCAL_PC_IP = '192.168.1.30';
export const LOCAL_API_URL = `http://${LOCAL_PC_IP}:5000/api`;

const DEV_API_URL = CLOUDFLARE_TUNNEL_URL;

export const BASE_URL_STORAGE_KEY = '@pantry_fresh_base_url';

const apiClient = axios.create({
  baseURL: DEV_API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// Attach JWT token from AsyncStorage to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    let customUrl = await AsyncStorage.getItem(BASE_URL_STORAGE_KEY);
    if (customUrl) {
      config.baseURL = customUrl;
    } else {
      config.baseURL = DEV_API_URL;
    }
    let token = await AsyncStorage.getItem('@pantry_fresh_token');
    if (!token) {
      token = 'demo_token';
    }
    config.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    console.warn('[API Client Interceptor Error]', err);
  }
  return config;
});

// Automatic Failover between Render Cloud and Local Server
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      originalRequest &&
      !originalRequest._retry &&
      (error.code === 'ECONNABORTED' || error.message?.includes('Network Error'))
    ) {
      originalRequest._retry = true;
      const currentBase = originalRequest.baseURL || DEV_API_URL;
      const alternateBase = currentBase.includes('onrender.com') ? LOCAL_API_URL : CLOUDFLARE_TUNNEL_URL;
      console.log(`[API Failover] Primary failed (${currentBase}). Retrying via alternate backend: ${alternateBase}`);
      originalRequest.baseURL = alternateBase;
      try {
        return await axios(originalRequest);
      } catch (retryErr) {
        console.warn(`[Network Error] Both endpoints failed (${currentBase} and ${alternateBase}). Ensure server is running on port 5000 or Render has finished booting.`);
        return Promise.reject(retryErr);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
