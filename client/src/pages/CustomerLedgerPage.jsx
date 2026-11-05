import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { getAllCustomerLedgers } from '../api/customerLedgerAPI';
import toast from 'react-hot-toast';

const CustomerLedgerPage = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLedgers();
  }, [page, filter]);

  const fetchLedgers = async () => {
    try {
      setLoading(true);
      const status = filter === 'outstanding' ? 'outstanding' : undefined;
      const result = await getAllCustomerLedgers(page, 20, status);
      if (result.success) {
        setLedgers(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch customer ledgers');
    } finally {
      setLoading(false);
    }
  };

  const totalOutstanding = ledgers.reduce((sum, ledger) => sum + ledger.outstanding, 0);
  const totalCreditLimit = ledgers.reduce((sum, ledger) => sum + ledger.creditLimit, 0);

  const getCreditStatus = (utilization) => {
    const util = parseFloat(utilization);
    if (util >= 90) return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' };
    if (util >= 75) return { label: 'Warning', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (util >= 50) return { label: 'Moderate', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Good', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Ledger</h1>
          <p className="text-gray-600 mt-1">View customer outstanding balances and credit status</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-600">₹{totalOutstanding.toLocaleString('en-IN')}</p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Total Credit Limit</p>
            <p className="text-2xl font-bold text-blue-600">₹{totalCreditLimit.toLocaleString('en-IN')}</p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Customers with Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">{ledgers.filter(l => l.outstanding > 0).length}</p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Average Credit Utilization</p>
            <p className="text-2xl font-bold text-purple-600">
              {(ledgers.reduce((sum, l) => sum + parseFloat(l.creditUtilization), 0) / ledgers.length || 0).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setFilter('all');
                setPage(1);
              }}
              className={`px-4 py-2 rounded font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Customers
            </button>
            <button
              onClick={() => {
                setFilter('outstanding');
                setPage(1);
              }}
              className={`px-4 py-2 rounded font-medium ${
                filter === 'outstanding'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Outstanding Only
            </button>
          </div>
        </div>

        {/* Ledgers Table */}
        <div className="card p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : ledgers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Outstanding</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Credit Limit</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilization</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Transaction</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgers.map((ledger) => {
                      const status = getCreditStatus(ledger.creditUtilization);
                      return (
                        <tr key={ledger._id} className={`border-b border-gray-100 hover:bg-gray-50 ${status.bg}`}>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-800">{ledger.name}</p>
                              <p className="text-xs text-gray-600">{ledger.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-gray-600">{ledger.customerId}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-red-600">
                            ₹{ledger.outstanding.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            ₹{ledger.creditLimit.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    parseFloat(ledger.creditUtilization) >= 90
                                      ? 'bg-red-600'
                                      : parseFloat(ledger.creditUtilization) >= 75
                                      ? 'bg-yellow-600'
                                      : parseFloat(ledger.creditUtilization) >= 50
                                      ? 'bg-orange-600'
                                      : 'bg-green-600'
                                  }`}
                                  style={{ width: `${Math.min(parseFloat(ledger.creditUtilization), 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{ledger.creditUtilization}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {ledger.lastTransaction
                              ? new Date(ledger.lastTransaction).toLocaleDateString('en-IN')
                              : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <button className="text-blue-600 hover:underline">View Ledger</button>
                          </td>
                        </tr>
                      );
                    })}
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
              <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No customer ledgers found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomerLedgerPage;
