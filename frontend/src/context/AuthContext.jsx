import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bizwebcheck_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bizwebcheck_token'));
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user and subscription on load
  const refreshProfile = async () => {
    const currentToken = localStorage.getItem('bizwebcheck_token');
    if (!currentToken) {
      setUser(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setSubscription(res.data.subscription);
        localStorage.setItem('bizwebcheck_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session expired or failed to load profile:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('bizwebcheck_token', res.data.token);
      localStorage.setItem('bizwebcheck_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setSubscription(res.data.subscription);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('bizwebcheck_token', res.data.token);
      localStorage.setItem('bizwebcheck_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setSubscription(res.data.subscription);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('bizwebcheck_token');
    localStorage.removeItem('bizwebcheck_user');
    setToken(null);
    setUser(null);
    setSubscription(null);
  };

  const value = {
    user,
    token,
    subscription,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    setSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
