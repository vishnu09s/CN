const Product = require('../models/Product');
const Category = require('../models/Category');
const InventoryTransaction = require('../models/InventoryTransaction');
const { generateId, checkLowStock } = require('../utils/helpers');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products',
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product',
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      unit,
      purchasePrice,
      sellingPrice,
      minimumThreshold,
    } = req.body;

    // Validate required fields
    if (!name || !category || !unit || !purchasePrice || !sellingPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Generate product ID
    const productId = generateId('PRD');

    const product = await Product.create({
      productId,
      name,
      category,
      description,
      unit,
      purchasePrice,
      sellingPrice,
      minimumThreshold: minimumThreshold || 10,
      quantity: 0,
    });

    const populatedProduct = await Product.findById(product._id).populate('category');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating product',
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, description, unit, purchasePrice, sellingPrice, minimumThreshold } = req.body;

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Verify category if being changed
    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category not found',
        });
      }
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name || product.name,
        category: category || product.category,
        description: description || product.description,
        unit: unit || product.unit,
        purchasePrice: purchasePrice !== undefined ? purchasePrice : product.purchasePrice,
        sellingPrice: sellingPrice !== undefined ? sellingPrice : product.sellingPrice,
        minimumThreshold: minimumThreshold !== undefined ? minimumThreshold : product.minimumThreshold,
        isLowStock: checkLowStock(product.quantity, minimumThreshold || product.minimumThreshold),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('category');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating product',
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product has transactions
    const transactionCount = await InventoryTransaction.countDocuments({
      product: req.params.id,
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with transaction history. Quantity must be adjusted to 0 first.',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting product',
    });
  }
};

// Get product transaction history
exports.getProductTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find({ product: req.params.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      InventoryTransaction.countDocuments({ product: req.params.id }),
    ]);

    res.json({
      success: true,
      data: {
        product: {
          productId: product.productId,
          name: product.name,
          currentQuantity: product.quantity,
        },
        transactions,
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching transactions',
    });
  }
};

// Adjust inventory
exports.adjustInventory = async (req, res) => {
  try {
    const { quantity, reason } = req.body;

    if (!quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and reason are required',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + quantity;

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment would result in negative inventory',
      });
    }

    // Update product quantity
    product.quantity = newQuantity;
    product.isLowStock = checkLowStock(newQuantity, product.minimumThreshold);
    product.updatedAt = new Date();
    await product.save();

    // Create transaction record
    await InventoryTransaction.create({
      product: product._id,
      transactionType: 'Manual Adjustment',
      quantity: Math.abs(quantity),
      previousQuantity,
      newQuantity,
      notes: reason,
      reference: {
        referenceType: 'Manual',
      },
    });

    res.json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adjusting inventory',
    });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minimumThreshold'] },
    })
      .populate('category')
      .sort({ quantity: 1 });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching low stock products',
    });
  }
};
