export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CheckoutFormValues {
  customerInfo: CustomerInfo;
  shippingAddress: CheckoutShippingAddress;
  paymentMethod: PaymentMethod;
}
