import api from './axios';

// Register admin (first time only)
export const registerAdmin = async (username, email, password, confirmPassword) => {
  try {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Registration failed' };
  }
};

// Login admin
export const loginAdmin = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

// Change password
export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  try {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Password change failed' };
  }
};

// Verify token
export const verifyToken = async () => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Token verification failed' };
  }
};

// Get current admin
export const getCurrentAdmin = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch admin data' };
  }
};
