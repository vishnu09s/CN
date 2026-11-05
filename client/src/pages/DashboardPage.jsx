import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/Dashboard/StatCard';
import ChartCard from '../components/Dashboard/ChartCard';
import RecentOrdersCard from '../components/Dashboard/RecentOrdersCard';
import LowStockCard from '../components/Dashboard/LowStockCard';
import OutstandingCustomersCard from '../components/Dashboard/OutstandingCustomersCard';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { getAllDashboardData } from '../api/dashboardAPI';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    orderStats: {},
    recentOrders: [],
    lowStockProducts: [],
    outstandingCustomers: [],
    monthlySales: [],
    monthlyPurchases: [],
    topProducts: [],
  });

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await getAllDashboardData();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const { overview, orderStats, recentOrders, lowStockProducts, outstandingCustomers, monthlySales, monthlyPurchases, topProducts } = dashboardData;

  if (loading && Object.keys(overview).length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to your business management system</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn btn-secondary disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Sales"
            value={`₹${(overview.totalSales || 0).toLocaleString('en-IN')}`}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Total Purchases"
            value={`₹${(overview.totalPurchases || 0).toLocaleString('en-IN')}`}
            icon={ShoppingCart}
            color="green"
          />
          <StatCard
            title="Revenue"
            value={`₹${(overview.totalRevenue || 0).toLocaleString('en-IN')}`}
            icon={DollarSign}
            color="purple"
          />
          <StatCard
            title="Outstanding"
            value={`₹${(overview.outstandingPayments || 0).toLocaleString('en-IN')}`}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Amount Collected"
            value={`₹${(overview.amountCollected || 0).toLocaleString('en-IN')}`}
            color="green"
          />
          <StatCard
            title="Total Products"
            value={overview.totalProducts || 0}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Inventory Value"
            value={`₹${(overview.inventoryValue || 0).toLocaleString('en-IN')}`}
            color="orange"
          />
          <StatCard
            title="Total Customers"
            value={overview.totalCustomers || 0}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Orders"
            value={orderStats.totalOrders || 0}
            color="blue"
          />
          <StatCard
            title="Pending Orders"
            value={orderStats.orderReceived || 0}
            color="yellow"
          />
          <StatCard
            title="Delivered Orders"
            value={orderStats.delivered || 0}
            color="green"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Monthly Sales Trend"
            data={monthlySales}
            type="line"
            dataKey="sales"
            height={300}
          />
          <ChartCard
            title="Monthly Purchase Trend"
            data={monthlyPurchases}
            type="bar"
            dataKey="purchases"
            height={300}
          />
        </div>

        {/* Recent Orders and Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOrdersCard orders={recentOrders} />
          </div>
          <div>
            <LowStockCard products={lowStockProducts} />
          </div>
        </div>

        {/* Outstanding Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OutstandingCustomersCard customers={outstandingCustomers} />

          {/* Top Products */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-2">
                {topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-600">Sold: {product.totalSold} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ₹{product.revenue.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sales data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
