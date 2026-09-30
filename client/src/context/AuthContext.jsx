import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pantry_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user on startup if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.getMe();
        if (data?.user) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data?.token && data?.user) {
      localStorage.setItem('pantry_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data?.token && data?.user) {
      localStorage.setItem('pantry_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('pantry_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const data = await authService.updateProfile(profileData);
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export const useAuth = useAuthContext;
