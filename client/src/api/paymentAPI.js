import api from './axios';

export const getAllPayments = async (page = 1, limit = 20, status, customer, startDate, endDate) => {
  try {
    let url = `/payments?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (customer) url += `&customer=${customer}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch payments' };
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch payment' };
  }
};

export const createPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create payment' };
  }
};

export const updatePaymentStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/payments/${id}`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update payment' };
  }
};

export const getCustomerPayments = async (customerId, page = 1, limit = 20, status) => {
  try {
    let url = `/payments/customer/${customerId}?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customer payments' };
  }
};

export const getPaymentStats = async (startDate, endDate) => {
  try {
    let url = '/payments/stats';
    if (startDate || endDate) {
      url += '?';
      if (startDate) url += `startDate=${startDate}`;
      if (endDate) url += `${startDate ? '&' : ''}endDate=${endDate}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch payment stats' };
  }
};
