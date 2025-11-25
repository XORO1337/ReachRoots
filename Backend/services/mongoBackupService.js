const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { getConnection } = require('../db/connect');

class MongoBackupService {
    constructor() {
        this.backupPath = process.env.BACKUP_PATH || './backups';
        this.backupEnabled = process.env.BACKUP_ENABLED === 'true';
        this.backupInterval = parseInt(process.env.BACKUP_INTERVAL_HOURS) || 6;
        this.autoImport = process.env.AUTO_IMPORT_TO_LOCAL === 'true';
        
        // Ensure backup directory exists
        this.ensureBackupDirectory();
        
        // Start automatic backup if enabled
        if (this.backupEnabled) {
            this.startAutomaticBackup();
        }
    }

    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
            console.log(`Created backup directory: ${this.backupPath}`);
        }
    }

    // Extract database name and connection details from Atlas URI
    parseAtlasURI(uri) {
        try {
            const regex = /mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/;
            const match = uri.match(regex);
            
            if (!match) {
                throw new Error('Invalid Atlas URI format');
            }

            return {
                username: match[1],
                password: match[2],
                cluster: match[3],
                database: match[4]
            };
        } catch (error) {
            console.error('Error parsing Atlas URI:', error);
            throw error;
        }
    }

    // Create backup from Atlas MongoDB
    async createBackup() {
        return new Promise((resolve, reject) => {
            try {
                if (!process.env.MONGO_URI_ATLAS) {
                    reject(new Error('Atlas MongoDB URI not configured'));
                    return;
                }

                const atlasDetails = this.parseAtlasURI(process.env.MONGO_URI_ATLAS);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupFileName = `atlas-backup-${timestamp}`;
                const backupFilePath = path.join(this.backupPath, backupFileName);

                // Use mongodump to create backup from Atlas
                const mongoDumpCommand = `mongodump --uri="${process.env.MONGO_URI_ATLAS}" --out="${backupFilePath}"`;

                console.log('Starting Atlas MongoDB backup...');
                
                exec(mongoDumpCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Backup error:', error);
                        reject(error);
                        return;
                    }

                    if (stderr) {
                        console.warn('Backup warning:', stderr);
                    }

                    console.log('Atlas backup completed successfully');
                    console.log('Backup location:', backupFilePath);

                    // Auto-import to local if enabled
                    if (this.autoImport) {
                        this.importToLocal(backupFilePath, atlasDetails.database)
                            .then(() => resolve({ backupPath: backupFilePath, imported: true }))
                            .catch(reject);
                    } else {
                        resolve({ backupPath: backupFilePath, imported: false });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Import backup to local MongoDB
    async importToLocal(backupPath, databaseName) {
        return new Promise((resolve, reject) => {
            try {
                if (!process.env.MONGO_URI_LOCAL) {
                    reject(new Error('Local MongoDB URI not configured'));
                    return;
                }

                const localURI = process.env.MONGO_URI_LOCAL;
                const dbBackupPath = path.join(backupPath, databaseName);

                if (!fs.existsSync(dbBackupPath)) {
                    reject(new Error(`Database backup not found at: ${dbBackupPath}`));
                    return;
                }

                // Use mongorestore to import to local
                const mongoRestoreCommand = `mongorestore --uri="${localURI}" --drop "${dbBackupPath}"`;

                console.log('Starting import to local MongoDB...');

                exec(mongoRestoreCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Import error:', error);
                        reject(error);
                        return;
                    }

                    if (stderr) {
                        console.warn('Import warning:', stderr);
                    }

                    console.log('Import to local MongoDB completed successfully');
                    resolve({ importPath: dbBackupPath });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Start automatic backup with cron job
    startAutomaticBackup() {
        // Create cron expression for the backup interval
        const cronExpression = `0 */${this.backupInterval} * * *`; // Every N hours

        console.log(`Starting automatic backup every ${this.backupInterval} hours`);

        cron.schedule(cronExpression, async () => {
            try {
                console.log('Running scheduled backup...');
                const result = await this.createBackup();
                console.log('Scheduled backup completed:', result);
            } catch (error) {
                console.error('Scheduled backup failed:', error);
            }
        });
    }

    // Manual backup trigger
    async manualBackup() {
        try {
            console.log('Starting manual backup...');
            const result = await this.createBackup();
            return result;
        } catch (error) {
            console.error('Manual backup failed:', error);
            throw error;
        }
    }

    // Get backup status
    getBackupStatus() {
        const backups = [];
        
        if (fs.existsSync(this.backupPath)) {
            const files = fs.readdirSync(this.backupPath);
            files.forEach(file => {
                const filePath = path.join(this.backupPath, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isDirectory() && file.startsWith('atlas-backup-')) {
                    backups.push({
                        name: file,
                        path: filePath,
                        created: stats.birthtime,
                        size: this.getDirectorySize(filePath)
                    });
                }
            });
        }

        return {
            enabled: this.backupEnabled,
            interval: this.backupInterval,
            autoImport: this.autoImport,
            backupPath: this.backupPath,
            backups: backups.sort((a, b) => b.created - a.created)
        };
    }

    // Calculate directory size
    getDirectorySize(dirPath) {
        let size = 0;
        
        try {
            const files = fs.readdirSync(dirPath);
            
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isDirectory()) {
                    size += this.getDirectorySize(filePath);
                } else {
                    size += stats.size;
                }
            });
        } catch (error) {
            console.error('Error calculating directory size:', error);
        }
        
        return size;
    }

    // Clean old backups (keep last N backups)
    cleanOldBackups(keepCount = 5) {
        try {
            const status = this.getBackupStatus();
            const backupsToDelete = status.backups.slice(keepCount);

            backupsToDelete.forEach(backup => {
                try {
                    fs.rmSync(backup.path, { recursive: true, force: true });
                    console.log(`Deleted old backup: ${backup.name}`);
                } catch (error) {
                    console.error(`Error deleting backup ${backup.name}:`, error);
                }
            });

            return {
                deleted: backupsToDelete.length,
                remaining: Math.min(status.backups.length, keepCount)
            };
        } catch (error) {
            console.error('Error cleaning old backups:', error);
            throw error;
        }
    }
}

module.exports = MongoBackupService;
