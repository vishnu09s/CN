const Supplier = require('../models/Supplier');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
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
      ];
    }

    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Supplier.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching suppliers',
    });
  }
};

// Get single supplier
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching supplier',
    });
  }
};

// Create supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, city, state, zipCode, gstNumber, paymentTerms } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required',
      });
    }

    // Check if supplier with same phone already exists
    const existingSupplier = await Supplier.findOne({ phone });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this phone already exists',
      });
    }

    const supplier = await Supplier.create({
      name,
      contactPerson,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      gstNumber,
      paymentTerms: paymentTerms || 'Net 30',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier,
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating supplier',
    });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, city, state, zipCode, gstNumber, paymentTerms, isActive } = req.body;

    let supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    // Check if phone is being changed and already exists
    if (phone && phone !== supplier.phone) {
      const existingSupplier = await Supplier.findOne({ phone });
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists',
        });
      }
    }

    supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        name: name || supplier.name,
        contactPerson: contactPerson || supplier.contactPerson,
        phone: phone || supplier.phone,
        email: email || supplier.email,
        address: address || supplier.address,
        city: city || supplier.city,
        state: state || supplier.state,
        zipCode: zipCode || supplier.zipCode,
        gstNumber: gstNumber || supplier.gstNumber,
        paymentTerms: paymentTerms || supplier.paymentTerms,
        isActive: isActive !== undefined ? isActive : supplier.isActive,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier,
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating supplier',
    });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    // Mark as inactive instead of deleting
    supplier.isActive = false;
    supplier.updatedAt = new Date();
    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier deactivated successfully',
      data: supplier,
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting supplier',
    });
  }
};
