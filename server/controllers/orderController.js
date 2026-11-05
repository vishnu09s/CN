const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { generateId, calculateOrderTotals, getPaymentStatus } = require('../utils/helpers');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { customer, orderStatus, paymentStatus, page = 1, limit = 20 } = req.query;
    let query = {};

    if (customer) {
      query.customer = customer;
    }

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name phone customerId')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders',
    });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone email address customerId')
      .populate('items.product', 'productId name unit sellingPrice')
      .populate('invoice');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order',
    });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, deliveryAddress, expectedDeliveryDate, tax } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer and items are required',
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required',
      });
    }

    // Verify customer exists
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Verify all products exist and have sufficient stock
    let subtotal = 0;
    let totalDiscount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      // Check if sufficient stock available (quantity - reserved)
      const availableStock = product.quantity - product.reservedQuantity;
      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${availableStock}`,
        });
      }

      const discount = item.discount || 0;
      const itemSubtotal = item.quantity * item.sellingPrice - discount;
      subtotal += itemSubtotal;
      totalDiscount += discount;

      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        discount: discount,
        subtotal: itemSubtotal,
      });
    }

    // Calculate total
    const totalAmount = subtotal + (tax || 0);

    // Generate order ID
    const orderId = generateId('ORD');

    // Create order
    const order = await Order.create({
      orderId,
      customer,
      items: validatedItems,
      subtotal,
      totalDiscount,
      tax: tax || 0,
      totalAmount,
      deliveryAddress,
      expectedDeliveryDate,
      orderStatus: 'Order Received',
      paymentStatus: 'Unpaid',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('items.product', 'productId name');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order',
    });
  }
};

// Accept order (reserve inventory)
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.orderStatus !== 'Order Received') {
      return res.status(400).json({
        success: false,
        message: 'Only orders in "Order Received" status can be accepted',
      });
    }

    // Verify and reserve inventory
    const reservedInventory = [];

    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      const availableStock = product.quantity - product.reservedQuantity;

      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Reserve inventory
      product.reservedQuantity += item.quantity;
      await product.save();

      reservedInventory.push({
        product: item.product._id,
        quantity: item.quantity,
      });

      // Create reservation transaction
      await InventoryTransaction.create({
        product: item.product._id,
        transactionType: 'Order Reservation',
        quantity: item.quantity,
        previousQuantity: product.quantity - item.quantity,
        newQuantity: product.quantity,
        reference: {
          referenceType: 'Order',
          referenceId: order._id,
          referenceNumber: order.orderId,
        },
      });
    }

    // Update order
    order.orderStatus = 'Accepted';
    order.reservedInventory = reservedInventory;
    order.updatedAt = new Date();
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('items.product', 'productId name');

    res.json({
      success: true,
      message: 'Order accepted and inventory reserved',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error accepting order',
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { newStatus } = req.body;

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'New status is required',
      });
    }

    const validStatuses = [
      'Order Received',
      'Accepted',
      'Processing',
      'Ready for Dispatch',
      'Dispatched',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
      });
    }

    let order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Handle dispatch
    if (newStatus === 'Dispatched' && order.orderStatus !== 'Dispatched') {
      if (order.orderStatus !== 'Ready for Dispatch') {
        return res.status(400).json({
          success: false,
          message: 'Only orders in "Ready for Dispatch" status can be dispatched',
        });
      }

      // Update inventory (deduct from physical stock)
      for (const item of order.items) {
        const product = await Product.findById(item.product._id);

        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity - item.quantity;

        if (newQuantity < 0) {
          return res.status(400).json({
            success: false,
            message: `Insufficient quantity for ${product.name}`,
          });
        }

        product.quantity = newQuantity;
        product.reservedQuantity -= item.quantity;
        product.isLowStock = product.quantity <= product.minimumThreshold;
        product.updatedAt = new Date();
        await product.save();

        // Create dispatch transaction
        await InventoryTransaction.create({
          product: item.product._id,
          transactionType: 'Order Dispatch',
          quantity: item.quantity,
          previousQuantity,
          newQuantity,
          reference: {
            referenceType: 'Order',
            referenceId: order._id,
            referenceNumber: order.orderId,
          },
        });
      }

      order.dispatchDate = new Date();
    }

    // Handle cancellation
    if (newStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      if (order.orderStatus === 'Dispatched' || order.orderStatus === 'Delivered') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel dispatched or delivered orders',
        });
      }

      // Release reserved inventory if not yet dispatched
      if (order.orderStatus !== 'Dispatched') {
        for (const item of order.reservedInventory) {
          const product = await Product.findById(item.product);
          product.reservedQuantity -= item.quantity;
          await product.save();

          // Create cancellation transaction
          await InventoryTransaction.create({
            product: item.product,
            transactionType: 'Order Cancellation',
            quantity: item.quantity,
            previousQuantity: product.quantity + item.quantity,
            newQuantity: product.quantity,
            reference: {
              referenceType: 'Order',
              referenceId: order._id,
              referenceNumber: order.orderId,
            },
          });
        }
      }
    }

    order.orderStatus = newStatus;
    order.updatedAt = new Date();
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('items.product', 'productId name');

    res.json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order status',
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

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const newTotalPaid = order.totalPaid + amount;

    if (newTotalPaid > order.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment exceeds order total',
      });
    }

    order.totalPaid = newTotalPaid;
    order.paymentStatus = getPaymentStatus(order.totalAmount, order.totalPaid);
    order.pendingAmount = order.totalAmount - order.totalPaid;
    order.updatedAt = new Date();
    await order.save();

    // Update customer outstanding balance
    const customer = await Customer.findById(order.customer);
    customer.totalPaid += amount;
    customer.outstandingBalance = customer.totalPurchased - customer.totalPaid;
    await customer.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error recording payment',
    });
  }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.params.customerId })
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments({ customer: req.params.customerId }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customer orders',
    });
  }
};
