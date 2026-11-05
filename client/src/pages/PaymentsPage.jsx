import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Plus, Search, CreditCard, Check, AlertCircle } from 'lucide-react';
import { getAllPayments, updatePaymentStatus } from '../api/paymentAPI';
import { getAllCustomers } from '../api/customerAPI';
import toast from 'react-hot-toast';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({});

  const paymentStatuses = ['Pending', 'Completed', 'Failed', 'Cancelled'];
  const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];

  useEffect(() => {
    fetchPayments();
  }, [page, selectedCustomer, selectedStatus]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const result = await getAllPayments(page, 20, selectedStatus || undefined, selectedCustomer || undefined);
      if (result.success) {
        setPayments(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch payments');
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

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      const result = await updatePaymentStatus(paymentId, { status: newStatus });
      if (result.success) {
        toast.success('Payment status updated');
        fetchPayments();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMethodIcon = (method) => {
    const icons = {
      'Cash': '💵',
      'UPI': '📱',
      'Bank Transfer': '🏦',
      'Cheque': '📄',
      'Other': '💳',
    };
    return icons[method] || '💳';
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
            <p className="text-gray-600 mt-1">Record and track customer payments</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Record Payment
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Total Amount (This Page)</p>
            <p className="text-2xl font-bold text-gray-800">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Total Payments</p>
            <p className="text-2xl font-bold text-gray-800">{pagination.total || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Completed This Period</p>
            <p className="text-2xl font-bold text-green-600">
              {payments.filter(p => p.status === 'Completed').length}
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
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : payments.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-800">{payment.paymentId}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{payment.order?.orderId || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{payment.customer?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                          ₹{payment.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="text-xl">{getMethodIcon(payment.paymentMethod)}</span>
                          <p className="text-xs text-gray-600">{payment.paymentMethod}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={payment.status}
                            onChange={(e) => handleStatusChange(payment._id, e.target.value)}
                            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${getStatusColor(payment.status)}`}
                          >
                            {paymentStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <button className="text-blue-600 hover:underline">View</button>
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
              <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No payments found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentsPage;
