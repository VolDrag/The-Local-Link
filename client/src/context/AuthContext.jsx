import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch {
        const storedToken = authService.getStoredToken();
        const storedUser = authService.getStoredUser();
        if (storedToken && storedUser) {
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch {
            await authService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.register(userData);
      setUser(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.login(credentials);
      setUser(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.adminLogin(credentials);
      setUser(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Admin login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    adminLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isProvider: user?.role === 'provider',
    isSeeker: user?.role === 'seeker',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
