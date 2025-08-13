import React from 'react';
import { CheckCircle, X, Copy, Package } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  totalAmount: number;
  estimatedDelivery?: string;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  totalAmount,
  estimatedDelivery = '5-7 business days'
}) => {
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    // You could add a toast notification here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Order Confirmed!
                </h3>
                <p className="text-sm text-gray-500">
                  Your order has been successfully placed
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            {/* Order Number */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Order Number</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{orderNumber}</p>
                </div>
                <button
                  onClick={copyOrderNumber}
                  className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </button>
              </div>
            </div>

            {/* Order Amount */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Total Amount</span>
              <span className="text-lg font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
            </div>

            {/* Delivery Info */}
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
                <p className="text-sm text-blue-700">{estimatedDelivery}</p>
              </div>
            </div>

            {/* What's Next */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">What's next?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You'll receive an email confirmation shortly</li>
                <li>• Artisans will prepare your items</li>
                <li>• You'll get tracking details once shipped</li>
                <li>• Save your order number for reference</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                // Navigate to orders page or user dashboard
                window.location.href = '/orders';
              }}
              className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
