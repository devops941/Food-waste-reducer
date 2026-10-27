import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Cloudflare Tunnel endpoint that routes globally to your local port 5000 (works on Wi-Fi, 4G/5G, and Expo tunnel)
export const CLOUDFLARE_TUNNEL_URL = 'https://food-waste-reducer-3.onrender.com/api';
const LOCAL_PC_IP = '192.168.1.30';

const DEV_API_URL = Platform.select({
  web: 'http://localhost:5000/api',
  android: CLOUDFLARE_TUNNEL_URL,
  ios: CLOUDFLARE_TUNNEL_URL,
  default: CLOUDFLARE_TUNNEL_URL,
});

export const BASE_URL_STORAGE_KEY = '@pantry_fresh_base_url';

const apiClient = axios.create({
  baseURL: DEV_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// Attach JWT token from AsyncStorage to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    if (Platform.OS === 'web') {
      config.baseURL = 'http://localhost:5000/api';
    } else {
      let customUrl = await AsyncStorage.getItem(BASE_URL_STORAGE_KEY);
      // Auto-migrate stale local IPs or dead tunnels to the live Cloudflare tunnel
      if (customUrl && (customUrl.includes('192.168.1.9') || customUrl.includes('192.168.1.30') || customUrl.includes('.loca.lt'))) {
        customUrl = CLOUDFLARE_TUNNEL_URL;
        await AsyncStorage.setItem(BASE_URL_STORAGE_KEY, customUrl);
      }
      if (customUrl) {
        config.baseURL = customUrl;
      }
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      console.warn(
        `[Network Error] Could not reach backend at ${error.config?.baseURL || DEV_API_URL}. Ensure server is running on port 5000 and computer firewall allows incoming connections.`
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
