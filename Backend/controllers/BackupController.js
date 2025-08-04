const MongoBackupService = require('../services/mongoBackupService');

class BackupController {
    constructor() {
        this.backupService = new MongoBackupService();
    }

    // Get backup status and history
    async getBackupStatus(req, res) {
        try {
            const status = this.backupService.getBackupStatus();
            
            res.json({
                success: true,
                message: 'Backup status retrieved successfully',
                data: status
            });
        } catch (error) {
            console.error('Get backup status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve backup status',
                error: error.message
            });
        }
    }

    // Trigger manual backup
    async createManualBackup(req, res) {
        try {
            const result = await this.backupService.manualBackup();
            
            res.json({
                success: true,
                message: 'Manual backup completed successfully',
                data: result
            });
        } catch (error) {
            console.error('Manual backup error:', error);
            res.status(500).json({
                success: false,
                message: 'Manual backup failed',
                error: error.message
            });
        }
    }

    // Import specific backup to local
    async importBackupToLocal(req, res) {
        try {
            const { backupPath, databaseName } = req.body;

            if (!backupPath || !databaseName) {
                return res.status(400).json({
                    success: false,
                    message: 'Backup path and database name are required'
                });
            }

            const result = await this.backupService.importToLocal(backupPath, databaseName);
            
            res.json({
                success: true,
                message: 'Backup imported to local MongoDB successfully',
                data: result
            });
        } catch (error) {
            console.error('Import backup error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to import backup to local MongoDB',
                error: error.message
            });
        }
    }

    // Clean old backups
    async cleanOldBackups(req, res) {
        try {
            const { keepCount } = req.body;
            const count = keepCount ? parseInt(keepCount) : 5;

            const result = this.backupService.cleanOldBackups(count);
            
            res.json({
                success: true,
                message: 'Old backups cleaned successfully',
                data: result
            });
        } catch (error) {
            console.error('Clean backups error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clean old backups',
                error: error.message
            });
        }
    }

    // Test database connections
    async testConnections(req, res) {
        try {
            const { getConnections } = require('../db/connect');
            const connections = getConnections();

            const status = {
                atlas: {
                    connected: connections.atlas ? connections.atlas.readyState === 1 : false,
                    host: connections.atlas ? connections.atlas.host : null
                },
                local: {
                    connected: connections.local ? connections.local.readyState === 1 : false,
                    host: connections.local ? connections.local.host : null
                }
            };

            res.json({
                success: true,
                message: 'Database connection status retrieved',
                data: status
            });
        } catch (error) {
            console.error('Test connections error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to test database connections',
                error: error.message
            });
        }
    }
}

module.exports = new BackupController();
