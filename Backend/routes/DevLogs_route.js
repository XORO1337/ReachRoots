const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * Enhanced Dev Logs Routes - MAXIMUM SECURITY
 * Only accessible by developers with admin role + dev key
 * Provides comprehensive access to request logs for debugging
 */

// Enhanced developer access control
const requireDevAccess = (req, res, next) => {
  // Multiple security layers for dev access
  const devKey = req.headers['x-dev-key'] || req.query.devKey;
  const expectedDevKey = process.env.DEV_ACCESS_KEY || 'dev-logs-secret-key-2025';
  
  // IP whitelist for additional security (optional)
  const allowedIPs = process.env.DEV_ALLOWED_IPS?.split(',') || [];
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (devKey !== expectedDevKey) {
    console.warn(`🚨 Unauthorized dev access attempt from ${clientIP}`);
    return res.status(403).json({
      success: false,
      message: 'Developer access key required'
    });
  }
  
  // Optional IP restriction
  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
    console.warn(`🚨 Dev access from non-whitelisted IP: ${clientIP}`);
    return res.status(403).json({
      success: false,
      message: 'IP not authorized for developer access'
    });
  }
  
  console.log(`✅ Dev access granted to ${req.user.email || req.user.phone} from ${clientIP}`);
  next();
};

/**
 * Get comprehensive log statistics
 */
router.get('/stats', 
  authenticateToken, 
  authorizeRoles('admin'),
  requireDevAccess,
  (req, res) => {
    try {
      const requestLogger = req.app.locals.requestLogger;
      const stats = requestLogger.getLogStats();
      
      res.json({
        success: true,
        message: 'Enhanced log statistics retrieved',
        data: {
          stats,
          logPaths: requestLogger.getLogFilePaths(),
          serverInfo: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
          },
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Error getting enhanced log stats:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve log statistics'
      });
    }
  }
);

/**
 * Enhanced access logs with advanced filtering
 */
router.get('/access-logs', 
  authenticateToken, 
  authorizeRoles('admin'),
  requireDevAccess,
  async (req, res) => {
    try {
      const requestLogger = req.app.locals.requestLogger;
      const {
        page = 1,
        limit = 100,
        search = '',
        type = 'main',
        startDate,
        endDate,
        statusCode,
        ip,
        method,
        includeAuth = false
      } = req.query;

      // Build search options
      const searchOptions = {
        logType: type,
        limit: parseInt(limit) * parseInt(page), // Get more for pagination
        includeStructured: true,
        caseSensitive: false
      };

      // Add date range if provided
      if (startDate && endDate) {
        searchOptions.dateRange = {
          start: new Date(startDate),
          end: new Date(endDate)
        };
      }

      // Get logs based on search criteria
      let logs = [];
      if (search.trim()) {
        logs = requestLogger.searchLogs(search, searchOptions);
      } else {
        // Get recent logs if no search
        logs = requestLogger.searchLogs('', searchOptions);
      }

      // Additional filtering
      if (statusCode) {
        logs = logs.filter(log => {
          if (typeof log === 'object') {
            return log.response?.statusCode?.toString() === statusCode;
          }
          return log.includes(` ${statusCode} `);
        });
      }

      if (ip) {
        logs = logs.filter(log => {
          if (typeof log === 'object') {
            return log.client?.ip === ip;
          }
          return log.includes(ip);
        });
      }

      if (method) {
        logs = logs.filter(log => {
          if (typeof log === 'object') {
            return log.request?.method === method.toUpperCase();
          }
          return log.includes(`"${method.toUpperCase()}`);
        });
      }

      // Filter authenticated requests only
      if (includeAuth === 'true') {
        logs = logs.filter(log => {
          if (typeof log === 'object') {
            return log.auth?.status === 'AUTHENTICATED';
          }
          return log.includes('Auth:') && !log.includes('Auth:NONE');
        });
      }

      // Pagination
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedLogs = logs.slice(startIndex, endIndex);

      res.json({
        success: true,
        message: 'Enhanced access logs retrieved',
        data: {
          logs: paginatedLogs,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(logs.length / parseInt(limit)),
            totalLogs: logs.length,
            limit: parseInt(limit)
          },
          filters: {
            search,
            type,
            statusCode,
            ip,
            method,
            includeAuth,
            dateRange: searchOptions.dateRange
          }
        }
      });

    } catch (error) {
      console.error('❌ Error getting enhanced access logs:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve access logs',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
      });
    }
  }
);

