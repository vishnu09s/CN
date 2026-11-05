import api from './axios';

// Get all dashboard data
export const getAllDashboardData = async () => {
  try {
    const response = await api.get('/dashboard/all');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch dashboard data' };
  }
};

// Get overview statistics
export const getOverview = async () => {
  try {
    const response = await api.get('/dashboard/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch overview' };
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    const response = await api.get('/dashboard/orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch order stats' };
  }
};

// Get recent orders
export const getRecentOrders = async (limit = 10) => {
  try {
    const response = await api.get(`/dashboard/recent-orders?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch recent orders' };
  }
};

// Get recent transactions
export const getRecentTransactions = async (limit = 10) => {
  try {
    const response = await api.get(`/dashboard/recent-transactions?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch recent transactions' };
  }
};

// Get low stock products
export const getLowStockProducts = async () => {
  try {
    const response = await api.get('/dashboard/low-stock');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch low stock products' };
  }
};

// Get outstanding customers
export const getOutstandingCustomers = async (limit = 10) => {
  try {
    const response = await api.get(`/dashboard/outstanding-customers?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch outstanding customers' };
  }
};

// Get monthly sales data
export const getMonthlySales = async (year) => {
  try {
    const response = await api.get(`/dashboard/monthly-sales${year ? `?year=${year}` : ''}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch monthly sales' };
  }
};

// Get monthly purchase data
export const getMonthlyPurchases = async (year) => {
  try {
    const response = await api.get(`/dashboard/monthly-purchases${year ? `?year=${year}` : ''}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch monthly purchases' };
  }
};

// Get top products
export const getTopProducts = async (limit = 10) => {
  try {
    const response = await api.get(`/dashboard/top-products?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch top products' };
  }
};
