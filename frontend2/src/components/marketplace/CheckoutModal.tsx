import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CartItem } from '../../types';
import { X, MapPin, User, CreditCard, Wallet, QrCode, Banknote, Package, AlertCircle } from 'lucide-react';
import { formatWeightUnit } from '../../utils/formatters';
import { CheckoutFormValues, PaymentMethod } from '../../types/payment';
import PaymentService, { PaymentAvailability } from '../../services/paymentService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  onSubmit: (payload: CheckoutFormValues) => Promise<void>;
  isProcessing: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  deliveryFee,
  totalAmount,
  onSubmit,
  isProcessing
}) => {
  const { t } = useTranslation();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentAvailability, setPaymentAvailability] = useState<PaymentAvailability | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Check payment availability when modal opens
  useEffect(() => {
    if (isOpen) {
      PaymentService.checkAvailability().then(availability => {
        setPaymentAvailability(availability);
        // Default to COD if online payments not available
        if (!availability.onlinePaymentsAvailable && paymentMethod !== 'cod') {
          setPaymentMethod('cod');
        }
      });
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Customer info validation
    if (!customerInfo.name.trim()) newErrors.name = t('validation.nameRequired');
    if (!customerInfo.email.trim()) newErrors.email = t('validation.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) newErrors.email = t('validation.emailInvalid');
    if (!customerInfo.phone.trim()) newErrors.phone = t('validation.phoneRequired');
    else {
      // Remove spaces, dashes, parentheses for validation (backend expects digits only)
      const cleanPhone = customerInfo.phone.replace(/[\s\-()]/g, '');
      if (!/^\+?\d{10,15}$/.test(cleanPhone)) newErrors.phone = t('validation.phoneInvalid');
    }

    // Shipping address validation
    if (!shippingAddress.street.trim()) newErrors.street = t('checkout.streetRequired');
    if (!shippingAddress.city.trim()) newErrors.city = t('checkout.cityRequired');
    if (!shippingAddress.state.trim()) newErrors.state = t('checkout.stateRequired');
    if (!shippingAddress.postalCode.trim()) newErrors.postalCode = t('checkout.postalCodeRequired');
    else if (!/^\d{6}$/.test(shippingAddress.postalCode.trim())) newErrors.postalCode = t('checkout.postalCodeInvalid');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Clean phone number - remove spaces, dashes, parentheses for backend
      const cleanedCustomerInfo = {
        ...customerInfo,
        phone: customerInfo.phone.replace(/[\s\-()]/g, '')
      };
      
      await onSubmit({
        shippingAddress,
        customerInfo: cleanedCustomerInfo,
        paymentMethod
      });
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const allPaymentOptions: Array<{
    id: PaymentMethod;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'upi',
      label: t('payment.upi'),
      description: t('payment.upiDesc'),
      icon: <QrCode className="h-5 w-5" />
    },
    {
      id: 'card',
      label: t('payment.card'),
      description: t('payment.cardDesc'),
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: 'netbanking',
      label: t('payment.netbanking'),
      description: t('payment.netbankingDesc'),
      icon: <Banknote className="h-5 w-5" />
    },
    {
      id: 'wallet',
      label: t('payment.wallet'),
      description: t('payment.walletDesc'),
      icon: <Wallet className="h-5 w-5" />
    },
    {
      id: 'cod',
      label: t('payment.cod'),
      description: t('payment.codDesc'),
      icon: <Package className="h-5 w-5" />
    }
  ];

  // Filter payment options based on availability
  const paymentOptions = paymentAvailability 
    ? allPaymentOptions.filter(opt => paymentAvailability.availableMethods.includes(opt.id))
    : allPaymentOptions.filter(opt => opt.id === 'cod'); // Default to COD only while loading

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              {t('checkout.title')}
            </h3>
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Forms */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {t('checkout.customerInfo')}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkout.fullName')} *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('checkout.enterFullName')}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkout.emailAddress')} *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('checkout.enterEmail')}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkout.phoneNumber')} *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('checkout.enterPhone')}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {t('checkout.shippingAddress')}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkout.streetAddress')} *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                          errors.street ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('checkout.enterStreet')}
                      />
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkout.city')} *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={t('checkout.city')}
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkout.state')} *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                            errors.state ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={t('checkout.state')}
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkout.postalCode')} *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.postalCode}
                          onChange={(e) => {
                            // Only allow digits and limit to 6 characters
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setShippingAddress({ ...shippingAddress, postalCode: value });
                          }}
                          maxLength={6}
                          pattern="\d{6}"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                            errors.postalCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={t('checkout.enterPostalCode')}
                        />
                        {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkout.country')}
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          placeholder={t('checkout.country')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  {t('checkout.orderSummary')}
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h5>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × ₹{item.product.price}/{formatWeightUnit(item.product.weightUnit)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{t('cart.subtotal')}</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={deliveryFee === 0 ? 'text-green-600' : 'text-gray-600'}>
                        {t('delivery.deliveryFee')}
                      </span>
                      <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        {deliveryFee === 0 ? t('delivery.free') : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">{t('cart.total')}</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {t('checkout.paymentInfo')}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {t('checkout.paymentSupport')}
                    </p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {t('checkout.paymentOptions')}
                  </h4>
                  <div className="space-y-3">
                    {paymentOptions.map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setPaymentMethod(option.id)}
                        disabled={isProcessing}
                        className={`w-full border rounded-lg p-4 text-left transition-colors flex items-start space-x-3 ${
                          paymentMethod === option.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-200'
                        } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className={`p-2 rounded-full ${paymentMethod === option.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                          {option.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 flex items-center">
                            {option.label}
                            {option.id === paymentMethod && (
                              <span className="ml-2 text-xs text-orange-600 font-medium">{t('payment.selected')}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? t('checkout.processingOrder') : t('checkout.placeOrder')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
