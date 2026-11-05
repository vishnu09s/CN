import { Phone } from 'lucide-react';

const OutstandingCustomersCard = ({ customers = [] }) => {
  if (!customers || customers.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Outstanding Payments</h3>
        <div className="text-center py-8 text-gray-500">
          No outstanding payments
        </div>
      </div>
    );
  }

  const totalOutstanding = customers.reduce((sum, customer) => sum + customer.outstanding, 0);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Outstanding Payments</h3>
        <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
          ₹{totalOutstanding.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {customers.map((customer, index) => (
          <div key={customer.customerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-xs">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-800">{customer.name}</p>
                <a
                  href={`tel:${customer.phone}`}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Phone size={12} />
                  {customer.phone}
                </a>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-red-600">₹{customer.outstanding.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500">Due</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutstandingCustomersCard;
