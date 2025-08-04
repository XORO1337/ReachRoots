const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rawMaterialSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);