import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Send, Printer, ArrowLeft, Check } from 'lucide-react';
import { getInvoiceById, sendInvoice, markInvoiceAsPaid } from '../api/invoiceAPI';
import toast from 'react-hot-toast';

const InvoiceViewPage = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const result = await getInvoiceById(invoiceId);
      if (result.success) {
        setInvoice(result.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = async () => {
    try {
      const result = await sendInvoice(invoice._id);
      if (result.success) {
        toast.success('Invoice sent successfully');
        fetchInvoice();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send invoice');
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      const result = await markInvoiceAsPaid(invoice._id);
      if (result.success) {
        toast.success('Invoice marked as paid');
        fetchInvoice();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to mark as paid');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-8">Invoice not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toolbar */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between">
          <a href="/invoices" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft size={20} />
            Back to Invoices
          </a>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Printer size={18} />
              Print
            </button>
            {invoice.status === 'Draft' && (
              <button
                onClick={handleSend}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Send size={18} />
                Send
              </button>
            )}
            {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
              <button
                onClick={handleMarkAsPaid}
                className="btn btn-primary flex items-center gap-2"
              >
                <Check size={18} />
                Mark Paid
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-12 print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{invoice.businessName}</h1>
              <p className="text-gray-600">{invoice.businessAddress}</p>
              <p className="text-gray-600">{invoice.businessPhone}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-gray-600 font-mono">{invoice.invoiceId}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Customer & Details */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill To</h3>
              <p className="font-semibold text-gray-800">{invoice.customerName}</p>
              <p className="text-gray-600">{invoice.customerAddress}</p>
              <p className="text-gray-600">{invoice.customerPhone}</p>
              <p className="text-gray-600">{invoice.customerEmail}</p>
              {invoice.customerGST && <p className="text-sm text-gray-500">GST: {invoice.customerGST}</p>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Invoice Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice #:</span>
                  <span className="font-mono text-gray-800">{invoice.invoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-800">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="text-gray-800">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Order #:</span>
                  <span className="text-gray-800">{invoice.order?.orderId || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 text-gray-800">Description</th>
                  <th className="text-right py-2 text-gray-800 w-20">Qty</th>
                  <th className="text-right py-2 text-gray-800 w-24">Rate</th>
                  <th className="text-right py-2 text-gray-800 w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 text-gray-800">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-gray-600 text-xs">{item.productId}</p>
                    </td>
                    <td className="text-right py-3 text-gray-800">{item.quantity}</td>
                    <td className="text-right py-3 text-gray-800">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="text-right py-3 text-gray-800">₹{item.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-800">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">
                    Discount {invoice.discountType === 'Percentage' ? `(${invoice.discount}%)` : ''}:
                  </span>
                  <span className="text-red-600">-₹{invoice.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Tax/GST:</span>
                  <span className="text-gray-800">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {invoice.shippingCharges > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Shipping:</span>
                  <span className="text-gray-800">₹{invoice.shippingCharges.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-gray-800 text-white px-3 mt-2">
                <span className="font-semibold">Total:</span>
                <span className="font-bold">₹{invoice.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8 p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-semibold">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  invoice.status === 'Paid'
                    ? 'bg-green-100 text-green-800'
                    : invoice.status === 'Draft'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
              <p className="text-gray-600 text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Terms */}
          {invoice.terms && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Terms & Conditions</h4>
              <p className="text-gray-600 text-sm">{invoice.terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewPage;
