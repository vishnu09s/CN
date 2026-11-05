import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Plus, FileText, Download, Send, Check, AlertCircle } from 'lucide-react';
import { getAllInvoices, sendInvoice, markInvoiceAsPaid, cancelInvoice } from '../api/invoiceAPI';
import { getAllCustomers } from '../api/customerAPI';
import toast from 'react-hot-toast';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({});

  const invoiceStatuses = ['Draft', 'Sent', 'Viewed', 'Paid', 'Overdue', 'Cancelled'];

  useEffect(() => {
    fetchInvoices();
  }, [page, selectedCustomer, selectedStatus]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const result = await getAllInvoices(page, 20, selectedStatus || undefined, selectedCustomer || undefined);
      if (result.success) {
        setInvoices(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const result = await getAllCustomers(1, 100, '', true);
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      const result = await sendInvoice(invoiceId);
      if (result.success) {
        toast.success('Invoice sent successfully');
        fetchInvoices();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send invoice');
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      const result = await markInvoiceAsPaid(invoiceId);
      if (result.success) {
        toast.success('Invoice marked as paid');
        fetchInvoices();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to mark as paid');
    }
  };

  const handleCancel = async (invoiceId) => {
    if (window.confirm('Are you sure you want to cancel this invoice?')) {
      try {
        const result = await cancelInvoice(invoiceId);
        if (result.success) {
          toast.success('Invoice cancelled');
          fetchInvoices();
        }
      } catch (error) {
        toast.error(error.message || 'Failed to cancel invoice');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Viewed': 'bg-purple-100 text-purple-800',
      'Paid': 'bg-green-100 text-green-800',
      'Overdue': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoice Management</h1>
            <p className="text-gray-600 mt-1">Create and manage customer invoices</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Create Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Total Invoiced</p>
            <p className="text-2xl font-bold text-gray-800">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-800">{pagination.total || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Paid</p>
            <p className="text-2xl font-bold text-green-600">
              {invoices.filter(inv => inv.status === 'Paid').length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Drafts</p>
            <p className="text-2xl font-bold text-blue-600">
              {invoices.filter(inv => inv.status === 'Draft').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">All Status</option>
              {invoiceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="card p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : invoices.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Invoice ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-800">{invoice.invoiceId}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.order?.orderId || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.customer?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                          ₹{invoice.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm flex gap-2">
                          <button className="text-blue-600 hover:underline flex items-center gap-1">
                            <FileText size={16} />
                            View
                          </button>
                          {invoice.status === 'Draft' && (
                            <button
                              onClick={() => handleSendInvoice(invoice._id)}
                              className="text-green-600 hover:underline flex items-center gap-1"
                            >
                              <Send size={16} />
                              Send
                            </button>
                          )}
                          {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleMarkAsPaid(invoice._id)}
                              className="text-green-600 hover:underline flex items-center gap-1"
                            >
                              <Check size={16} />
                              Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pages}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No invoices found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default InvoicesPage;
