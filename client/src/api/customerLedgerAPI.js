import api from './axios';

export const getAllCustomerLedgers = async (page = 1, limit = 20, status) => {
  try {
    let url = `/ledger?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customer ledgers' };
  }
};

export const getCustomerLedger = async (customerId, page = 1, limit = 50, startDate, endDate) => {
  try {
    let url = `/ledger/customer/${customerId}?page=${page}&limit=${limit}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch customer ledger' };
  }
};

export const getLedgerSummary = async (customerId) => {
  try {
    const response = await api.get(`/ledger/customer/${customerId}/summary`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch ledger summary' };
  }
};

export const addLedgerEntry = async (customerId, entryData) => {
  try {
    const response = await api.post(`/ledger/customer/${customerId}`, entryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to add ledger entry' };
  }
};
