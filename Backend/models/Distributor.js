const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const distributorSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  distributionAreas: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Distributor', distributorSchema);