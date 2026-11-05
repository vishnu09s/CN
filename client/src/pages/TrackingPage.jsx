import { useState } from 'react';
import { Search, MapPin, CheckCircle, AlertCircle, Truck } from 'lucide-react';
import { getDispatchByTrackingNumber } from '../api/dispatchAPI';
import toast from 'react-hot-toast';

const TrackingPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [dispatch, setDispatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const result = await getDispatchByTrackingNumber(trackingNumber);
      if (result.success) {
        setDispatch(result.data);
      }
    } catch (error) {
      setDispatch(null);
      toast.error(error.message || 'Tracking number not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const iconProps = { size: 20 };
    const statuses = {
      'Dispatched': <Truck {...iconProps} className="text-blue-600" />,
      'In Transit': <Truck {...iconProps} className="text-purple-600" />,
      'Out for Delivery': <MapPin {...iconProps} className="text-orange-600" />,
      'Delivered': <CheckCircle {...iconProps} className="text-green-600" />,
      'Failed Delivery': <AlertCircle {...iconProps} className="text-red-600" />,
      'Returned': <AlertCircle {...iconProps} className="text-yellow-600" />,
    };
    return statuses[status] || <Truck {...iconProps} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Track Your Shipment</h1>
          <p className="text-gray-600 mt-2">Enter your tracking number to see the status of your delivery</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="card p-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Enter tracking number (e.g., DISP-123456ABC)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="card p-12 text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for your shipment...</p>
          </div>
        )}

        {searched && !loading && !dispatch && (
          <div className="card p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-yellow-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No Shipment Found</h2>
            <p className="text-gray-600">We couldn't find a shipment with that tracking number.</p>
            <p className="text-gray-500 text-sm mt-4">Please check the tracking number and try again.</p>
          </div>
        )}

        {dispatch && (
          <div className="space-y-6">
            {/* Shipment Summary */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Shipment Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Dispatch ID</p>
                  <p className="text-lg font-semibold text-gray-800">{dispatch.dispatchId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Tracking Number</p>
                  <p className="text-lg font-mono font-semibold text-gray-800">{dispatch.trackingNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Carrier</p>
                  <p className="text-lg font-semibold text-gray-800">{dispatch.carrierName || dispatch.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Order Total</p>
                  <p className="text-lg font-semibold text-gray-800">₹{dispatch.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  {getStatusIcon(dispatch.status)}
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <p className="text-2xl font-bold text-gray-800">{dispatch.status}</p>
                    {dispatch.deliveryDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Delivered on {new Date(dispatch.deliveryDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Information</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Recipient</p>
                  <p className="text-gray-800">{dispatch.recipientName}</p>
                  <p className="text-gray-600">{dispatch.recipientPhone}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
                  <div className="text-gray-800">
                    <p>{dispatch.deliveryAddress}</p>
                    {dispatch.deliveryCity && (
                      <p>{dispatch.deliveryCity}, {dispatch.deliveryState} {dispatch.deliveryZipCode}</p>
                    )}
                  </div>
                </div>

                {dispatch.estimatedDeliveryDate && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Estimated Delivery</p>
                    <p className="text-gray-800">{new Date(dispatch.estimatedDeliveryDate).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Updates */}
            {dispatch.updates && dispatch.updates.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Tracking Updates</h2>

                <div className="space-y-4">
                  {dispatch.updates.map((update, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        {index < dispatch.updates.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-semibold text-gray-800">{update.status}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(update.timestamp).toLocaleString('en-IN')}
                        </p>
                        {update.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {update.location}
                          </p>
                        )}
                        {update.notes && (
                          <p className="text-sm text-gray-700 mt-2">{update.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            {dispatch.items && dispatch.items.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Items in Shipment</h2>

                <div className="space-y-2">
                  {dispatch.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.productId}</p>
                      </div>
                      <p className="text-gray-800 font-semibold">{item.quantity} {item.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dispatch.failureReason && (
              <div className="card p-6 border-l-4 border-red-500 bg-red-50">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Delivery Issue</h2>
                <p className="text-red-700">{dispatch.failureReason}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrackingPage;
