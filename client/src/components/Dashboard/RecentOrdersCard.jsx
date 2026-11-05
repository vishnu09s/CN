import { Link } from 'react-router-dom';
import { Badge } from 'lucide-react';

const getStatusColor = (status) => {
  const colors = {
    'Order Received': 'bg-blue-100 text-blue-800',
    'Accepted': 'bg-purple-100 text-purple-800',
    'Processing': 'bg-yellow-100 text-yellow-800',
    'Ready for Dispatch': 'bg-orange-100 text-orange-800',
    'Dispatched': 'bg-cyan-100 text-cyan-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPaymentStatusColor = (status) => {
  const colors = {
    'Unpaid': 'bg-red-100 text-red-800',
    'Partially Paid': 'bg-yellow-100 text-yellow-800',
    'Fully Paid': 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const RecentOrdersCard = ({ orders = [] }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
        <div className="text-center py-8 text-gray-500">
          No recent orders
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 font-medium text-gray-700">Order ID</th>
              <th className="text-left py-2 px-2 font-medium text-gray-700">Customer</th>
              <th className="text-left py-2 px-2 font-medium text-gray-700">Amount</th>
              <th className="text-left py-2 px-2 font-medium text-gray-700">Status</th>
              <th className="text-left py-2 px-2 font-medium text-gray-700">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <Link
                    to={`/orders/${order.orderId}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {order.orderId}
                  </Link>
                </td>
                <td className="py-3 px-2 text-gray-600">{order.customerName}</td>
                <td className="py-3 px-2 font-medium text-gray-800">
                  ₹{order.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersCard;
