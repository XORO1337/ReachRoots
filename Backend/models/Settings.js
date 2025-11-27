const mongoose = require('mongoose');

/**
 * Settings Schema
 * Stores platform-wide admin settings
 */
const settingsSchema = new mongoose.Schema({
  // Unique identifier for settings document (singleton pattern)
  key: {
    type: String,
    default: 'platform_settings',
    unique: true
  },
  
  // General Settings
  general: {
    siteName: {
      type: String,
      default: 'RootsNReach'
    },
    adminEmail: {
      type: String,
      default: 'admin@rootsnreach.com'
    },
    supportEmail: {
      type: String,
      default: 'support@rootsnreach.com'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: {
      type: String,
      default: 'We are currently undergoing maintenance. Please check back soon.'
    }
  },
  
  // Security Settings
  security: {
    sessionTimeout: {
      type: Number,
      default: 30, // minutes
      min: 5,
      max: 1440
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 20
    },
    lockoutDuration: {
      type: Number,
      default: 15, // minutes
      min: 5,
      max: 60
    },
    requireTwoFactor: {
      type: Boolean,
      default: false
    },
    passwordMinLength: {
      type: Number,
      default: 8,
      min: 6,
      max: 32
    }
  },
  
  // System Settings
  system: {
    backupFrequency: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    lastBackup: {
      type: Date,
      default: null
    },
    lastSystemCheck: {
      type: Date,
      default: null
    },
    systemCheckStatus: {
      type: String,
      enum: ['healthy', 'warning', 'critical', 'unknown'],
      default: 'unknown'
    },
    logRetentionDays: {
      type: Number,
      default: 30,
      min: 7,
      max: 365
    },
    enableDebugMode: {
      type: Boolean,
      default: false
    }
  },
  
  // Notification Settings
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    orderNotifications: {
      type: Boolean,
      default: true
    },
    userRegistrationNotifications: {
      type: Boolean,
      default: true
    },
    securityAlerts: {
      type: Boolean,
      default: true
    },
    dailyReports: {
      type: Boolean,
      default: false
    },
    weeklyReports: {
      type: Boolean,
      default: true
    }
  },
  
  // Order Settings
  orders: {
    autoConfirmPayment: {
      type: Boolean,
      default: false
    },
    requireAddressVerification: {
      type: Boolean,
      default: false
    },
    defaultShippingMethod: {
      type: String,
      default: 'standard'
    },
    maxOrderValue: {
      type: Number,
      default: 100000 // INR
    },
    minOrderValue: {
      type: Number,
      default: 100 // INR
    }
  },
  
  // Agent Settings
  agents: {
    defaultCommissionRate: {
      type: Number,
      default: 5, // percentage
      min: 0,
      max: 50
    },
    baseDeliveryFee: {
      type: Number,
      default: 30 // INR
    },
    autoAssignAgents: {
      type: Boolean,
      default: false
    },
    maxActiveDeliveries: {
      type: Number,
      default: 10
    }
  },
  
  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ key: 'platform_settings' });
  if (!settings) {
    settings = await this.create({ key: 'platform_settings' });
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates, updatedBy) {
  const settings = await this.findOneAndUpdate(
    { key: 'platform_settings' },
    { 
      ...updates, 
      lastUpdatedBy: updatedBy,
      lastUpdatedAt: new Date()
    },
    { 
      new: true, 
      upsert: true,
      runValidators: true
    }
  );
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
