const express = require('express');
const router = express.Router();
const BackupController = require('../controllers/BackupController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Admin middleware to ensure only admins can access backup routes
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
};

// Get backup status and history
router.get('/status', authenticateToken, authorizeRoles('admin'), BackupController.getBackupStatus);

// Create manual backup
router.post('/create', authenticateToken, authorizeRoles('admin'), BackupController.createManualBackup);

// Import backup to local MongoDB
router.post('/import', authenticateToken, authorizeRoles('admin'), BackupController.importBackupToLocal);

// Clean old backups
router.post('/clean', authenticateToken, authorizeRoles('admin'), BackupController.cleanOldBackups);

// Test database connections
router.get('/test-connections', authenticateToken, authorizeRoles('admin'), BackupController.testConnections);

module.exports = router;
