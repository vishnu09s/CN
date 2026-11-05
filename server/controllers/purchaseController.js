const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const InventoryTransaction = require('../models/InventoryTransaction');
const { generateId } = require('../utils/helpers');

// Get all purchases
exports.getAllPurchases = async (req, res) => {
  try {
    const { supplier, status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (supplier) {
      query.supplier = supplier;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate('supplier', 'name phone')
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Purchase.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching purchases',
    });
  }
};

// Get single purchase
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'name phone email address')
      .populate('items.product', 'productId name unit');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching purchase',
    });
  }
};

// Create purchase
exports.createPurchase = async (req, res) => {
  try {
    const { supplier, items, additionalExpenses, tax } = req.body;

    if (!supplier || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Supplier and items are required',
      });
    }

    // Verify supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(400).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    // Verify all products exist and calculate subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      const itemSubtotal = item.quantity * item.purchasePrice;
      subtotal += itemSubtotal;

      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        subtotal: itemSubtotal,
      });
    }

    // Calculate total
    const totalAmount = subtotal + (additionalExpenses || 0) + (tax || 0);

    // Generate purchase ID
    const purchaseId = generateId('PUR');

    const purchase = await Purchase.create({
      purchaseId,
      supplier,
      items: validatedItems,
      subtotal,
      additionalExpenses: additionalExpenses || 0,
      tax: tax || 0,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Unpaid',
    });

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('supplier', 'name phone')
      .populate('items.product', 'productId name unit');

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: populatedPurchase,
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating purchase',
    });
  }
};

// Confirm purchase (receive inventory)
exports.confirmPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('items.product');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    if (purchase.status === 'Received') {
      return res.status(400).json({
        success: false,
        message: 'Purchase already received',
      });
    }

    // Update inventory for each item
    for (const item of purchase.items) {
      const product = await Product.findById(item.product._id);

      const previousQuantity = product.quantity;
      const newQuantity = previousQuantity + item.quantity;

      product.quantity = newQuantity;
      product.isLowStock = product.quantity <= product.minimumThreshold;
      product.updatedAt = new Date();
      await product.save();

      // Create transaction record
      await InventoryTransaction.create({
        product: item.product._id,
        transactionType: 'Purchase Addition',
        quantity: item.quantity,
        previousQuantity,
        newQuantity,
        reference: {
          referenceType: 'Purchase',
          referenceId: purchase._id,
          referenceNumber: purchase.purchaseId,
        },
      });
    }

    // Update purchase status
    purchase.status = 'Received';
    purchase.updatedAt = new Date();
    await purchase.save();

    const updatedPurchase = await Purchase.findById(purchase._id)
      .populate('supplier', 'name phone')
      .populate('items.product', 'productId name unit');

    res.json({
      success: true,
      message: 'Purchase confirmed and inventory updated',
      data: updatedPurchase,
    });
  } catch (error) {
    console.error('Error confirming purchase:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error confirming purchase',
    });
  }
};

// Record payment
exports.recordPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    const newAmountPaid = purchase.amountPaid + amount;

    if (newAmountPaid > purchase.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment exceeds purchase total',
      });
    }

    purchase.amountPaid = newAmountPaid;

    // Update payment status
    if (purchase.amountPaid === 0) {
      purchase.paymentStatus = 'Unpaid';
    } else if (purchase.amountPaid >= purchase.totalAmount) {
      purchase.paymentStatus = 'Fully Paid';
    } else {
      purchase.paymentStatus = 'Partially Paid';
    }

    purchase.pendingAmount = purchase.totalAmount - purchase.amountPaid;
    purchase.updatedAt = new Date();
    await purchase.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: purchase,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error recording payment',
    });
  }
};

// Cancel purchase
exports.cancelPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    if (purchase.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Purchase already cancelled',
      });
    }

    if (purchase.status === 'Received' && purchase.amountPaid > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel purchase with received inventory and payment. Adjust inventory first.',
      });
    }

    purchase.status = 'Cancelled';
    purchase.updatedAt = new Date();
    await purchase.save();

    res.json({
      success: true,
      message: 'Purchase cancelled successfully',
      data: purchase,
    });
  } catch (error) {
    console.error('Error cancelling purchase:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling purchase',
    });
  }
};

// Get supplier purchases
exports.getSupplierPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      Purchase.find({ supplier: req.params.supplierId })
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Purchase.countDocuments({ supplier: req.params.supplierId }),
    ]);

    res.json({
      success: true,
      data: purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching supplier purchases:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching supplier purchases',
    });
  }
};
