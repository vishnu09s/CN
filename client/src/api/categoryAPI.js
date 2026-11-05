import api from './axios';

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch categories' };
  }
};

// Get category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch category' };
  }
};

// Create category
export const createCategory = async (name, description, icon) => {
  try {
    const response = await api.post('/categories', { name, description, icon });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create category' };
  }
};

// Update category
export const updateCategory = async (id, name, description, icon) => {
  try {
    const response = await api.put(`/categories/${id}`, { name, description, icon });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update category' };
  }
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete category' };
  }
};
