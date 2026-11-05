import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Plus, Search, Truck, MapPin } from 'lucide-react';
import { getAllDispatches, getCustomerDispatches } from '../api/dispatchAPI';
import { getAllCustomers } from '../api/customerAPI';
import toast from 'react-hot-toast';

const DispatchPage = () => {
  const [dispatches, setDispatches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({});

  const dispatchStatuses = [
    'Dispatched',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Failed Delivery',
    'Returned',
  ];

  useEffect(() => {
    fetchDispatches();
  }, [page, selectedCustomer, selectedStatus]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchDispatches = async () => {
    try {
      setLoading(true);
      const result = await getAllDispatches(page, 20, selectedStatus || undefined, selectedCustomer || undefined);
      if (result.success) {
        setDispatches(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch dispatches');
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

  const getStatusColor = (status) => {
    const colors = {
      'Dispatched': 'bg-blue-100 text-blue-800',
      'In Transit': 'bg-purple-100 text-purple-800',
      'Out for Delivery': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Failed Delivery': 'bg-red-100 text-red-800',
      'Returned': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dispatch Management</h1>
            <p className="text-gray-600 mt-1">Track and manage order dispatches</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Create Dispatch
          </button>
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
              {dispatchStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dispatches Table */}
        <div className="card p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : dispatches.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Dispatch ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tracking Number</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Dispatch Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Est. Delivery</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.map((dispatch) => (
                      <tr key={dispatch._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-800">{dispatch.dispatchId}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{dispatch.order?.orderId || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{dispatch.customer?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">
                          {dispatch.trackingNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(dispatch.dispatchDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispatch.status)}`}>
                            {dispatch.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {dispatch.estimatedDeliveryDate
                            ? new Date(dispatch.estimatedDeliveryDate).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <button className="text-blue-600 hover:underline">Track</button>
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
              <Truck size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No dispatches found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DispatchPage;
