import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Inventory Management System</h1>
            <p className="text-gray-600 text-sm">Welcome, {admin?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Dashboard Cards */}
          <div className="card p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Sales</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">₹0</p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>

          <div className="card p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>

          <div className="card p-6">
            <h3 className="text-gray-600 text-sm font-medium">Outstanding Payments</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">₹0</p>
            <p className="text-xs text-gray-500 mt-2">Pending collection</p>
          </div>

          <div className="card p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Products</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-2">In inventory</p>
          </div>
        </div>

        {/* Placeholder for additional content */}
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Modules Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            The following modules are being developed:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">Inventory Management</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">Order Management</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">Payment Tracking</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">Customer Ledger</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">Invoice Generation</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">Reports & Analytics</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
