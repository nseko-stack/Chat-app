import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('pulsechat_token');
        const savedUser = localStorage.getItem('pulsechat_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Verify with backend silently
          try {
            const meRes = await userAPI.getMe();
            if (meRes.user) {
              const updated = {
                id: meRes.user._id,
                _id: meRes.user._id,
                username: meRes.user.username,
                email: meRes.user.email,
                avatar: meRes.user.avatar,
              };
              setUser(updated);
              localStorage.setItem('pulsechat_user', JSON.stringify(updated));
            }
          } catch (err) {
            console.warn('Silent token check failed:', err?.message);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        localStorage.removeItem('pulsechat_token');
        localStorage.removeItem('pulsechat_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await authAPI.login({ email, password });
      const userObj = {
        id: data.user.id || data.user._id,
        _id: data.user.id || data.user._id,
        username: data.user.username,
        email: data.user.email,
        avatar: data.user.avatar || '',
      };
      
      localStorage.setItem('pulsechat_token', data.token);
      localStorage.setItem('pulsechat_user', JSON.stringify(userObj));
      
      setToken(data.token);
      setUser(userObj);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    setAuthError(null);
    try {
      const data = await authAPI.register({ username, email, password });
      // After registration, auto log in or return success
      return { success: true, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('pulsechat_token');
    localStorage.removeItem('pulsechat_user');
    setUser(null);
    setToken(null);
    setAuthError(null);
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
