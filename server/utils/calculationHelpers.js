const Order = require('../models/Order');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const InventoryTransaction = require('../models/InventoryTransaction');

// Calculate total sales (fully paid orders)
exports.calculateTotalSales = async () => {
  try {
    const result = await Order.aggregate([
      { $match: { paymentStatus: 'Fully Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error calculating total sales:', error);
    return 0;
  }
};

// Calculate total purchases
exports.calculateTotalPurchases = async () => {
  try {
    const result = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error calculating total purchases:', error);
    return 0;
  }
};

// Calculate cost of goods sold
exports.calculateCOGS = async () => {
  try {
    const result = await InventoryTransaction.aggregate([
      { $match: { transactionType: 'Order Dispatch' } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ['$quantity', '$productData.purchasePrice'],
            },
          },
        },
      },
    ]);
    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error calculating COGS:', error);
    return 0;
  }
};

// Calculate revenue (sales - COGS)
exports.calculateRevenue = async () => {
  try {
    const totalSales = await exports.calculateTotalSales();
    const cogs = await exports.calculateCOGS();
    return Math.max(0, totalSales - cogs);
  } catch (error) {
    console.error('Error calculating revenue:', error);
    return 0;
  }
};

// Calculate outstanding payments
exports.calculateOutstandingPayments = async () => {
  try {
    const result = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$pendingAmount' } } },
    ]);
    return result.length > 0 ? Math.max(0, result[0].total) : 0;
  } catch (error) {
    console.error('Error calculating outstanding payments:', error);
    return 0;
  }
};

// Calculate amount collected
exports.calculateAmountCollected = async () => {
  try {
    const result = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPaid' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error calculating amount collected:', error);
    return 0;
  }
};

// Calculate total products
exports.calculateTotalProducts = async () => {
  try {
    return await Product.countDocuments();
  } catch (error) {
    console.error('Error calculating total products:', error);
    return 0;
  }
};

// Calculate inventory value
exports.calculateInventoryValue = async () => {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ['$quantity', '$sellingPrice'],
            },
          },
        },
      },
    ]);
    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error calculating inventory value:', error);
    return 0;
  }
};

// Calculate total customers
exports.calculateTotalCustomers = async () => {
  try {
    return await Customer.countDocuments({ isActive: true });
  } catch (error) {
    console.error('Error calculating total customers:', error);
    return 0;
  }
};

// Get order status counts
exports.getOrderStatusCounts = async () => {
  try {
    const statuses = [
      'Order Received',
      'Accepted',
      'Processing',
      'Ready for Dispatch',
      'Dispatched',
      'Delivered',
      'Cancelled',
    ];

    const counts = {};
    let totalOrders = 0;

    for (const status of statuses) {
      const count = await Order.countDocuments({ orderStatus: status });
      counts[status] = count;
      if (status !== 'Cancelled') {
        totalOrders += count;
      }
    }

    return {
      totalOrders,
      orderReceived: counts['Order Received'],
      accepted: counts['Accepted'],
      processing: counts['Processing'],
      readyForDispatch: counts['Ready for Dispatch'],
      dispatched: counts['Dispatched'],
      delivered: counts['Delivered'],
      cancelled: counts['Cancelled'],
    };
  } catch (error) {
    console.error('Error getting order status counts:', error);
    return {
      totalOrders: 0,
      orderReceived: 0,
      accepted: 0,
      processing: 0,
      readyForDispatch: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0,
    };
  }
};

// Get monthly sales data
exports.getMonthlyData = async (year = new Date().getFullYear()) => {
  try {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const result = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Fully Paid',
          orderDate: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$orderDate' },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = months.map((month, index) => {
      const monthData = result.find((r) => r._id === index + 1);
      return {
        month: month.slice(0, 3),
        sales: monthData ? monthData.total : 0,
      };
    });

    return data;
  } catch (error) {
    console.error('Error getting monthly sales data:', error);
    return [];
  }
};

// Get monthly purchase data
exports.getMonthlyPurchaseData = async (year = new Date().getFullYear()) => {
  try {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const result = await Purchase.aggregate([
      {
        $match: {
          purchaseDate: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$purchaseDate' },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = months.map((month, index) => {
      const monthData = result.find((r) => r._id === index + 1);
      return {
        month: month.slice(0, 3),
        purchases: monthData ? monthData.total : 0,
      };
    });

    return data;
  } catch (error) {
    console.error('Error getting monthly purchase data:', error);
    return [];
  }
};

// Get top selling products
exports.getTopProducts = async (limit = 10) => {
  try {
    const result = await InventoryTransaction.aggregate([
      { $match: { transactionType: 'Order Dispatch' } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $group: {
          _id: '$product',
          productName: { $first: '$productData.name' },
          totalSold: { $sum: '$quantity' },
          revenue: {
            $sum: {
              $multiply: ['$quantity', '$productData.sellingPrice'],
            },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    return result.map((item) => ({
      productId: item._id,
      name: item.productName,
      totalSold: item.totalSold,
      revenue: item.revenue,
    }));
  } catch (error) {
    console.error('Error getting top products:', error);
    return [];
  }
};

// Get low stock products
exports.getLowStockProducts = async () => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minimumThreshold'] },
    }).select('productId name quantity minimumThreshold unit sellingPrice');

    return products.map((product) => ({
      productId: product.productId,
      name: product.name,
      currentStock: product.quantity,
      minimumThreshold: product.minimumThreshold,
      unit: product.unit,
      value: product.quantity * product.sellingPrice,
    }));
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
};

// Get outstanding customers
exports.getOutstandingCustomers = async (limit = 10) => {
  try {
    const customers = await Customer.find({
      outstandingBalance: { $gt: 0 },
    })
      .sort({ outstandingBalance: -1 })
      .limit(limit)
      .select('customerId name phone outstandingBalance');

    return customers.map((customer) => ({
      customerId: customer.customerId,
      name: customer.name,
      phone: customer.phone,
      outstanding: customer.outstandingBalance,
    }));
  } catch (error) {
    console.error('Error getting outstanding customers:', error);
    return [];
  }
};
