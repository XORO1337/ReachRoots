const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Store connection state
let isConnected = false;
let primaryConnection = null;
let connectionType = null;

// Store multiple connections for advanced scenarios
const connections = {
    atlas: null,
    local: null
};

/**
 * Enhanced fallback database connection system
 * Uses mongoose main connection for better compatibility
 * Guarantees application starts if ANY database is available
 */
const connectDualDB = async () => {
    if (isConnected && primaryConnection) {
        console.log(`✅ Database already connected via ${connectionType}`);
        return primaryConnection;
    }

    const atlasURI = process.env.MONGO_URI_ATLAS;
    const localURI = process.env.MONGO_URI_LOCAL;
    const timeout = parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000;

    if (!atlasURI && !localURI) {
        throw new Error('❌ No database URIs configured in environment variables');
    }

    // Modern connection configuration (removing deprecated options)
    const baseConfig = {
        serverSelectionTimeoutMS: timeout,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        w: 'majority'
    };

    console.log('🔄 Initiating robust database connection with fallback strategy...');

    // Strategy 1: Try Local first (faster when available)
    if (localURI) {
        try {
            console.log('📡 Attempting local MongoDB connection...');
            
            const localConfig = {
                ...baseConfig,
                ssl: false,
                authSource: 'admin'
            };

            await Promise.race([
                mongoose.connect(localURI, localConfig),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Local connection timeout')), timeout)
                )
            ]);
            
            primaryConnection = mongoose.connection;
            connectionType = 'LOCAL';
            isConnected = true;
            connections.local = mongoose.connection;
            
            console.log('✅ Connected to Local MongoDB (Primary Connection)');
            console.log(`🎯 Database: ${mongoose.connection.name || 'artisan_management'}`);
            
            setupConnectionHandlers('Local MongoDB');
            
            // Try Atlas as secondary connection (non-blocking)
            if (atlasURI) {
                connectAtlasSecondary(atlasURI, baseConfig);
            }
            
            return primaryConnection;
            
        } catch (localError) {
            console.log('⚠️ Local MongoDB unavailable:', localError.message.split('\n')[0]);
        }
    }

    // Strategy 2: Fallback to Atlas (Critical for production)
    if (atlasURI) {
        try {
            console.log('☁️ Attempting MongoDB Atlas connection...');
            
            const atlasConfig = {
                ...baseConfig,
                ssl: true,
                authSource: 'admin'
            };

            await mongoose.connect(atlasURI, atlasConfig);
            
            primaryConnection = mongoose.connection;
            connectionType = 'ATLAS';
            isConnected = true;
            connections.atlas = mongoose.connection;
            
            console.log('✅ Connected to MongoDB Atlas (Primary Connection)');
            console.log(`🎯 Database: ${mongoose.connection.name || 'artisan_management'}`);
            
            setupConnectionHandlers('MongoDB Atlas');
            
            return primaryConnection;
            
        } catch (atlasError) {
            console.error('❌ Atlas MongoDB connection failed:', atlasError.message.split('\n')[0]);
        }
    }

    // Strategy 3: If both fail, throw error
    throw new Error('❌ Unable to connect to any database. Both local and Atlas connections failed.');
};

/**
 * Attempt Atlas connection as secondary (non-blocking)
 */
async function connectAtlasSecondary(atlasURI, baseConfig) {
    try {
        console.log('� Establishing secondary Atlas connection...');
        
        const atlasConfig = {
            ...baseConfig,
            ssl: true,
            authSource: 'admin'
        };
        
        const secondaryAtlas = mongoose.createConnection(atlasURI, atlasConfig);
        connections.atlas = secondaryAtlas;
        
        secondaryAtlas.on('connected', () => {
            console.log('✅ Secondary Atlas connection established');
        });
        
        secondaryAtlas.on('error', (err) => {
            console.log('⚠️ Secondary Atlas connection error:', err.message.split('\n')[0]);
        });
        
    } catch (error) {
        console.log('⚠️ Secondary Atlas connection failed:', error.message.split('\n')[0]);
    }
}

/**
 * Setup connection event handlers with proper error handling
 */
function setupConnectionHandlers(connectionName) {
    mongoose.connection.on('connected', () => {
        console.log(`🟢 ${connectionName} connection established`);
        isConnected = true;
    });
    
    mongoose.connection.on('error', (err) => {
        console.error(`� ${connectionName} connection error:`, err.message.split('\n')[0]);
        // Don't set isConnected to false for minor errors - let app continue
    });
    
    mongoose.connection.on('disconnected', () => {
        console.log(`🟡 ${connectionName} disconnected`);
        isConnected = false;
        primaryConnection = null;
        connectionType = null;
        
        // Attempt automatic reconnection after delay
        setTimeout(() => {
            if (!isConnected) {
                console.log('🔄 Attempting automatic reconnection...');
                connectDualDB().catch(err => 
                    console.error('❌ Auto-reconnection failed:', err.message.split('\n')[0])
                );
            }
        }, 5000);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
        console.log(`\n📴 Received ${signal}. Closing database connections...`);
        try {
            await mongoose.connection.close();
            if (connections.atlas && connections.atlas !== mongoose.connection) {
                await connections.atlas.close();
            }
            if (connections.local && connections.local !== mongoose.connection) {
                await connections.local.close();
            }
            console.log('✅ Database connections closed gracefully');
        } catch (error) {
            console.error('❌ Error closing database connections:', error.message);
        }
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Legacy connectDB function for compatibility
 */
const connectDB = async (mongo_URI, connectionName = 'default') => {
    try {
        const conn = await mongoose.createConnection(mongo_URI);
        console.log(`MongoDB Connected (${connectionName}): ${conn.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB (${connectionName}): ${error.message}`);
        throw error;
    }
};

/**
 * Get specific connection by type
 */
const getConnection = (type = 'atlas') => {
    return connections[type];
};

/**
 * Get primary available connection (main mongoose connection)
 */
const getPrimaryConnection = () => {
    if (isConnected && primaryConnection) {
        return primaryConnection;
    }
    
    // Fallback to available connections
    if (connections.atlas) {
        return connections.atlas;
    } else if (connections.local) {
        return connections.local;
    } else {
        throw new Error('❌ No database connections available');
    }
};

/**
 * Get available connection with preference
 */
const getAvailableConnection = (preference = 'atlas') => {
    if (preference === 'atlas') {
        return connections.atlas || connections.local || mongoose.connection;
    } else if (preference === 'local') {
        return connections.local || connections.atlas || mongoose.connection;
    } else {
        return getPrimaryConnection();
    }
};

/**
 * Check connection health status
 */
const checkConnectionHealth = () => {
    const health = {
        atlas: connections.atlas && connections.atlas.readyState === 1 ? 'healthy' : 'unavailable',
        local: connections.local && connections.local.readyState === 1 ? 'healthy' : 'unavailable',
        primary: isConnected && primaryConnection ? connectionType.toLowerCase() : 'none',
        hasConnection: isConnected || !!(connections.atlas || connections.local),
        connectionType: connectionType || 'none'
    };
    return health;
};

/**
 * Get all connections
 */
const getConnections = () => {
    return {
        ...connections,
        primary: primaryConnection,
        type: connectionType,
        isConnected
    };
};

module.exports = {
    connectDB,
    connectDualDB,
    getConnection,
    getPrimaryConnection,
    getAvailableConnection,
    checkConnectionHealth,
    getConnections
};