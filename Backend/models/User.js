const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  houseNo: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  pinCode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(value) {
        // Ensure exactly 6 digits, no more, no less
        return /^\d{6}$/.test(value) && value.length === 6;
      },
      message: 'Pin code must be exactly 6 digits'
    },
    minlength: [6, 'Pin code must be exactly 6 digits'],
    maxlength: [6, 'Pin code must be exactly 6 digits']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(password) {
        // Only validate if password is being set/changed
        if (!password) return true;
        // Check for at least one uppercase, one lowercase, one number, and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^[+]?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['customer', 'artisan', 'distributor', 'admin'],
    required: true,
    default: 'customer'
  },
  addresses: [addressSchema],
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    sparse: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isIdentityVerified: {
    type: Boolean,
    default: false
  },
  // Aadhaar verification data
  aadhaarVerification: {
    aadhaarHash: {
      type: String,
      sparse: true // Only set for verified users
    },
    maskedAadhaar: {
      type: String // For display purposes: XXXX XXXX 1234
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    },
    verifiedAt: Date,
    aadhaarData: {
      name: String,
      dateOfBirth: String,
      gender: String,
      address: {
        house: String,
        street: String,
        location: String,
        vtc: String,
        district: String,
        state: String,
        pincode: String
      }
    },
    transactionId: String, // For OTP verification
    verificationAttempts: {
      type: Number,
      default: 0
    },
    lastAttemptAt: Date
  },
  // Legacy document verification (kept for backward compatibility)
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['aadhaar', 'license', 'pan'],
      required: true
    },
    documentUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    reviewNotes: String
  }],
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    }
  }],
  otpCode: String,
  otpExpires: Date,
  otpAttempts: {
    type: Number,
    default: 0
  },
  lastOtpSentAt: Date,
  otpResendCount: {
    type: Number,
    default: 0
  },
  lastResendDate: Date,
  // Enhanced OTP tracking fields
  otpSendCount: {
    type: Number,
    default: 0
  },
  lastOtpSentDate: Date,
  otpLockUntil: Date,
  phoneVerifiedAt: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ googleId: 1 });

// Virtual for account locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1,
      },
      $set: {
        loginAttempts: 1,
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we're past 5 attempts and not locked yet, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000, // lock for 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

module.exports = mongoose.model('User', userSchema);