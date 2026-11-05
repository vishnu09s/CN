import api from './axios';

// Get all suppliers
export const getAllSuppliers = async (page = 1, limit = 20, search, isActive) => {
  try {
    let url = `/suppliers?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch suppliers' };
  }
};

// Get supplier by ID
export const getSupplierById = async (id) => {
  try {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch supplier' };
  }
};

// Create supplier
export const createSupplier = async (supplierData) => {
  try {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create supplier' };
  }
};

// Update supplier
export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update supplier' };
  }
};

// Delete supplier (deactivate)
export const deleteSupplier = async (id) => {
  try {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete supplier' };
  }
};
