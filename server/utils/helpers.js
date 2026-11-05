const generateId = (prefix) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
};

const calculateOrderTotals = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.sellingPrice;
    const discount = item.discount || 0;
    return sum + (itemTotal - discount);
  }, 0);

  const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);

  return {
    subtotal,
    totalDiscount,
  };
};

const calculatePurchaseTotals = (items) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.quantity * item.purchasePrice;
  }, 0);

  return { subtotal };
};

const checkLowStock = (quantity, threshold) => {
  return quantity <= threshold;
};

const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const calculateOutstandingBalance = (totalAmount, totalPaid) => {
  return Math.max(0, totalAmount - totalPaid);
};

const getPaymentStatus = (totalAmount, totalPaid) => {
  if (totalPaid === 0) return 'Unpaid';
  if (totalPaid >= totalAmount) return 'Fully Paid';
  return 'Partially Paid';
};

module.exports = {
  generateId,
  calculateOrderTotals,
  calculatePurchaseTotals,
  checkLowStock,
  formatCurrency,
  calculateOutstandingBalance,
  getPaymentStatus,
};