/**
 * Get security violation logs
 */
router.get('/security', 
  authenticateToken, 
  authorizeRoles('admin'),
  requireDevAccess,
  (req, res) => {
    try {
      const requestLogger = req.app.locals.requestLogger;
      const { limit = 50 } = req.query;

      const securityLogs = requestLogger.searchLogs('SECURITY', {
        logType: 'security',
        limit: parseInt(limit),
        includeStructured: true
      });
      
      res.json({
        success: true,
        message: `Retrieved ${securityLogs.length} security violation logs`,
        data: {
          violations: securityLogs,
          totalFound: securityLogs.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Error getting security logs:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve security logs'
      });
    }
  }
);

/**
 * Real-time log monitoring (tail)
 */
router.get('/tail',
  authenticateToken,
  authorizeRoles('admin'),
  requireDevAccess,
  (req, res) => {
    try {
      const requestLogger = req.app.locals.requestLogger;
      const { lines = 30, type = 'main' } = req.query;

      const recentLogs = requestLogger.searchLogs('', {
        logType: type,
        limit: parseInt(lines),
        includeStructured: true
      });

      res.json({
        success: true,
        message: `Retrieved last ${recentLogs.length} log entries`,
        data: {
          logs: recentLogs.reverse(), // Most recent first
          type,
          timestamp: new Date().toISOString(),
          totalLines: recentLogs.length
        }
      });
    } catch (error) {
      console.error('❌ Error tailing logs:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to tail logs'
      });
    }
  }
);

/**
 * Export logs in various formats
 */
router.get('/export', 
  authenticateToken, 
  authorizeRoles('admin'),
  requireDevAccess,
  (req, res) => {
    try {
      const requestLogger = req.app.locals.requestLogger;
      const {
        format = 'json',
        securityOnly = false,
        startDate,
        endDate,
        download = false
      } = req.query;

      const options = {
        format,
        includeSecurityOnly: securityOnly === 'true'
      };

      if (startDate && endDate) {
        options.dateRange = {
          start: new Date(startDate),
          end: new Date(endDate)
        };
      }

      const exportData = requestLogger.exportLogs(options);
      
      if (!exportData) {
        return res.status(500).json({
          success: false,
          message: 'Failed to export logs'
        });
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `dev-logs-${timestamp}.${format}`;
      
      if (download === 'true') {
        let contentType;
        switch (format) {
          case 'csv': contentType = 'text/csv'; break;
          case 'txt': contentType = 'text/plain'; break;
          default: contentType = 'application/json';
        }
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(exportData);
      } else {
        res.json({
          success: true,
          message: 'Logs exported successfully',
          data: {
            format,
            filename,
            content: format === 'json' ? JSON.parse(exportData) : exportData
          }
        });
      }
    } catch (error) {
      console.error('❌ Error exporting logs:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to export logs'
      });
    }
  }
);

/**
 * Clear logs with archiving (DANGER ZONE)
 */
router.delete('/clear',
  authenticateToken,
  authorizeRoles('admin'),
  requireDevAccess,
  (req, res) => {
    try {
      const requestLogger = req.app.locals.requestLogger;
      const { archiveDays = 7 } = req.body;

      // Clean old logs (archives them)
      requestLogger.cleanOldLogs(parseInt(archiveDays));
      
      res.json({
        success: true,
        message: `Logs cleaned and archived (kept last ${archiveDays} days)`,
        data: {
          archivedDays: parseInt(archiveDays),
          clearTime: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Error clearing logs:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to clear logs'
      });
    }
  }
);

module.exports = router;
