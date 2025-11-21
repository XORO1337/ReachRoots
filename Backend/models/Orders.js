const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artisanId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  customerInfo: {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    postalCode: { 
      type: String, 
      required: true, 
      trim: true,
      validate: {
        validator: function(value) {
          // Ensure exactly 6 digits, no more, no less
          return /^\d{6}$/.test(value) && value.length === 6;
        },
        message: 'Postal code must be exactly 6 digits'
      },
      minlength: [6, 'Postal code must be exactly 6 digits'],
      maxlength: [6, 'Postal code must be exactly 6 digits']
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'upi', 'card', 'netbanking', 'wallet'],
    default: 'cod'
  },
  paymentDetails: {
    gateway: { type: String, trim: true },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String, trim: true },
    status: { type: String, trim: true },
    method: { type: String, trim: true },
    preferredMethod: { type: String, trim: true },
    amountPaid: Number,
    currency: { type: String, trim: true },
    wallet: { type: String, trim: true },
    bank: { type: String, trim: true },
    email: { type: String, trim: true },
    contact: { type: String, trim: true },
    upiId: { type: String, trim: true },
    failureReason: { type: String, trim: true },
    capturedAt: Date
  },
  trackingNumber: {
    type: String,
    trim: true,
    sparse: true // Allow multiple null values but unique non-null values
  },
  estimatedDelivery: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);