import { AlertTriangle, Package } from 'lucide-react';

const LowStockCard = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return (
      <div className="card p-6 border-l-4 border-green-500 bg-green-50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Package size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">All Stock Levels Good</h3>
            <p className="text-sm text-gray-600 mt-1">No products are below minimum threshold</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 border-l-4 border-red-500">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-red-600" />
        <h3 className="text-lg font-semibold text-gray-800">Low Stock Alert</h3>
        <span className="ml-auto bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
          {products.length} item{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.productId}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Stock: {product.currentStock} {product.unit} (Minimum: {product.minimumThreshold})
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-600">
                  ₹{product.value.toLocaleString('en-IN')}
                </p>
                <div className="w-12 h-1 bg-red-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{
                      width: `${Math.min((product.currentStock / product.minimumThreshold) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockCard;
