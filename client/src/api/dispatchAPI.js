import api from './axios';

// Get all dispatches
export const getAllDispatches = async (page = 1, limit = 20, status, customer) => {
  try {
    let url = `/dispatch?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (customer) url += `&customer=${customer}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch dispatches' };
  }
};

// Get dispatch by ID
export const getDispatchById = async (id) => {
  try {
    const response = await api.get(`/dispatch/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch dispatch' };
  }
};

// Get dispatch by tracking number
export const getDispatchByTrackingNumber = async (trackingNumber) => {
  try {
    const response = await api.get(`/dispatch/tracking/${trackingNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Tracking number not found' };
  }
};

// Create dispatch
export const createDispatch = async (dispatchData) => {
  try {
    const response = await api.post('/dispatch', dispatchData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create dispatch' };
  }
};

// Update dispatch status
export const updateDispatchStatus = async (id, newStatus, location, notes) => {
  try {
    const response = await api.put(`/dispatch/${id}/status`, { newStatus, location, notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update dispatch status' };
  }
};

// Confirm delivery
export const confirmDelivery = async (id, deliveryData) => {
  try {
    const response = await api.post(`/dispatch/${id}/confirm-delivery`, deliveryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to confirm delivery' };
  }
};

// Mark failed delivery
export const markFailedDelivery = async (id, failureReason) => {
  try {
    const response = await api.post(`/dispatch/${id}/failed-delivery`, { failureReason });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to mark delivery as failed' };
  }
};

// Get customer dispatches
export const getCustomerDispatches = async (customerId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/dispatch/customer/${customerId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customer dispatches' };
  }
};
