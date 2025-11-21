import React, { useState } from 'react';
import { CartItem } from '../../types';
import { X, Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import { formatWeightUnit } from '../../utils/formatters';
import OrderService, { Order } from '../../services/orderService';
import CheckoutModal from './CheckoutModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import toast from 'react-hot-toast';
import PaymentService from '../../services/paymentService';
import { loadScript } from '../../utils/loadScript';
import { CheckoutFormValues } from '../../types/payment';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  const handleOrderSubmit = async (checkoutData: CheckoutFormValues) => {
    let createdOrder: Order | null = null;
    try {
      setIsCheckingOut(true);
      
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
          // Remove artisanId - backend will fetch from product
        })),
        shippingAddress: checkoutData.shippingAddress,
        customerInfo: checkoutData.customerInfo,
        paymentMethod: checkoutData.paymentMethod,
        totalAmount: total
      };

      // Create order
      createdOrder = await OrderService.createOrder(orderData);
      if (!createdOrder) {
        throw new Error('Unable to create order. Please try again.');
      }

      const finalizeSuccess = (message: string) => {
        if (!createdOrder) return;
        setOrderNumber(createdOrder.orderNumber);
        setShowCheckoutModal(false);
        setShowConfirmationModal(true);
        items.forEach(item => onRemoveItem(item.product.id));
        toast.success(message);
      };

      if (checkoutData.paymentMethod === 'cod') {
        finalizeSuccess('Order placed with Cash on Delivery.');
        return;
      }

      const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout. Please check your connection and try again.');
      }

      const paymentConfig = await PaymentService.createRazorpayOrder({
        orderId: createdOrder._id,
        paymentMethod: checkoutData.paymentMethod
      });

      const paymentResponse = await new Promise<RazorpaySuccessResponse>((resolve, reject) => {
        const options = {
          key: paymentConfig.key,
          amount: paymentConfig.amount,
          currency: paymentConfig.currency,
          name: paymentConfig.name,
          description: paymentConfig.description,
          order_id: paymentConfig.razorpayOrderId,
          prefill: {
            name: checkoutData.customerInfo.name,
            email: checkoutData.customerInfo.email,
            contact: checkoutData.customerInfo.phone
          },
          notes: {
            rrOrderId: paymentConfig.orderId,
            paymentMethod: checkoutData.paymentMethod
          },
          theme: { color: '#EA580C' },
          method: { upi: true, card: true, netbanking: true, wallet: true },
          handler: (response: RazorpaySuccessResponse) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled'))
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (event: any) => {
          reject(new Error(event?.error?.description || 'Payment failed. Please try again.'));
        });
        razorpay.open();
      });

      await PaymentService.verifyRazorpayPayment({
        orderId: createdOrder._id,
        ...paymentResponse
      });

      finalizeSuccess('Payment successful! Your order is confirmed.');
    } catch (error) {
      console.error('Order creation failed:', error);
      const message = (error as Error)?.message || 'Failed to place order. Please try again.';
      if (createdOrder && checkoutData.paymentMethod !== 'cod') {
        await PaymentService.markPaymentFailed({
          orderId: createdOrder._id,
          reason: message
        });
      }
      toast.error(message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Cart Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Shopping Cart ({itemCount})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
                <button
                  onClick={onClose}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        by {item.product.seller.name}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{item.product.price.toLocaleString()}/{formatWeightUnit(item.product.weightUnit)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              {/* Shipping Info */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>Free shipping on orders over ₹2,000</span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                🔒 Secure checkout - No registration required
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        items={items}
        totalAmount={total}
        onSubmit={handleOrderSubmit}
        isProcessing={isCheckingOut}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          onClose();
        }}
        orderNumber={orderNumber}
        totalAmount={total}
      />
    </div>
  );
};

export default Cart;