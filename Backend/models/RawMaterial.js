const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rawMaterialOrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  artisanId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    rawMaterialId: {
      type: Schema.Types.ObjectId,
      ref: 'RawMaterial',
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RawMaterialOrder', rawMaterialOrderSchema);