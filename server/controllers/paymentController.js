const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const generatePaymentId = async () => {
  const count = await Payment.countDocuments();
  return `PAY-${String(count + 1).padStart(6, '0')}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
};

exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customer, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const payments = await Payment.find(filter)
      .populate('order', 'orderId totalAmount')
      .populate('customer', 'name customerId')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order')
      .populate('customer')
      .populate('reconciledBy', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { order, customer, amount, paymentMethod, reference, bankName, chequeNumber, upiId, notes } = req.body;

    const existingOrder = await Order.findById(order);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const existingCustomer = await Customer.findById(customer);
    if (!existingCustomer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const paymentId = await generatePaymentId();

    const payment = new Payment({
      paymentId,
      order,
      customer,
      amount,
      paymentMethod,
      reference,
      bankName,
      chequeNumber,
      upiId,
      notes,
      status: 'Pending',
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, reconciled, notes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (status) payment.status = status;
    if (typeof reconciled === 'boolean') {
      payment.reconciled = reconciled;
      if (reconciled) {
        payment.reconciledDate = new Date();
        payment.reconciledBy = req.admin._id;
      }
    }
    if (notes) payment.notes = notes;

    await payment.save();

    if (status === 'Completed') {
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'Paid';
        await order.save();
      }

      const customer = await Customer.findById(payment.customer);
      if (customer) {
        customer.outstanding -= payment.amount;
        if (customer.outstanding < 0) customer.outstanding = 0;
        await customer.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { customerId } = req.params;

    const filter = { customer: customerId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const payments = await Payment.find(filter)
      .populate('order', 'orderId totalAmount')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const methodStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = stats.reduce((sum, stat) => {
      if (stat._id === 'Completed') return sum + stat.total;
      return sum;
    }, 0);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        byMethod: methodStats,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
