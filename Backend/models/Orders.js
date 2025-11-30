const mongoose = require('mongoose');
const Schema = mongoose.Schema;

<<<<<<< HEAD
=======
// Status history sub-schema for tracking all status changes
const statusHistorySchema = new Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedByRole: {
    type: String,
    enum: ['artisan', 'distributor', 'admin', 'system']
  },
  note: {
    type: String,
    trim: true
  }
}, { _id: true });

>>>>>>> fixed-repo/main
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
<<<<<<< HEAD
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
=======
    enum: ['pending', 'received', 'packed', 'pickup_requested', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Status history for complete audit trail
  statusHistory: [statusHistorySchema],
  // Track when status was last changed (for 15-minute modification window)
  lastStatusChangeAt: {
    type: Date
  },
  // Shipping method choice
  shippingMethod: {
    type: String,
    enum: ['pickup_agent', 'self_ship', null],
    default: null
  },
  // Extended shipping details
  shippingDetails: {
    carrier: {
      type: String,
      trim: true
    },
    trackingNumber: {
      type: String,
      trim: true
    },
    proofOfShipping: {
      type: String, // URL to uploaded image
      trim: true
    },
    shippedAt: Date,
    // Pickup agent specific
    pickupRequestedAt: Date,
    pickupScheduledAt: Date,
    pickupAgentName: String,
    pickupAgentPhone: String,
    pickupConfirmedAt: Date,
    // Agent assignment fields
    assignedAgentId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    agentAssignedAt: Date,
    agentAssignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    assignmentNote: String,
    agentAcceptedAt: Date,
    agentAccepted: Boolean,
    agentCommission: Number,
    // Pickup and delivery tracking
    pickedUpAt: Date,
    pickedUpBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    pickupProofImage: String,
    deliveredAt: Date,
    deliveredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveryProofImage: String,
    deliverySignature: String,
    // Broadcast info for agent opportunities
    broadcastInfo: {
      broadcastedAt: Date,
      broadcastedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      broadcastNote: String,
      targetedAgentIds: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      interestedAgents: [{
        agentId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        agentName: String,
        agentPhone: String,
        agentRating: Number,
        interestedAt: Date
      }]
    }
  },
>>>>>>> fixed-repo/main
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