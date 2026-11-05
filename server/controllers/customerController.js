const Customer = require('../models/Customer');
const { generateId } = require('../utils/helpers');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, isActive } = req.query;
    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Customer.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customers',
    });
  }
};

// Get single customer
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customer',
    });
  }
};

// Create customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, city, state, zipCode, businessName, gstNumber, creditLimit } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required',
      });
    }

    // Check if customer with same phone already exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this phone already exists',
      });
    }

    // Generate customer ID
    const customerId = generateId('CUST');

    const customer = await Customer.create({
      customerId,
      name,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      businessName,
      gstNumber,
      creditLimit: creditLimit || 0,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating customer',
    });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, city, state, zipCode, businessName, gstNumber, creditLimit, isActive } = req.body;

    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Check if phone is being changed and already exists
    if (phone && phone !== customer.phone) {
      const existingCustomer = await Customer.findOne({ phone });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists',
        });
      }
    }

    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: name || customer.name,
        phone: phone || customer.phone,
        email: email || customer.email,
        address: address || customer.address,
        city: city || customer.city,
        state: state || customer.state,
        zipCode: zipCode || customer.zipCode,
        businessName: businessName || customer.businessName,
        gstNumber: gstNumber || customer.gstNumber,
        creditLimit: creditLimit !== undefined ? creditLimit : customer.creditLimit,
        isActive: isActive !== undefined ? isActive : customer.isActive,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating customer',
    });
  }
};

// Delete customer (deactivate)
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Soft delete - deactivate
    customer.isActive = false;
    customer.updatedAt = new Date();
    await customer.save();

    res.json({
      success: true,
      message: 'Customer deactivated successfully',
      data: customer,
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting customer',
    });
  }
};

// Get customer ledger
exports.getCustomerLedger = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          customerId: customer.customerId,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
        },
        ledger: {
          totalOrders: customer.totalOrders,
          totalPurchased: customer.totalPurchased,
          totalPaid: customer.totalPaid,
          outstandingBalance: customer.outstandingBalance,
          creditLimit: customer.creditLimit,
          availableCredit: customer.creditLimit - customer.outstandingBalance,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching customer ledger:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customer ledger',
    });
  }
};
