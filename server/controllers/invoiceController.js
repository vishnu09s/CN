const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const BusinessSettings = require('../models/BusinessSettings');

const generateInvoiceId = async () => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
};

exports.getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customer, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const invoices = await Invoice.find(filter)
      .populate('order', 'orderId')
      .populate('customer', 'name customerId email')
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: invoices,
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

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('order')
      .populate('customer')
      .populate('issuedBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInvoiceByNumber = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceId: req.params.invoiceId })
      .populate('order')
      .populate('customer')
      .populate('issuedBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'Draft') {
      return res.status(403).json({ success: false, message: 'Draft invoices cannot be viewed' });
    }

    invoice.viewedDate = new Date();
    invoice.status = 'Viewed';
    await invoice.save();

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const {
      order,
      customer,
      items,
      subtotal,
      taxAmount,
      discount,
      discountType,
      shippingCharges,
      notes,
      terms,
      dueDate,
      paymentTerms,
    } = req.body;

    const orderData = await Order.findById(order);
    if (!orderData) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const customerData = await Customer.findById(customer);
    if (!customerData) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const settings = await BusinessSettings.findOne();

    const invoiceId = await generateInvoiceId();

    let calculatedTotal = subtotal || 0;
    if (discountType === 'Percentage') {
      calculatedTotal -= (calculatedTotal * discount) / 100;
    } else {
      calculatedTotal -= discount || 0;
    }
    calculatedTotal += taxAmount || 0;
    calculatedTotal += shippingCharges || 0;

    const invoice = new Invoice({
      invoiceId,
      order,
      customer,
      items,
      subtotal: subtotal || 0,
      taxAmount: taxAmount || 0,
      discount: discount || 0,
      discountType,
      shippingCharges: shippingCharges || 0,
      total: calculatedTotal,
      notes,
      terms,
      dueDate,
      paymentTerms,
      status: 'Draft',
      issuedBy: req.admin._id,
      invoiceNumber: invoiceId,
      businessName: settings?.businessName,
      businessAddress: settings?.businessAddress,
      businessPhone: settings?.businessPhone,
      businessEmail: settings?.businessEmail,
      businessGST: settings?.gstNumber,
      customerName: customerData.name,
      customerAddress: customerData.address,
      customerPhone: customerData.phone,
      customerEmail: customerData.email,
      customerGST: customerData.gstNumber,
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { items, subtotal, taxAmount, discount, discountType, shippingCharges, notes, terms, dueDate } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Only draft invoices can be updated' });
    }

    if (items) invoice.items = items;
    if (subtotal !== undefined) invoice.subtotal = subtotal;
    if (taxAmount !== undefined) invoice.taxAmount = taxAmount;
    if (discount !== undefined) invoice.discount = discount;
    if (discountType) invoice.discountType = discountType;
    if (shippingCharges !== undefined) invoice.shippingCharges = shippingCharges;
    if (notes) invoice.notes = notes;
    if (terms) invoice.terms = terms;
    if (dueDate) invoice.dueDate = dueDate;

    let calculatedTotal = invoice.subtotal;
    if (invoice.discountType === 'Percentage') {
      calculatedTotal -= (calculatedTotal * invoice.discount) / 100;
    } else {
      calculatedTotal -= invoice.discount;
    }
    calculatedTotal += invoice.taxAmount;
    calculatedTotal += invoice.shippingCharges;
    invoice.total = calculatedTotal;

    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'Draft') {
      invoice.status = 'Sent';
      invoice.sentDate = new Date();
    }

    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.status = 'Paid';
    invoice.paidDate = new Date();

    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice marked as paid',
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a paid invoice' });
    }

    invoice.status = 'Cancelled';

    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice cancelled',
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerInvoices = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const filter = { customer: customerId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const invoices = await Invoice.find(filter)
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: invoices,
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

exports.getInvoiceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    const stats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
        },
      },
    ]);

    const totalInvoiced = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        totalInvoiced: totalInvoiced[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
