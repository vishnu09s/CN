import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { getAllPurchases, getAllSuppliers } from '../api/purchaseAPI';
import { getAllSuppliers as getSupplierAPI } from '../api/supplierAPI';
import toast from 'react-hot-toast';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchPurchases();
  }, [page, selectedSupplier, selectedStatus]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const result = await getAllPurchases(page, 20, selectedSupplier || undefined, selectedStatus || undefined);
      if (result.success) {
        setPurchases(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const result = await getSupplierAPI(1, 100, '', true);
      if (result.success) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Received': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Unpaid': 'bg-red-100 text-red-800',
      'Partially Paid': 'bg-yellow-100 text-yellow-800',
      'Fully Paid': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Purchase Management</h1>
            <p className="text-gray-600 mt-1">Record and manage supplier purchases</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Purchase
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
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
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="card p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : purchases.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Purchase ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Supplier</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-800">{purchase.purchaseId}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{purchase.supplier?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          ₹{purchase.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(purchase.paymentStatus)}`}>
                            {purchase.paymentStatus}
                          </span>
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
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No purchases found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PurchasesPage;
