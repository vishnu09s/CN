import api from './axios';

// Get all products
export const getAllProducts = async (page = 1, limit = 20, category, search) => {
  try {
    let url = `/products?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${search}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch products' };
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch product' };
  }
};

// Create product
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create product' };
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update product' };
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete product' };
  }
};

// Get product transactions
export const getProductTransactions = async (id, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/products/${id}/transactions?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch transactions' };
  }
};

// Adjust inventory
export const adjustInventory = async (id, quantity, reason) => {
  try {
    const response = await api.post(`/products/${id}/adjust-inventory`, { quantity, reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to adjust inventory' };
  }
};

// Get low stock products
export const getLowStockProducts = async () => {
  try {
    const response = await api.get('/products/low-stock');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch low stock products' };
  }
};
