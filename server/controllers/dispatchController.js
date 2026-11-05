const Dispatch = require('../models/Dispatch');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { generateId } = require('../utils/helpers');

// Get all dispatches
exports.getAllDispatches = async (req, res) => {
  try {
    const { status, customer, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (customer) {
      query.customer = customer;
    }

    const skip = (page - 1) * limit;

    const [dispatches, total] = await Promise.all([
      Dispatch.find(query)
        .populate('order', 'orderId totalAmount')
        .populate('customer', 'name phone customerId')
        .sort({ dispatchDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Dispatch.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: dispatches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching dispatches:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dispatches',
    });
  }
};

// Get single dispatch
exports.getDispatchById = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id)
      .populate('order')
      .populate('customer', 'name phone email address customerId')
      .populate('items.product', 'productId name unit');

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    res.json({
      success: true,
      data: dispatch,
    });
  } catch (error) {
    console.error('Error fetching dispatch:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dispatch',
    });
  }
};

// Get dispatch by tracking number
exports.getDispatchByTrackingNumber = async (req, res) => {
  try {
    const dispatch = await Dispatch.findOne({
      trackingNumber: req.params.trackingNumber,
    })
      .populate('order')
      .populate('customer', 'name phone')
      .populate('items.product', 'productId name');

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    res.json({
      success: true,
      data: dispatch,
    });
  } catch (error) {
    console.error('Error fetching dispatch:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dispatch',
    });
  }
};

// Create dispatch
exports.createDispatch = async (req, res) => {
  try {
    const {
      order,
      trackingNumber,
      carrier,
      carrierName,
      estimatedDeliveryDate,
      recipientName,
      recipientPhone,
    } = req.body;

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order is required',
      });
    }

    // Verify order exists and is ready for dispatch
    const orderDoc = await Order.findById(order)
      .populate('customer')
      .populate('items.product');

    if (!orderDoc) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (orderDoc.orderStatus !== 'Ready for Dispatch') {
      return res.status(400).json({
        success: false,
        message: `Order must be in "Ready for Dispatch" status. Current status: ${orderDoc.orderStatus}`,
      });
    }

    // Check if tracking number already exists
    if (trackingNumber) {
      const existingTracking = await Dispatch.findOne({ trackingNumber });
      if (existingTracking) {
        return res.status(400).json({
          success: false,
          message: 'Tracking number already exists',
        });
      }
    }

    // Generate dispatch ID
    const dispatchId = generateId('DISP');

    // Format items
    const items = orderDoc.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      unit: item.product.unit,
      productId: item.product.productId,
      productName: item.product.name,
    }));

    // Create dispatch
    const dispatch = await Dispatch.create({
      dispatchId,
      order,
      customer: orderDoc.customer._id,
      trackingNumber: trackingNumber || null,
      carrier: carrier || 'Self',
      carrierName: carrierName || null,
      estimatedDeliveryDate,
      items,
      deliveryAddress: orderDoc.deliveryAddress,
      totalAmount: orderDoc.totalAmount,
      recipientName: recipientName || orderDoc.customer.name,
      recipientPhone: recipientPhone || orderDoc.customer.phone,
      status: 'Dispatched',
      updates: [
        {
          status: 'Dispatched',
          timestamp: new Date(),
          notes: 'Order dispatched',
        },
      ],
    });

    // Update order status
    orderDoc.orderStatus = 'Dispatched';
    orderDoc.dispatchDate = new Date();
    await orderDoc.save();

    const populatedDispatch = await Dispatch.findById(dispatch._id)
      .populate('order', 'orderId totalAmount')
      .populate('customer', 'name phone customerId');

    res.status(201).json({
      success: true,
      message: 'Dispatch created successfully',
      data: populatedDispatch,
    });
  } catch (error) {
    console.error('Error creating dispatch:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating dispatch',
    });
  }
};

