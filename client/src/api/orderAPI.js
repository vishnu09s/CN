import api from './axios';

// Get all orders
export const getAllOrders = async (page = 1, limit = 20, customer, orderStatus, paymentStatus) => {
  try {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (customer) url += `&customer=${customer}`;
    if (orderStatus) url += `&orderStatus=${orderStatus}`;
    if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch orders' };
  }
};

// Get order by ID
export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch order' };
  }
};

// Create order
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create order' };
  }
};

// Accept order (reserve inventory)
export const acceptOrder = async (id) => {
  try {
    const response = await api.post(`/orders/${id}/accept`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to accept order' };
  }
};

// Update order status
export const updateOrderStatus = async (id, newStatus) => {
  try {
    const response = await api.put(`/orders/${id}/status`, { newStatus });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update order status' };
  }
};

// Record payment
export const recordPayment = async (id, amount) => {
  try {
    const response = await api.post(`/orders/${id}/payment`, { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to record payment' };
  }
};

// Get customer orders
export const getCustomerOrders = async (customerId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/orders/customer/${customerId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customer orders' };
  }
};
