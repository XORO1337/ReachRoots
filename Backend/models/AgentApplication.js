const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Agent Application Model
 * Stores delivery agent applications before approval
 * Once approved, a User document is created with role 'shipping_agent'
 */

const agentApplicationSchema = new Schema({
  // Application tracking
  applicationId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'more_info_required'],
    default: 'pending'
  },
  
  // Personal Information
  personalInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    address: {
      street: String,
      city: {
        type: String,
        required: true
      },
      district: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pinCode: {
        type: String,
        required: true
      }
    },
    profilePhoto: {
      url: String,
      publicId: String // ImageKit file ID for deletion
    }
  },
  
  // Vehicle Details
  vehicleDetails: {
    vehicleType: {
      type: String,
      enum: ['bike', 'scooter', 'car', 'van', 'truck'],
      required: true
    },
    vehicleRegistrationNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    insuranceValidUntil: {
      type: Date,
      required: true
    }
  },
  
  // Document Uploads
  documents: {
    driverLicenseFront: {
      url: String,
      publicId: String,
      verified: { type: Boolean, default: false }
    },
    driverLicenseBack: {
      url: String,
      publicId: String,
      verified: { type: Boolean, default: false }
    },
    vehicleRegistrationCertificate: {
      url: String,
      publicId: String,
      verified: { type: Boolean, default: false }
    },
    vehicleInsurance: {
      url: String,
      publicId: String,
      verified: { type: Boolean, default: false }
    },
    addressProof: {
      url: String,
      publicId: String,
      type: { 
        type: String, 
        enum: ['aadhaar', 'passport', 'utility_bill', 'voter_id'] 
      },
      verified: { type: Boolean, default: false }
    }
  },
  
  // Bank Account Details
  bankDetails: {
    accountHolderName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    upiId: {
      type: String,
      trim: true
    }
  },
  
  // Availability Preferences
  availability: {
    preferredAreas: [{
      city: String,
      district: String,
      pinCodes: [String]
    }],
    availableDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    availableTimeSlots: [{
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'] // 6am-12pm, 12pm-6pm, 6pm-10pm, 10pm-6am
    }]
  },
  
  // Terms acceptance
  termsAccepted: {
    type: Boolean,
    required: true,
    default: false
  },
  termsAcceptedAt: Date,
  
  // Admin review
  review: {
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    notes: String,
    rejectionReason: String,
    additionalInfoRequested: String
  },
  
  // If approved, link to created user
  approvedUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // IP and device tracking for fraud prevention
  submissionMeta: {
    ipAddress: String,
    userAgent: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Generate unique application ID
agentApplicationSchema.pre('save', async function(next) {
  if (this.isNew && !this.applicationId) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const sequence = (count + 1).toString().padStart(5, '0');
    this.applicationId = `AGT${year}${month}${sequence}`;
  }
  next();
});

// Indexes for efficient queries
agentApplicationSchema.index({ status: 1 });
agentApplicationSchema.index({ 'personalInfo.email': 1 });
agentApplicationSchema.index({ 'personalInfo.phone': 1 });
agentApplicationSchema.index({ applicationId: 1 });
agentApplicationSchema.index({ createdAt: -1 });
agentApplicationSchema.index({ 'review.reviewedAt': -1 });

// Virtual for age calculation
agentApplicationSchema.virtual('age').get(function() {
  if (!this.personalInfo?.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Method to check if applicant meets age requirement
agentApplicationSchema.methods.meetsAgeRequirement = function(minAge = 18) {
  return this.age >= minAge;
};

// Method to check if all documents are uploaded
agentApplicationSchema.methods.hasAllDocuments = function() {
  const docs = this.documents;
  return !!(
    docs.driverLicenseFront?.url &&
    docs.driverLicenseBack?.url &&
    docs.vehicleRegistrationCertificate?.url &&
    docs.vehicleInsurance?.url &&
    docs.addressProof?.url
  );
};

// Method to check if vehicle insurance is valid
agentApplicationSchema.methods.hasValidInsurance = function() {
  if (!this.vehicleDetails?.insuranceValidUntil) return false;
  return new Date(this.vehicleDetails.insuranceValidUntil) > new Date();
};

// Static method to get pending applications count
agentApplicationSchema.statics.getPendingCount = async function() {
  return this.countDocuments({ status: { $in: ['pending', 'under_review'] } });
};

// Transform for JSON output (hide sensitive data)
agentApplicationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Mask bank account number in responses
    if (ret.bankDetails?.accountNumber) {
      const accNum = ret.bankDetails.accountNumber;
      ret.bankDetails.accountNumberMasked = 'XXXX' + accNum.slice(-4);
    }
    delete ret.__v;
    return ret;
  }
});

const AgentApplication = mongoose.model('AgentApplication', agentApplicationSchema);

module.exports = AgentApplication;
