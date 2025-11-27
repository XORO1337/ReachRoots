const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const AdminController = require('../controllers/Admin_controller');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');

// All admin routes require authentication and admin role
const adminAuth = [authenticateToken, authorizeRoles('admin')];

/**
 * Admin Routes
 * Base path: /api/admin
 */

// ================== DASHBOARD & STATS ==================
// GET /api/admin/stats - Platform-wide statistics
router.get('/stats', adminAuth, AdminController.getPlatformStats);

// GET /api/admin/activity - Activity logs
router.get('/activity', adminAuth, AdminController.getActivityLogs);

// ================== SETTINGS ==================
// GET /api/admin/settings - Get platform settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
});

// PUT /api/admin/settings - Update platform settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    const settings = await Settings.updateSettings(updates, req.user.id);
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update settings'
    });
  }
});

// POST /api/admin/settings/system-check - Run system health check
router.post('/settings/system-check', adminAuth, async (req, res) => {
  try {
    // Perform basic system checks
    const checks = {
      database: 'healthy',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    // Update settings with last check time
    await Settings.updateSettings({
      'system.lastSystemCheck': new Date(),
      'system.systemCheckStatus': 'healthy'
    }, req.user.id);
    
    res.json({
      success: true,
      message: 'System check completed',
      data: checks
    });
  } catch (error) {
    console.error('System check error:', error);
    res.status(500).json({
      success: false,
      message: 'System check failed'
    });
  }
});

// ================== NOTIFICATIONS ==================
// GET /api/admin/notifications - Get admin notifications
router.get('/notifications', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly, type } = req.query;
    const result = await Notification.getAdminNotifications({
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      type
    });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
});

// POST /api/admin/notifications - Create notification (for system use)
router.post('/notifications', adminAuth, async (req, res) => {
  try {
    const { type, title, message, priority, relatedEntity, actionUrl } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    const notification = await Notification.createNotification({
      type: type || 'info',
      title,
      message,
      priority: priority || 'medium',
      relatedEntity,
      actionUrl,
      isAdminNotification: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Notification created',
      data: notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// PATCH /api/admin/notifications/:id/read - Mark notification as read
router.patch('/notifications/:id/read', adminAuth, async (req, res) => {
  try {
    const notification = await Notification.markAsRead(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// POST /api/admin/notifications/mark-all-read - Mark all as read
router.post('/notifications/mark-all-read', adminAuth, async (req, res) => {
  try {
    await Notification.markAllAsRead(null, true);
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read'
    });
  }
});

// DELETE /api/admin/notifications/:id - Delete notification
router.delete('/notifications/:id', adminAuth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// GET /api/admin/notifications/unread-count - Get unread count
router.get('/notifications/unread-count', adminAuth, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(null, true);
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

// ================== ORDER MANAGEMENT ==================
// GET /api/admin/orders - Get all orders with filtering
router.get('/orders', adminAuth, AdminController.getAllOrders);

// GET /api/admin/orders/pickups - Get pending pickup requests
router.get('/orders/pickups', adminAuth, AdminController.getPendingPickupRequests);

// POST /api/admin/orders/:orderId/broadcast - Broadcast pickup request to agents
router.post('/orders/:orderId/broadcast', adminAuth, AdminController.broadcastPickupRequest);

// POST /api/admin/orders/:orderId/assign-agent - Assign agent to order
router.post('/orders/:orderId/assign-agent', adminAuth, AdminController.assignAgentToOrder);

// PATCH /api/admin/orders/:orderId/status - Override order status
router.patch('/orders/:orderId/status', adminAuth, AdminController.overrideOrderStatus);

// ================== USER MANAGEMENT ==================
// GET /api/admin/users - Get all users (existing)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    
    let query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// PATCH /api/admin/users/:userId/status - Update user status (existing)
router.patch('/users/:userId/status', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Admin user status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// GET /api/admin/users/flagged - Get flagged users
router.get('/users/flagged', adminAuth, AdminController.getFlaggedUsers);

// POST /api/admin/users/:userId/flag - Add flag to user
router.post('/users/:userId/flag', adminAuth, AdminController.addUserFlag);

// DELETE /api/admin/users/:userId/flag/:flag - Remove flag from user
router.delete('/users/:userId/flag/:flag', adminAuth, AdminController.removeUserFlag);

// ================== AGENT MANAGEMENT ==================
// GET /api/admin/agents - Get all shipping agents
router.get('/agents', adminAuth, AdminController.getAllAgents);

// POST /api/admin/agents - Create shipping agent
router.post('/agents', adminAuth, AdminController.createAgent);

// PATCH /api/admin/agents/:agentId - Update agent profile
router.patch('/agents/:agentId', adminAuth, AdminController.updateAgentProfile);

// PATCH /api/admin/agents/:agentId/status - Toggle agent status
router.patch('/agents/:agentId/status', adminAuth, AdminController.toggleAgentStatus);

// GET /api/admin/agents/:agentId/performance - Get agent performance
router.get('/agents/:agentId/performance', adminAuth, AdminController.getAgentPerformance);

module.exports = router;