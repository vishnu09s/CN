const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Purchase = require('../models/Purchase');

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    const filter = { status: 'Completed' };
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }

    let groupBy = { $dayOfMonth: '$orderDate' };
    if (period === 'monthly') {
      groupBy = {
        month: { $month: '$orderDate' },
        year: { $year: '$orderDate' },
      };
    } else if (period === 'yearly') {
      groupBy = { $year: '$orderDate' };
    }

    const salesData = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalSales = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        summary: {
          totalSales: totalSales[0]?.total || 0,
          totalOrders: totalSales[0]?.count || 0,
          averageOrderValue: totalSales[0]?.total / totalSales[0]?.count || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .select('productId productName quantity reservedQuantity minimumThreshold isLowStock purchasePrice sellingPrice');

    const lowStockProducts = products.filter((p) => p.quantity <= p.minimumThreshold);
    const outOfStockProducts = products.filter((p) => p.quantity === 0);

    const inventoryValue = products.reduce(
      (sum, p) => sum + p.purchasePrice * p.quantity,
      0
    );

    const potentialRevenue = products.reduce(
      (sum, p) => sum + p.sellingPrice * p.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        products,
        summary: {
          totalProducts: products.length,
          totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
          totalReserved: products.reduce((sum, p) => sum + p.reservedQuantity, 0),
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          inventoryValue: inventoryValue,
          potentialRevenue: potentialRevenue,
        },
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const customers = await Customer.find({ isActive: true });

    const orderFilter = { status: 'Completed' };
    if (startDate || endDate) {
      orderFilter.orderDate = {};
      if (startDate) orderFilter.orderDate.$gte = new Date(startDate);
      if (endDate) orderFilter.orderDate.$lte = new Date(endDate);
    }

    const customerData = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({
          customer: customer._id,
          ...orderFilter,
        });

        const payments = await Payment.find({
          customer: customer._id,
          status: 'Completed',
        });

        const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        return {
          _id: customer._id,
          customerId: customer.customerId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          orderCount: orders.length,
          totalSpent,
          totalPaid,
          outstanding: customer.outstanding,
          creditLimit: customer.creditLimit,
          averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
        };
      })
    );

    const topCustomers = customerData
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const totalRevenue = customerData.reduce((sum, c) => sum + c.totalSpent, 0);

    res.json({
      success: true,
      data: {
        customers: customerData,
        topCustomers,
        summary: {
          totalCustomers: customers.length,
          totalRevenue,
          averageSpent: totalRevenue / customers.length || 0,
          totalOutstanding: customers.reduce((sum, c) => sum + c.outstanding, 0),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name customerId')
      .populate('items.product', 'productName');

    const statusBreakdown = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      success: true,
      data: {
        orders,
        statusBreakdown,
        summary: {
          totalOrders,
          totalAmount,
          averageOrderValue: totalAmount / totalOrders || 0,
          pendingCount: orders.filter((o) => o.status === 'Pending').length,
          completedCount: orders.filter((o) => o.status === 'Completed').length,
          cancelledCount: orders.filter((o) => o.status === 'Cancelled').length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('customer', 'name customerId')
      .populate('order', 'orderId');

    const methodBreakdown = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const statusBreakdown = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: {
        payments,
        methodBreakdown,
        statusBreakdown,
        summary: {
          totalPayments: payments.length,
          totalAmount,
          averagePayment: totalAmount / payments.length || 0,
          completedAmount: payments
            .filter((p) => p.status === 'Completed')
            .reduce((sum, p) => sum + p.amount, 0),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const orderFilter = { status: 'Completed' };
    const purchaseFilter = { status: 'Received' };

    if (startDate || endDate) {
      orderFilter.orderDate = {};
      purchaseFilter.purchaseDate = {};
      if (startDate) {
        orderFilter.orderDate.$gte = new Date(startDate);
        purchaseFilter.purchaseDate.$gte = new Date(startDate);
      }
      if (endDate) {
        orderFilter.orderDate.$lte = new Date(endDate);
        purchaseFilter.purchaseDate.$lte = new Date(endDate);
      }
    }

    const orders = await Order.find(orderFilter).populate('items.product', 'purchasePrice');
    const purchases = await Purchase.find(purchaseFilter);

    let revenue = 0;
    let costOfGoodsSold = 0;

    orders.forEach((order) => {
      revenue += order.totalAmount;
      order.items.forEach((item) => {
        if (item.product) {
          costOfGoodsSold += item.product.purchasePrice * item.quantity;
        }
      });
    });

    const purchaseCost = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

    const grossProfit = revenue - costOfGoodsSold;
    const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        summary: {
          revenue,
          costOfGoodsSold,
          purchaseCost,
          grossProfit,
          grossProfitMargin: grossProfitMargin.toFixed(2),
          orderCount: orders.length,
          purchaseCount: purchases.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayOrders = await Order.find({
      orderDate: { $gte: today },
      status: 'Completed',
    });

    const thisMonthOrders = await Order.find({
      orderDate: { $gte: thisMonthStart },
      status: 'Completed',
    });

    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const thisMonthSales = thisMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const outstandingPayments = await Payment.countDocuments({ status: 'Pending' });

    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$minimumThreshold'] },
    });

    res.json({
      success: true,
      data: {
        todaySales,
        thisMonthSales,
        todayOrders: todayOrders.length,
        thisMonthOrders: thisMonthOrders.length,
        pendingOrders,
        outstandingPayments,
        lowStockProducts,
        activeCustomers: await Customer.countDocuments({ isActive: true }),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
