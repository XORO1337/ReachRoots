const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artisanProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: [String],
    default: []
  },
  bankDetails: {
    accountNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    ifscCode: { type: String, trim: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ArtisanProfile', artisanProfileSchema);