import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@pantry_fresh_token');
      const storedUser = await AsyncStorage.getItem('@pantry_fresh_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Auto default to Demo Chef for zero-friction testing
        const dummyUser = { name: 'Demo Chef', email: 'demo@pantryfresh.app' };
        setUser(dummyUser);
        setToken('demo_token');
        await AsyncStorage.setItem('@pantry_fresh_token', 'demo_token');
        await AsyncStorage.setItem('@pantry_fresh_user', JSON.stringify(dummyUser));
      }
    } catch (e) {
      console.warn('Failed to load auth from storage', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data?.success || res.data?.token) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user || { name: 'Pantry Chef', email };
        setToken(receivedToken);
        setUser(receivedUser);
        await AsyncStorage.setItem('@pantry_fresh_token', receivedToken);
        await AsyncStorage.setItem('@pantry_fresh_user', JSON.stringify(receivedUser));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Connection error';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await apiClient.post('/auth/register', { name, email, password });
      if (res.data?.success || res.data?.token) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user || { name, email };
        setToken(receivedToken);
        setUser(receivedUser);
        await AsyncStorage.setItem('@pantry_fresh_token', receivedToken);
        await AsyncStorage.setItem('@pantry_fresh_user', JSON.stringify(receivedUser));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration error';
      return { success: false, message: msg };
    }
  };

  const demoLogin = async () => {
    // Allows testing the mobile app even without creating an account
    const dummyUser = { name: 'Demo Chef', email: 'demo@pantryfresh.app' };
    setUser(dummyUser);
    setToken('demo_token');
    await AsyncStorage.setItem('@pantry_fresh_user', JSON.stringify(dummyUser));
    await AsyncStorage.setItem('@pantry_fresh_token', 'demo_token');
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('@pantry_fresh_token');
    await AsyncStorage.removeItem('@pantry_fresh_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
