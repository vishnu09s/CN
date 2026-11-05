import api from './axios';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/reports/dashboard-stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch dashboard stats' };
  }
};

export const getSalesReport = async (startDate, endDate, period = 'daily') => {
  try {
    let url = '/reports/sales?period=' + period;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch sales report' };
  }
};

export const getInventoryReport = async () => {
  try {
    const response = await api.get('/reports/inventory');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch inventory report' };
  }
};

export const getCustomerReport = async (startDate, endDate) => {
  try {
    let url = '/reports/customers';
    if (startDate || endDate) {
      url += '?';
      if (startDate) url += `startDate=${startDate}`;
      if (endDate) url += `${startDate ? '&' : ''}endDate=${endDate}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customer report' };
  }
};

export const getOrderReport = async (startDate, endDate) => {
  try {
    let url = '/reports/orders';
    if (startDate || endDate) {
      url += '?';
      if (startDate) url += `startDate=${startDate}`;
      if (endDate) url += `${startDate ? '&' : ''}endDate=${endDate}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch order report' };
  }
};

export const getPaymentReport = async (startDate, endDate, status) => {
  try {
    let url = '/reports/payments';
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (status) params.push(`status=${status}`);

    if (params.length > 0) url += '?' + params.join('&');

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch payment report' };
  }
};

export const getProfitLossReport = async (startDate, endDate) => {
  try {
    let url = '/reports/profit-loss';
    if (startDate || endDate) {
      url += '?';
      if (startDate) url += `startDate=${startDate}`;
      if (endDate) url += `${startDate ? '&' : ''}endDate=${endDate}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch profit/loss report' };
  }
};
