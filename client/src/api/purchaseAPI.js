import api from './axios';

// Get all purchases
export const getAllPurchases = async (page = 1, limit = 20, supplier, status) => {
  try {
    let url = `/purchases?page=${page}&limit=${limit}`;
    if (supplier) url += `&supplier=${supplier}`;
    if (status) url += `&status=${status}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch purchases' };
  }
};

// Get purchase by ID
export const getPurchaseById = async (id) => {
  try {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch purchase' };
  }
};

// Create purchase
export const createPurchase = async (purchaseData) => {
  try {
    const response = await api.post('/purchases', purchaseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create purchase' };
  }
};

// Confirm purchase (receive inventory)
export const confirmPurchase = async (id) => {
  try {
    const response = await api.post(`/purchases/${id}/confirm`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to confirm purchase' };
  }
};

// Record payment
export const recordPayment = async (id, amount) => {
  try {
    const response = await api.post(`/purchases/${id}/payment`, { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to record payment' };
  }
};

// Cancel purchase
export const cancelPurchase = async (id) => {
  try {
    const response = await api.post(`/purchases/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to cancel purchase' };
  }
};

// Get supplier purchases
export const getSupplierPurchases = async (supplierId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/purchases/supplier/${supplierId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch supplier purchases' };
  }
};
