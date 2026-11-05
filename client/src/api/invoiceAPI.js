import api from './axios';

export const getAllInvoices = async (page = 1, limit = 20, status, customer, startDate, endDate) => {
  try {
    let url = `/invoices?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (customer) url += `&customer=${customer}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch invoices' };
  }
};

export const getInvoiceById = async (id) => {
  try {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch invoice' };
  }
};

export const getInvoiceByNumber = async (invoiceId) => {
  try {
    const response = await api.get(`/invoices/number/${invoiceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Invoice not found' };
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create invoice' };
  }
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update invoice' };
  }
};

export const sendInvoice = async (id) => {
  try {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to send invoice' };
  }
};

export const markInvoiceAsPaid = async (id) => {
  try {
    const response = await api.post(`/invoices/${id}/mark-paid`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to mark invoice as paid' };
  }
};

export const cancelInvoice = async (id) => {
  try {
    const response = await api.post(`/invoices/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to cancel invoice' };
  }
};

export const getCustomerInvoices = async (customerId, page = 1, limit = 20, status) => {
  try {
    let url = `/invoices/customer/${customerId}?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customer invoices' };
  }
};

export const getInvoiceStats = async (startDate, endDate) => {
  try {
    let url = '/invoices/stats';
    if (startDate || endDate) {
      url += '?';
      if (startDate) url += `startDate=${startDate}`;
      if (endDate) url += `${startDate ? '&' : ''}endDate=${endDate}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch invoice stats' };
  }
};
