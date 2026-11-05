import api from './axios';

// Get all customers
export const getAllCustomers = async (page = 1, limit = 20, search, isActive) => {
  try {
    let url = `/customers?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customers' };
  }
};

// Get customer by ID
export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customer' };
  }
};

// Create customer
export const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/customers', customerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create customer' };
  }
};

// Update customer
export const updateCustomer = async (id, customerData) => {
  try {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update customer' };
  }
};

// Delete customer (deactivate)
export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete customer' };
  }
};

// Get customer ledger
export const getCustomerLedger = async (id) => {
  try {
    const response = await api.get(`/customers/${id}/ledger`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customer ledger' };
  }
};
