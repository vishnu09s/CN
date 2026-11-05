import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      const adminData = localStorage.getItem('adminData');
      if (adminData) {
        setAdmin(JSON.parse(adminData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, admin: adminData } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));

      setAdmin(adminData);
      setIsAuthenticated(true);

      return { success: true, message: 'Login successful' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        confirmPassword
      });
      const { token, admin: adminData } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));

      setAdmin(adminData);
      setIsAuthenticated(true);

      return { success: true, message: 'Registration successful' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
