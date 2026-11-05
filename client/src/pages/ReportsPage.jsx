import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { BarChart, TrendingUp, Package, Users, CreditCard, TrendingDown } from 'lucide-react';
import {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  getOrderReport,
  getPaymentReport,
  getProfitLossReport,
} from '../api/reportAPI';
import toast from 'react-hot-toast';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('daily');

  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [plData, setPlData] = useState(null);

  useEffect(() => {
    if (activeTab === 'sales') fetchSalesReport();
    else if (activeTab === 'inventory') fetchInventoryReport();
    else if (activeTab === 'customers') fetchCustomerReport();
    else if (activeTab === 'orders') fetchOrderReport();
    else if (activeTab === 'payments') fetchPaymentReport();
    else if (activeTab === 'profitloss') fetchProfitLossReport();
  }, [activeTab, startDate, endDate, period]);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const result = await getSalesReport(startDate, endDate, period);
      if (result.success) setSalesData(result.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch sales report');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      setLoading(true);
      const result = await getInventoryReport();
      if (result.success) setInventoryData(result.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch inventory report');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerReport = async () => {
    try {
      setLoading(true);
      const result = await getCustomerReport(startDate, endDate);
      if (result.success) setCustomerData(result.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch customer report');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderReport = async () => {
    try {
      setLoading(true);
      const result = await getOrderReport(startDate, endDate);
      if (result.success) setOrderData(result.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch order report');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentReport = async () => {
    try {
      setLoading(true);
      const result = await getPaymentReport(startDate, endDate);
      if (result.success) setPaymentData(result.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch payment report');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitLossReport = async () => {
    try {
      setLoading(true);
      const result = await getProfitLossReport(startDate, endDate);
      if (result.success) setPlData(result.data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch profit/loss report');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and metrics</p>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
              />
            </div>
            {activeTab === 'sales' && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="input w-full"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="card p-0">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'sales', label: 'Sales', icon: TrendingUp },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'orders', label: 'Orders', icon: BarChart },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'profitloss', label: 'P&L', icon: TrendingDown },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="spinner"></div>
              </div>
            ) : activeTab === 'sales' && salesData ? (
              <SalesReport data={salesData} />
            ) : activeTab === 'inventory' && inventoryData ? (
              <InventoryReport data={inventoryData} />
            ) : activeTab === 'customers' && customerData ? (
              <CustomerReport data={customerData} COLORS={COLORS} />
            ) : activeTab === 'orders' && orderData ? (
              <OrderReport data={orderData} COLORS={COLORS} />
            ) : activeTab === 'payments' && paymentData ? (
              <PaymentReport data={paymentData} COLORS={COLORS} />
            ) : activeTab === 'profitloss' && plData ? (
              <ProfitLossReport data={plData} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const SalesReport = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Sales</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.summary.totalSales.toLocaleString('en-IN')}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Orders</p>
        <p className="text-2xl font-bold text-gray-800">{data.summary.totalOrders}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Average Order Value</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.summary.averageOrderValue.toLocaleString('en-IN')}</p>
      </div>
    </div>

    {data.salesData.length > 0 && (
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
            <Legend />
            <Line type="monotone" dataKey="totalSales" stroke="#3b82f6" name="Sales" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const InventoryReport = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Products</p>
        <p className="text-2xl font-bold text-gray-800">{data.summary.totalProducts}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Quantity</p>
        <p className="text-2xl font-bold text-gray-800">{data.summary.totalQuantity}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Low Stock Items</p>
        <p className="text-2xl font-bold text-orange-600">{data.summary.lowStockCount}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Out of Stock</p>
        <p className="text-2xl font-bold text-red-600">{data.summary.outOfStockCount}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Inventory Value</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.summary.inventoryValue.toLocaleString('en-IN')}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Potential Revenue</p>
        <p className="text-2xl font-bold text-green-600">₹{data.summary.potentialRevenue.toLocaleString('en-IN')}</p>
      </div>
    </div>

    {data.lowStockProducts.length > 0 && (
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Low Stock Products</h3>
        <div className="overflow-x-auto">
          <table className="table text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3">Product</th>
                <th className="text-right py-2 px-3">Current</th>
                <th className="text-right py-2 px-3">Minimum</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockProducts.slice(0, 5).map((product) => (
                <tr key={product._id} className="border-b border-gray-100">
                  <td className="py-2 px-3">{product.productName}</td>
                  <td className="text-right py-2 px-3">{product.quantity}</td>
                  <td className="text-right py-2 px-3">{product.minimumThreshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const CustomerReport = ({ data, COLORS }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Customers</p>
        <p className="text-2xl font-bold text-gray-800">{data.summary.totalCustomers}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Revenue</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.summary.totalRevenue.toLocaleString('en-IN')}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Avg Spent/Customer</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.summary.averageSpent.toLocaleString('en-IN')}</p>
      </div>
    </div>

    <div className="card p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Top Customers</h3>
      <div className="overflow-x-auto">
        <table className="table text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-right py-2 px-3">Orders</th>
              <th className="text-right py-2 px-3">Total Spent</th>
              <th className="text-right py-2 px-3">Avg Order</th>
            </tr>
          </thead>
          <tbody>
            {data.topCustomers.map((customer) => (
              <tr key={customer._id} className="border-b border-gray-100">
                <td className="py-2 px-3">{customer.name}</td>
                <td className="text-right py-2 px-3">{customer.orderCount}</td>
                <td className="text-right py-2 px-3">₹{customer.totalSpent.toLocaleString('en-IN')}</td>
                <td className="text-right py-2 px-3">₹{customer.averageOrderValue.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const OrderReport = ({ data, COLORS }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Orders</p>
        <p className="text-2xl font-bold text-gray-800">{data.summary.totalOrders}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Amount</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.summary.totalAmount.toLocaleString('en-IN')}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Average Order Value</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.summary.averageOrderValue.toLocaleString('en-IN')}</p>
      </div>
    </div>

    {data.statusBreakdown.length > 0 && (
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Orders by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.statusBreakdown.map((item) => ({
                name: item._id,
                value: item.count,
              }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.statusBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const PaymentReport = ({ data, COLORS }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Payments</p>
        <p className="text-2xl font-bold text-gray-800">{data.summary.totalPayments}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Total Amount</p>
        <p className="text-2xl font-bold text-gray-800">₹{data.summary.totalAmount.toLocaleString('en-IN')}</p>
      </div>
      <div className="card p-4">
        <p className="text-gray-600 text-sm">Completed</p>
        <p className="text-2xl font-bold text-green-600">₹{data.summary.completedAmount.toLocaleString('en-IN')}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.methodBreakdown.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-800 mb-4">By Payment Method</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.methodBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalAmount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.statusBreakdown.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-800 mb-4">By Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.statusBreakdown.map((item) => ({
                  name: item._id,
                  value: item.count,
                }))}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  </div>
);

const ProfitLossReport = ({ data }) => {
  const { revenue, costOfGoodsSold, purchaseCost, grossProfit, grossProfitMargin } = data.summary;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">₹{revenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Cost of Goods Sold</p>
          <p className="text-2xl font-bold text-red-600">-₹{costOfGoodsSold.toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Gross Profit</p>
          <p className="text-2xl font-bold text-blue-600">₹{grossProfit.toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Gross Profit Margin</p>
          <p className="text-2xl font-bold text-purple-600">{grossProfitMargin}%</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Profit & Loss Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Revenue</span>
            <span className="font-semibold text-gray-800">₹{revenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Cost of Goods Sold</span>
            <span className="font-semibold text-red-600">-₹{costOfGoodsSold.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2 bg-gray-50 px-3">
            <span className="font-semibold text-gray-800">Gross Profit</span>
            <span className="font-bold text-lg text-green-600">₹{grossProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
