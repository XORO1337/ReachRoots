const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Enhanced Request Logger Middleware
 * Logs every request with comprehensive details including:
 * - IP address (IPv4/IPv6 with proxy detection)
 * - Browser/User-Agent information 
 * - Timestamp with millisecond precision
 * - Resource accessed
 * - Authentication status (detailed)
 * - Authorization status (detailed)
 * - Security violations
 * - Request fingerprinting
 * - Performance metrics
 */
class RequestLogger {
    constructor() {
        this.logPath = path.join(__dirname, '../logs');
        this.logFile = path.join(this.logPath, 'dev-requests.log');
        this.securityLogFile = path.join(this.logPath, 'security-violations.log');
        this.archivePath = path.join(this.logPath, 'archive');
        this.setupLogDirectory();
        this.setupRotation();
        
        console.log('🔍 Enhanced Request Logger initialized');
        console.log(`📁 Main log: ${this.logFile}`);
        console.log(`🛡️ Security log: ${this.securityLogFile}`);
    }

    setupLogDirectory() {
        // Create logs directory with restrictive permissions
        [this.logPath, this.archivePath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true, mode: 0o700 }); // Only owner access
                console.log(`📁 Created secure directory: ${dir}`);
            }
        });

        // Set restrictive permissions on existing log files
        [this.logFile, this.securityLogFile].forEach(file => {
            if (fs.existsSync(file)) {
                fs.chmodSync(file, 0o600); // Only owner can read/write
            }
        });
    }

    setupRotation() {
        // Daily log rotation at midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.rotateLogs();
            setInterval(() => this.rotateLogs(), 24 * 60 * 60 * 1000); // Daily
        }, msUntilMidnight);
    }

    rotateLogs() {
        try {
            const date = new Date().toISOString().split('T')[0];
            
            [this.logFile, this.securityLogFile].forEach(logFile => {
                if (fs.existsSync(logFile) && fs.statSync(logFile).size > 0) {
                    const fileName = path.basename(logFile, '.log');
                    const archiveFile = path.join(this.archivePath, `${fileName}-${date}.log`);
                    
                    fs.renameSync(logFile, archiveFile);
                    fs.chmodSync(archiveFile, 0o600); // Secure archived files
                    console.log(`📦 Rotated log: ${archiveFile}`);
                }
            });
            
            // Clean logs older than 30 days
            this.cleanOldArchives();
            
        } catch (error) {
            console.error('❌ Log rotation failed:', error.message);
        }
    }

    cleanOldArchives() {
        try {
            const files = fs.readdirSync(this.archivePath);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            
            files.forEach(file => {
                const filePath = path.join(this.archivePath, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Cleaned old archive: ${file}`);
                }
            });
        } catch (error) {
            console.error('❌ Archive cleanup failed:', error.message);
        }
    }

    /**
     * Enhanced IP address extraction with proxy support
     * Supports IPv4, IPv6, and various proxy configurations
     */
    extractIPAddress(req) {
        // Priority order for IP detection
        const candidates = [
            req.headers['cf-connecting-ip'],        // Cloudflare
            req.headers['x-real-ip'],               // Nginx proxy
            req.headers['x-forwarded-for'],         // Standard proxy header
            req.headers['x-client-ip'],             // Apache mod_proxy
            req.headers['x-cluster-client-ip'],     // Cluster setups
            req.connection?.remoteAddress,          // Direct connection
            req.socket?.remoteAddress,              // Socket connection
            req.ip                                  // Express trust proxy
        ];

        for (const candidate of candidates) {
            if (candidate) {
                // Handle comma-separated IPs (X-Forwarded-For)
                const ip = candidate.split(',')[0].trim();
                
                // Validate IP format
                if (this.isValidIP(ip)) {
                    return ip;
                }
            }
        }

        return 'unknown';
    }

    /**
     * Validate IP address format (IPv4 and IPv6)
     */
    isValidIP(ip) {
        // Remove brackets from IPv6
        const cleanIP = ip.replace(/^\[|\]$/g, '');
        
        // IPv4 pattern
        const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        // IPv6 pattern (simplified)
        const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
        
        return ipv4Pattern.test(cleanIP) || ipv6Pattern.test(cleanIP);
    }

    /**
     * Enhanced browser and device information extraction
     */
    extractBrowserInfo(req) {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        let browser = 'Unknown';
        let version = '';
        let os = 'Unknown';
        let device = 'Desktop';

        // Browser detection with version
        const browserTests = [
            { name: 'Chrome', pattern: /Chrome\/([0-9.]+)/, exclude: ['Edg', 'OPR'] },
            { name: 'Firefox', pattern: /Firefox\/([0-9.]+)/ },
            { name: 'Safari', pattern: /Version\/([0-9.]+).*Safari/, exclude: ['Chrome'] },
            { name: 'Edge', pattern: /Edg\/([0-9.]+)/ },
            { name: 'Opera', pattern: /(?:Opera|OPR)\/([0-9.]+)/ },
            { name: 'Internet Explorer', pattern: /MSIE ([0-9.]+)/ },
            { name: 'cURL', pattern: /curl\/([0-9.]+)/ },
            { name: 'Postman', pattern: /Postman\/([0-9.]+)/ },
            { name: 'Thunder Client', pattern: /Thunder Client/ },
            { name: 'Insomnia', pattern: /insomnia\/([0-9.]+)/ },
            { name: 'HTTPie', pattern: /HTTPie\/([0-9.]+)/ }
        ];

        for (const test of browserTests) {
            const match = userAgent.match(test.pattern);
            if (match && (!test.exclude || !test.exclude.some(ex => userAgent.includes(ex)))) {
                browser = test.name;
                version = match[1] || '';
                break;
            }
        }

        // OS detection
        const osTests = [
            { name: 'Windows 11', pattern: /Windows NT 10\.0.*Win64.*WOW64/ },
            { name: 'Windows 10', pattern: /Windows NT 10\.0/ },
            { name: 'Windows 8.1', pattern: /Windows NT 6\.3/ },
            { name: 'Windows 8', pattern: /Windows NT 6\.2/ },
            { name: 'Windows 7', pattern: /Windows NT 6\.1/ },
            { name: 'macOS', pattern: /Mac OS X ([0-9._]+)/ },
            { name: 'iOS', pattern: /OS ([0-9._]+) like Mac OS X/ },
            { name: 'Android', pattern: /Android ([0-9.]+)/ },
            { name: 'Linux', pattern: /Linux/ },
            { name: 'Ubuntu', pattern: /Ubuntu/ },
            { name: 'CentOS', pattern: /CentOS/ }
        ];

        for (const test of osTests) {
            if (userAgent.match(test.pattern)) {
                os = test.name;
                break;
            }
        }

        // Device type detection
        if (userAgent.includes('Mobile')) {
            device = 'Mobile';
        } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
            device = 'Tablet';
        } else if (userAgent.includes('curl') || userAgent.includes('Postman') || userAgent.includes('HTTPie')) {
            device = 'API Client';
        }

        return { 
            browser: version ? `${browser} ${version}` : browser, 
            os, 
            device,
            userAgent: userAgent.substring(0, 300) // Truncate very long user agents
        };
    }

    /**
     * Generate request fingerprint for tracking and analytics
     */
    generateFingerprint(req) {
        const components = [
            this.extractIPAddress(req),
            req.headers['user-agent'] || '',
            req.headers['accept-language'] || '',
            req.headers['accept-encoding'] || '',
            req.headers['accept'] || ''
        ].join('|');
        
        return crypto.createHash('sha256').update(components).digest('hex').substring(0, 16);
    }

    /**
     * Determine detailed authentication status
     */
    getAuthenticationStatus(req) {
        if (!req.user) {
            return {
                status: 'UNAUTHENTICATED',
                type: 'none',
                details: null
            };
        }

        return {
            status: 'AUTHENTICATED',
            type: req.user.authProvider || 'local',
            details: {
                userId: req.user.id || req.user._id,
                role: req.user.role,
                email: req.user.email,
                phone: req.user.phone,
                verification: {
                    email: req.user.isEmailVerified || false,
                    phone: req.user.isPhoneVerified || false,
                    identity: req.user.isIdentityVerified || false
                },
                lastLogin: req.user.lastLogin,
                loginAttempts: req.user.loginAttempts || 0
            }
        };
    }

    /**
     * Determine detailed authorization status
     */
    getAuthorizationStatus(res, req) {
        const status = res.statusCode;
        
        const authzInfo = {
            status: 'UNKNOWN',
            code: status,
            message: '',
            details: {}
        };

        switch (status) {
            case 200:
            case 201:
            case 202:
            case 204:
                authzInfo.status = 'AUTHORIZED';
                authzInfo.message = 'Access granted';
                break;
                
            case 401:
                authzInfo.status = 'UNAUTHORIZED';
                authzInfo.message = 'Authentication required';
                authzInfo.details.reason = 'missing_or_invalid_token';
                break;
                
            case 403:
                authzInfo.status = 'FORBIDDEN';
                authzInfo.message = 'Insufficient permissions';
                authzInfo.details.reason = res.locals.errorMessage || 'permission_denied';
                authzInfo.details.requiredRole = req.route?.requiredRole;
                authzInfo.details.userRole = req.user?.role;
                break;
                
            case 423:
                authzInfo.status = 'LOCKED';
                authzInfo.message = 'Account temporarily locked';
                authzInfo.details.reason = 'account_locked';
                break;
                
            case 429:
                authzInfo.status = 'RATE_LIMITED';
                authzInfo.message = 'Too many requests';
                authzInfo.details.reason = 'rate_limit_exceeded';
                break;
                
            default:
                if (status >= 400 && status < 500) {
                    authzInfo.status = 'CLIENT_ERROR';
                    authzInfo.message = 'Client error';
                } else if (status >= 500) {
                    authzInfo.status = 'SERVER_ERROR';
                    authzInfo.message = 'Server error';
                } else {
                    authzInfo.status = 'SUCCESS';
                    authzInfo.message = 'Request processed';
                }
        }

        return authzInfo;
    }

    /**
     * Enhanced log entry formatting with structured data
     */
    formatLogEntry(logData) {
        const {
            timestamp,
            requestId,
            fingerprint,
            ip,
            method,
            url,
            statusCode,
            responseTime,
            browser,
            os,
            device,
            userAgent,
            auth,
            authz,
            errorMessage,
            securityViolation,
            contentLength,
            referer,
            protocol
        } = logData;

        // Create comprehensive structured log entry
        const structuredLog = {
            timestamp,
            request: {
                id: requestId,
                fingerprint,
                method,
                url,
                protocol,
                referer: referer || null
            },
            client: {
                ip,
                browser,
                os,
                device,
                userAgent
            },
            auth,
            authorization: authz,
            response: {
                statusCode,
                responseTime: `${responseTime}ms`,
                contentLength: contentLength || 0
            },
            ...(errorMessage && { error: errorMessage }),
            ...(securityViolation && { security: securityViolation })
        };

        // Create human-readable log entry
        const authStr = auth.status === 'AUTHENTICATED' 
            ? `Auth:${auth.details.role}:${auth.details.userId}` 
            : 'Auth:NONE';
            
        const authzStr = `Authz:${authz.status}`;
        const securityStr = securityViolation ? ` [🚨SECURITY:${securityViolation}]` : '';
        const errorStr = errorMessage ? ` [❌ERROR:${errorMessage}]` : '';

        const humanLog = `[${timestamp}] ${ip} "${method} ${url}" ${statusCode} ${responseTime}ms | ${browser}/${os}/${device} | ${authStr} | ${authzStr} | ID:${requestId}${securityStr}${errorStr}`;

        return { structuredLog, humanLog };
    }

    /**
     * Write log entries to appropriate files
     */
    async writeLog(logData) {
        try {
            const { structuredLog, humanLog } = this.formatLogEntry(logData);
            
            // Write to main log file
            const mainLogLine = `${humanLog}\n${JSON.stringify(structuredLog)}\n---\n`;
            fs.appendFileSync(this.logFile, mainLogLine, { mode: 0o600 });
            
            // Write security violations to separate log
            if (logData.securityViolation) {
                const securityLogLine = `[${logData.timestamp}] SECURITY VIOLATION: ${logData.securityViolation} | IP: ${logData.ip} | User: ${logData.auth.details?.userId || 'anonymous'} | URL: ${logData.url}\n${JSON.stringify(structuredLog)}\n---\n`;
                fs.appendFileSync(this.securityLogFile, securityLogLine, { mode: 0o600 });
                
                // Alert to console for immediate attention
                console.warn(`🚨 SECURITY VIOLATION: ${logData.securityViolation} from ${logData.ip} accessing ${logData.url}`);
            }

            // Performance monitoring alerts
            if (logData.responseTime > 5000) { // > 5 seconds
                console.warn(`⚠️ SLOW REQUEST: ${logData.responseTime}ms for ${logData.method} ${logData.url} from ${logData.ip}`);
            }

        } catch (error) {
            console.error('❌ Failed to write request log:', error.message);
        }
    }

    /**
    /**
     * Enhanced middleware function with comprehensive logging
     */
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            const timestamp = new Date().toISOString();
            const requestId = crypto.randomUUID().substring(0, 8);
            
            // Extract client information
            const ip = this.extractIPAddress(req);
            const { browser, os, device, userAgent } = this.extractBrowserInfo(req);
            const fingerprint = this.generateFingerprint(req);
            
            // Add request ID for tracking
            req.requestId = requestId;
            res.setHeader('X-Request-ID', requestId);

            // Store reference to logger instance
            const logger = this;

            // Store original response methods
            const originalEnd = res.end;
            const originalJson = res.json;
            
            // Track if logging already done
            let logged = false;
            
            const performLogging = () => {
                if (logged) return;
                logged = true;
                
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                // Get authentication and authorization status
                const auth = logger.getAuthenticationStatus(req);
                const authz = logger.getAuthorizationStatus(res, req);
                
                // Prepare comprehensive log data
                const logData = {
                    timestamp,
                    requestId,
                    fingerprint,
                    ip,
                    method: req.method,
                    url: req.originalUrl || req.url,
                    statusCode: res.statusCode,
                    responseTime,
                    browser,
                    os,
                    device,
                    userAgent,
                    auth,
                    authz,
                    errorMessage: res.locals.errorMessage || null,
                    securityViolation: res.locals.securityViolation || null,
                    contentLength: res.get('Content-Length'),
                    referer: req.headers.referer,
                    protocol: req.protocol
                };

                // Write log asynchronously to avoid blocking
                setImmediate(() => {
                    logger.writeLog(logData);
                });

                // Development console output
                if (process.env.NODE_ENV === 'development') {
                    const statusEmoji = res.statusCode >= 500 ? '🔴' : 
                                      res.statusCode >= 400 ? '🟡' : '🟢';
                    const securityEmoji = res.locals.securityViolation ? '🚨' : '';
                    const slowEmoji = responseTime > 1000 ? '🐌' : '';
                    
                    console.log(`${statusEmoji} ${securityEmoji} ${slowEmoji} [${requestId}] ${req.method} ${req.originalUrl} | ${res.statusCode} | ${responseTime}ms | ${ip} | ${browser}`);
                }
            };

            // Override response methods to capture completion
            res.end = function(chunk, encoding) {
                res.end = originalEnd;
                performLogging();
                originalEnd.call(this, chunk, encoding);
            };

            res.json = function(data) {
                res.json = originalJson;
                performLogging();
                originalJson.call(this, data);
            };

            next();
        };
    }

    /**
     * Get log file paths for dev access
     */
    getLogFilePaths() {
        return {
            main: this.logFile,
            security: this.securityLogFile,
            archive: this.archivePath
        };
    }

    /**
     * Get log statistics
     */
    getLogStats() {
        try {
            const stats = {};
            
            [this.logFile, this.securityLogFile].forEach(file => {
                const name = path.basename(file, '.log');
                if (fs.existsSync(file)) {
                    const fileStat = fs.statSync(file);
                    const content = fs.readFileSync(file, 'utf8');
                    const lines = content.split('\n').filter(line => line.trim());
                    const requests = lines.filter(line => line.includes('[') && !line.startsWith('{')).length;
                    
                    stats[name] = {
                        requests,
                        fileSize: fileStat.size,
                        lastModified: fileStat.mtime,
                        readable: this.formatFileSize(fileStat.size)
                    };
                } else {
                    stats[name] = { requests: 0, fileSize: 0, readable: '0 B' };
                }
            });
            
            return stats;
        } catch (error) {
            console.error('❌ Error getting log stats:', error.message);
            return { error: error.message };
        }
    }

    /**
     * Format file size in human readable format
     */
    formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Search logs with advanced filtering
     */
    searchLogs(pattern, options = {}) {
        try {
            const {
                logType = 'main', // 'main', 'security', 'both'
                limit = 100,
                includeStructured = false,
                caseSensitive = false,
                dateRange = null // { start: Date, end: Date }
            } = options;

            const results = [];
            const files = [];
            
            if (logType === 'main' || logType === 'both') files.push(this.logFile);
            if (logType === 'security' || logType === 'both') files.push(this.securityLogFile);
            
            files.forEach(file => {
                if (!fs.existsSync(file)) return;
                
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                for (const line of lines) {
                    if (results.length >= limit) break;
                    
                    const searchLine = caseSensitive ? line : line.toLowerCase();
                    const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
                    
                    if (searchLine.includes(searchPattern)) {
                        // Date filtering
                        if (dateRange) {
                            const dateMatch = line.match(/\[([^\]]+)\]/);
                            if (dateMatch) {
                                const lineDate = new Date(dateMatch[1]);
                                if (lineDate < dateRange.start || lineDate > dateRange.end) {
                                    continue;
                                }
                            }
                        }
                        
                        if (includeStructured && line.startsWith('{')) {
                            try {
                                results.push(JSON.parse(line));
                            } catch {
                                results.push(line);
                            }
                        } else if (!line.startsWith('{') && !line.startsWith('---') && line.trim()) {
                            results.push(line);
                        }
                    }
                }
            });
            
            return results;
        } catch (error) {
            console.error('❌ Error searching logs:', error.message);
            return [];
        }
    }

    /**
     * Export logs for analysis
     */
    exportLogs(options = {}) {
        try {
            const {
                format = 'json', // 'json', 'csv', 'txt'
                dateRange = null,
                includeSecurityOnly = false
            } = options;

            const logs = [];
            const files = includeSecurityOnly ? [this.securityLogFile] : [this.logFile, this.securityLogFile];
            
            files.forEach(file => {
                if (!fs.existsSync(file)) return;
                
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('{')) {
                        try {
                            const logEntry = JSON.parse(line);
                            
                            // Date filtering
                            if (dateRange) {
                                const logDate = new Date(logEntry.timestamp);
                                if (logDate < dateRange.start || logDate > dateRange.end) {
                                    continue;
                                }
                            }
                            
                            logs.push(logEntry);
                        } catch {
                            // Skip malformed JSON
                        }
                    }
                }
            });
            
            // Format based on requested type
            switch (format) {
                case 'csv':
                    return this.formatAsCSV(logs);
                case 'txt':
                    return this.formatAsText(logs);
                default:
                    return JSON.stringify(logs, null, 2);
            }
            
        } catch (error) {
            console.error('❌ Error exporting logs:', error.message);
            return null;
        }
    }

    formatAsCSV(logs) {
        if (logs.length === 0) return '';
        
        const headers = ['timestamp', 'ip', 'method', 'url', 'statusCode', 'responseTime', 'browser', 'auth_status', 'auth_role', 'security_violation'];
        const rows = logs.map(log => [
            log.timestamp,
            log.client?.ip || '',
            log.request?.method || '',
            log.request?.url || '',
            log.response?.statusCode || '',
            log.response?.responseTime || '',
            log.client?.browser || '',
            log.auth?.status || '',
            log.auth?.details?.role || '',
            log.security || ''
        ]);
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    formatAsText(logs) {
        return logs.map(log => {
            const auth = log.auth?.status === 'AUTHENTICATED' ? `${log.auth.details.role}:${log.auth.details.userId}` : 'NONE';
            const security = log.security ? ` [SECURITY:${log.security}]` : '';
            return `[${log.timestamp}] ${log.client?.ip} "${log.request?.method} ${log.request?.url}" ${log.response?.statusCode} ${log.response?.responseTime} | ${log.client?.browser} | Auth:${auth}${security}`;
        }).join('\n');
    }

    /**
     * Clean old logs (enhanced version)
     */
    cleanOldLogs(daysToKeep = 30) {
        try {
            this.cleanOldArchives(); // Clean archives first
            
            // Check main log files
            [this.logFile, this.securityLogFile].forEach(file => {
                if (!fs.existsSync(file)) return;
                
                const stats = fs.statSync(file);
                const now = new Date();
                const cutoffDate = new Date(now.getTime() - (daysToKeep * 24 * 60 * 60 * 1000));
                
                if (stats.mtime < cutoffDate) {
                    const date = stats.mtime.toISOString().split('T')[0];
                    const fileName = path.basename(file, '.log');
                    const archiveName = `${fileName}_${date}.log`;
                    const archivePath = path.join(this.archivePath, archiveName);
                    
                    fs.renameSync(file, archivePath);
                    fs.chmodSync(archivePath, 0o600);
                    console.log(`📦 Archived old log: ${archiveName}`);
                }
            });
            
        } catch (error) {
            console.error('❌ Failed to clean old logs:', error.message);
        }
    }
}

module.exports = RequestLogger;
