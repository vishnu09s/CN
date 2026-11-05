const mongoose = require('mongoose');
const CustomerLedger = require('../models/CustomerLedger');
const Customer = require('../models/Customer');

exports.getLedgerByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 50, startDate, endDate } = req.query;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const filter = { customer: customerId };
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const ledgerEntries = await CustomerLedger.find(filter)
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CustomerLedger.countDocuments(filter);

    const latestEntry = await CustomerLedger.findOne({ customer: customerId }).sort({ transactionDate: -1 });

    res.json({
      success: true,
      data: {
        customer: {
          _id: customer._id,
          customerId: customer.customerId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          outstanding: customer.outstanding,
          creditLimit: customer.creditLimit,
        },
        entries: ledgerEntries,
        currentBalance: latestEntry ? latestEntry.runningBalance : 0,
      },
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

exports.addLedgerEntry = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { transactionType, description, debit, credit, reference, notes } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const latestEntry = await CustomerLedger.findOne({ customer: customerId }).sort({ transactionDate: -1 });
    const previousBalance = latestEntry ? latestEntry.runningBalance : 0;

    const newBalance = previousBalance + (credit || 0) - (debit || 0);

    const ledgerEntry = new CustomerLedger({
      customer: customerId,
      transactionType,
      description,
      debit: debit || 0,
      credit: credit || 0,
      runningBalance: newBalance,
      reference,
      notes,
    });

    await ledgerEntry.save();

    customer.outstanding = newBalance;
    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Ledger entry added successfully',
      data: ledgerEntry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLedgerSummary = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const summary = await CustomerLedger.aggregate([
      { $match: { customer: mongoose.Types.ObjectId(customerId) } },
      {
        $group: {
          _id: '$transactionType',
          totalDebit: { $sum: '$debit' },
          totalCredit: { $sum: '$credit' },
          count: { $sum: 1 },
        },
      },
    ]);

    const latestEntry = await CustomerLedger.findOne({ customer: customerId }).sort({ transactionDate: -1 });

    res.json({
      success: true,
      data: {
        customer: {
          name: customer.name,
          customerId: customer.customerId,
          outstanding: customer.outstanding,
          creditLimit: customer.creditLimit,
        },
        summary,
        currentBalance: latestEntry ? latestEntry.runningBalance : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCustomerLedgers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};
    if (status === 'outstanding') {
      filter['$expr'] = { $gt: ['$outstanding', 0] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const customers = await Customer.find(filter)
      .sort({ outstanding: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(filter);

    const customerLedgers = await Promise.all(
      customers.map(async (customer) => {
        const latestEntry = await CustomerLedger.findOne({ customer: customer._id }).sort({ transactionDate: -1 });
        return {
          _id: customer._id,
          customerId: customer.customerId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          outstanding: customer.outstanding,
          creditLimit: customer.creditLimit,
          creditUtilization: ((customer.outstanding / customer.creditLimit) * 100).toFixed(2),
          lastTransaction: latestEntry ? latestEntry.transactionDate : null,
        };
      })
    );

    res.json({
      success: true,
      data: customerLedgers,
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
