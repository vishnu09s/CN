import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Plus, Search, Users } from 'lucide-react';
import { getAllCustomers } from '../api/customerAPI';
import toast from 'react-hot-toast';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const result = await getAllCustomers(page, 20, search || undefined, true);
      if (result.success) {
        setCustomers(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
            <p className="text-gray-600 mt-1">Manage customer information and records</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="card p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, phone, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="card p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : customers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Orders</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Outstanding</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-800">{customer.customerId}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{customer.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{customer.phone}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{customer.email || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm font-medium">{customer.totalOrders}</td>
                        <td className="py-3 px-4 text-sm font-medium text-red-600">
                          ₹{customer.outstandingBalance.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <button className="text-blue-600 hover:underline mr-3">View</button>
                          <button className="text-green-600 hover:underline">Edit</button>
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
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomersPage;
