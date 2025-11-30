const mongoose = require('mongoose');

/**
 * Notification Schema
 * Stores admin and system notifications
 */
const notificationSchema = new mongoose.Schema({
  // Target user (null for system-wide notifications to admins)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'info',
      'success', 
      'warning',
      'error',
      'order',
      'user',
      'system',
      'security',
      'payment',
      'agent'
    ],
    default: 'info'
  },
  
  // Title of the notification
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  // Detailed message
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Related entity (for linking)
  relatedEntity: {
    type: {
      type: String,
      enum: ['order', 'user', 'product', 'agent', 'payment', null]
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    },
    displayId: String // Order number, user name, etc.
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date,
    default: null
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // For admin notifications
  isAdminNotification: {
    type: Boolean,
    default: true
  },
  
  // Action URL (for clickable notifications)
  actionUrl: {
    type: String,
    default: null
  },
  
  // Expiry (auto-delete after this date)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ isAdminNotification: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to create notifications
notificationSchema.statics.createNotification = async function(data) {
  return this.create(data);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId = null, isAdmin = false) {
  const query = isAdmin 
    ? { isAdminNotification: true, isRead: false }
    : { userId, isRead: false };
  return this.countDocuments(query);
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(notificationId) {
  return this.findByIdAndUpdate(
    notificationId,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId = null, isAdmin = false) {
  const query = isAdmin 
    ? { isAdminNotification: true, isRead: false }
    : { userId, isRead: false };
  return this.updateMany(query, { isRead: true, readAt: new Date() });
};

// Static method to get admin notifications with pagination
notificationSchema.statics.getAdminNotifications = async function(options = {}) {
  const { page = 1, limit = 20, unreadOnly = false, type } = options;
  
  const query = { isAdminNotification: true };
  if (unreadOnly) query.isRead = false;
  if (type && type !== 'all') query.type = type;
  
  const notifications = await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
    
  const total = await this.countDocuments(query);
  const unreadCount = await this.countDocuments({ ...query, isRead: false });
  
  return {
    notifications,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    },
    unreadCount
  };
};

module.exports = mongoose.model('Notification', notificationSchema);
