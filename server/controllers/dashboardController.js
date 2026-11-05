const calculationHelpers = require('../utils/calculationHelpers');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Get overview statistics
exports.getOverview = async (req, res) => {
  try {
    const [
      totalSales,
      totalPurchases,
      totalRevenue,
      outstandingPayments,
      amountCollected,
      totalProducts,
      inventoryValue,
      totalCustomers,
    ] = await Promise.all([
      calculationHelpers.calculateTotalSales(),
      calculationHelpers.calculateTotalPurchases(),
      calculationHelpers.calculateRevenue(),
      calculationHelpers.calculateOutstandingPayments(),
      calculationHelpers.calculateAmountCollected(),
      calculationHelpers.calculateTotalProducts(),
      calculationHelpers.calculateInventoryValue(),
      calculationHelpers.calculateTotalCustomers(),
    ]);

    res.json({
      success: true,
      data: {
        totalSales,
        totalPurchases,
        totalRevenue,
        outstandingPayments,
        amountCollected,
        totalProducts,
        inventoryValue,
        totalCustomers,
      },
    });
  } catch (error) {
    console.error('Error getting overview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching overview',
    });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const orderStats = await calculationHelpers.getOrderStatusCounts();

    res.json({
      success: true,
      data: orderStats,
    });
  } catch (error) {
    console.error('Error getting order stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order statistics',
    });
  }
};

// Get recent orders
exports.getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find()
      .populate('customer', 'name phone customerId')
      .sort({ orderDate: -1 })
      .limit(limit)
      .select('orderId customer totalAmount orderStatus paymentStatus orderDate');

    const formattedOrders = orders.map((order) => ({
      orderId: order.orderId,
      customerName: order.customer?.name || 'N/A',
      customerPhone: order.customer?.phone || 'N/A',
      amount: order.totalAmount,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      orderDate: order.orderDate,
    }));

    res.json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error('Error getting recent orders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recent orders',
    });
  }
};

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const payments = await Payment.find()
      .populate('customer', 'name')
      .populate('order', 'orderId')
      .sort({ paymentDate: -1 })
      .limit(limit)
      .select('paymentId customer order amount paymentMethod paymentDate');

    const formattedTransactions = payments.map((payment) => ({
      paymentId: payment.paymentId,
      customerName: payment.customer?.name || 'N/A',
      orderId: payment.order?.orderId || 'N/A',
      amount: payment.amount,
      method: payment.paymentMethod,
      date: payment.paymentDate,
    }));

    res.json({
      success: true,
      data: formattedTransactions,
    });
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recent transactions',
    });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await calculationHelpers.getLowStockProducts();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error getting low stock products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching low stock products',
    });
  }
};

// Get outstanding customers
exports.getOutstandingCustomers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const customers = await calculationHelpers.getOutstandingCustomers(limit);

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error('Error getting outstanding customers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching outstanding customers',
    });
  }
};

// Get monthly sales data
exports.getMonthlySales = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await calculationHelpers.getMonthlyData(year);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error getting monthly sales:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching monthly sales',
    });
  }
};

// Get monthly purchase data
exports.getMonthlyPurchases = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await calculationHelpers.getMonthlyPurchaseData(year);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error getting monthly purchases:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching monthly purchases',
    });
  }
};

// Get top selling products
exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await calculationHelpers.getTopProducts(limit);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching top products',
    });
  }
};

// Get all dashboard data
exports.getAllDashboardData = async (req, res) => {
  try {
    const [overview, orderStats, recentOrders, recentTransactions, lowStockProducts, outstandingCustomers, monthlySales, monthlyPurchases, topProducts] = await Promise.all([
      (async () => {
        const stats = await calculationHelpers.calculateTotalSales();
        const purchases = await calculationHelpers.calculateTotalPurchases();
        const revenue = await calculationHelpers.calculateRevenue();
        const outstanding = await calculationHelpers.calculateOutstandingPayments();
        const collected = await calculationHelpers.calculateAmountCollected();
        const products = await calculationHelpers.calculateTotalProducts();
        const inventory = await calculationHelpers.calculateInventoryValue();
        const customers = await calculationHelpers.calculateTotalCustomers();
        return { totalSales: stats, totalPurchases: purchases, totalRevenue: revenue, outstandingPayments: outstanding, amountCollected: collected, totalProducts: products, inventoryValue: inventory, totalCustomers: customers };
      })(),
      calculationHelpers.getOrderStatusCounts(),
      (async () => {
        const orders = await Order.find().populate('customer', 'name phone customerId').sort({ orderDate: -1 }).limit(5).select('orderId customer totalAmount orderStatus paymentStatus orderDate');
        return orders.map((order) => ({ orderId: order.orderId, customerName: order.customer?.name || 'N/A', customerPhone: order.customer?.phone || 'N/A', amount: order.totalAmount, status: order.orderStatus, paymentStatus: order.paymentStatus, orderDate: order.orderDate }));
      })(),
      (async () => {
        const payments = await Payment.find().populate('customer', 'name').populate('order', 'orderId').sort({ paymentDate: -1 }).limit(5).select('paymentId customer order amount paymentMethod paymentDate');
        return payments.map((payment) => ({ paymentId: payment.paymentId, customerName: payment.customer?.name || 'N/A', orderId: payment.order?.orderId || 'N/A', amount: payment.amount, method: payment.paymentMethod, date: payment.paymentDate }));
      })(),
      calculationHelpers.getLowStockProducts(),
      calculationHelpers.getOutstandingCustomers(10),
      calculationHelpers.getMonthlyData(),
      calculationHelpers.getMonthlyPurchaseData(),
      calculationHelpers.getTopProducts(10),
    ]);

    res.json({
      success: true,
      data: {
        overview,
        orderStats,
        recentOrders,
        recentTransactions,
        lowStockProducts,
        outstandingCustomers,
        monthlySales,
        monthlyPurchases,
        topProducts,
      },
    });
  } catch (error) {
    console.error('Error getting all dashboard data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard data',
    });
  }
};