// Update dispatch status
exports.updateDispatchStatus = async (req, res) => {
  try {
    const { newStatus, location, notes } = req.body;

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'New status is required',
      });
    }

    const validStatuses = [
      'Dispatched',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Failed Delivery',
      'Returned',
    ];

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
      });
    }

    let dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    // Update status
    dispatch.status = newStatus;

    // Add update record
    dispatch.updates.push({
      status: newStatus,
      location: location || '',
      notes: notes || '',
      timestamp: new Date(),
    });

    // Handle delivery
    if (newStatus === 'Delivered') {
      dispatch.deliveryDate = new Date();
    }

    dispatch.updatedAt = new Date();
    await dispatch.save();

    const updatedDispatch = await Dispatch.findById(dispatch._id)
      .populate('order', 'orderId')
      .populate('customer', 'name phone');

    res.json({
      success: true,
      message: `Dispatch status updated to ${newStatus}`,
      data: updatedDispatch,
    });
  } catch (error) {
    console.error('Error updating dispatch status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating dispatch status',
    });
  }
};

// Confirm delivery
exports.confirmDelivery = async (req, res) => {
  try {
    const { deliveryConfirmedBy, recipientName, recipientPhone, deliveryProof, signature } = req.body;

    if (!deliveryConfirmedBy) {
      return res.status(400).json({
        success: false,
        message: 'Delivery confirmed by is required',
      });
    }

    let dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    // Update delivery information
    dispatch.status = 'Delivered';
    dispatch.deliveryDate = new Date();
    dispatch.deliveryConfirmedBy = deliveryConfirmedBy;
    dispatch.recipientName = recipientName || dispatch.recipientName;
    dispatch.recipientPhone = recipientPhone || dispatch.recipientPhone;
    dispatch.deliveryProof = deliveryProof || null;
    dispatch.signature = signature || null;

    // Add update
    dispatch.updates.push({
      status: 'Delivered',
      timestamp: new Date(),
      notes: `Delivered and confirmed by ${deliveryConfirmedBy}`,
    });

    // Update order to delivered
    const order = await Order.findById(dispatch.order);
    order.orderStatus = 'Delivered';
    order.actualDeliveryDate = new Date();
    await order.save();

    dispatch.updatedAt = new Date();
    await dispatch.save();

    const updatedDispatch = await Dispatch.findById(dispatch._id)
      .populate('order')
      .populate('customer', 'name phone');

    res.json({
      success: true,
      message: 'Delivery confirmed successfully',
      data: updatedDispatch,
    });
  } catch (error) {
    console.error('Error confirming delivery:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error confirming delivery',
    });
  }
};

// Mark as failed delivery
exports.markFailedDelivery = async (req, res) => {
  try {
    const { failureReason } = req.body;

    if (!failureReason) {
      return res.status(400).json({
        success: false,
        message: 'Failure reason is required',
      });
    }

    let dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    dispatch.status = 'Failed Delivery';
    dispatch.failureReason = failureReason;

    dispatch.updates.push({
      status: 'Failed Delivery',
      notes: failureReason,
      timestamp: new Date(),
    });

    dispatch.updatedAt = new Date();
    await dispatch.save();

    const updatedDispatch = await Dispatch.findById(dispatch._id)
      .populate('order', 'orderId')
      .populate('customer', 'name phone');

    res.json({
      success: true,
      message: 'Delivery marked as failed',
      data: updatedDispatch,
    });
  } catch (error) {
    console.error('Error marking failed delivery:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking failed delivery',
    });
  }
};

// Get customer dispatches
exports.getCustomerDispatches = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [dispatches, total] = await Promise.all([
      Dispatch.find({ customer: req.params.customerId })
        .populate('order', 'orderId totalAmount')
        .sort({ dispatchDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Dispatch.countDocuments({ customer: req.params.customerId }),
    ]);

    res.json({
      success: true,
      data: dispatches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customer dispatches:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customer dispatches',
    });
  }
};
