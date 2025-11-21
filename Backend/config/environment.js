// Environment configuration for automatic deployment
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Function to get the correct environment configuration
const getEnvironmentConfig = () => {
  const config = {
    // Server Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    
    // Database Configuration
    MONGO_URI: process.env.MONGO_URI || process.env.MONGO_URI_ATLAS || 'mongodb://localhost:27017/artisan_management',
    
    // Frontend URL - Auto-detect from Render or use provided
    CLIENT_URL: getClientURL(),
    
    // Backend URL - Auto-detect from Render or use provided
    BACKEND_URL: getBackendURL(),
    
    // Google OAuth - Auto-construct callback URL
    GOOGLE_CALLBACK_URL: `${getBackendURL()}/api/auth/google/callback`,
    
    // CORS Origin
    CORS_ORIGIN: getClientURL(),
    
    // JWT Secrets (use environment variables if available)
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '5c2f58d786f111acdbfdfadbcda6681aed0d1378a558fb361d2747ecf78eb4ac0765b980a1a7200aa8aaf3fc5c6af383b7884c42e961c928579be89d6f6bfcb431a9a79314059d313e43dacf529296fbd8a001cd8a29f110125ea3a30316c19b11d99379af56830512cf794e35de0314ae433c1dcdd9df0e49affd21ce0f33b4',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'ca8b361506ad3552988c2b1fef6b8bf80c15e22c8f4a578e12baa50f5676a17d4b740b877b860b62baa8cc551eb3917a3ab2b25999edd547a8b51afab3f2b5a4984bf6f8c50713a8c97f9192469a89026a38a3ea0308b90703cdf1f4be88cb5bce247eb0999d49641ba12fe30d107e84f350ff9776cd5292f6a36078e372c029',

    // Payment Gateway
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || ''
  };

  return config;
};

// Function to get client URL (frontend)
function getClientURL() {
  // Check for explicit environment variable
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL;
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
  
  // For Render, try to auto-detect frontend service
  if (process.env.RENDER_SERVICE_NAME && process.env.RENDER_EXTERNAL_HOSTNAME) {
    // Assume frontend service has '-frontend' or similar suffix
    const backendServiceName = process.env.RENDER_SERVICE_NAME;
    const frontendServiceName = backendServiceName.replace('-backend', '-frontend').replace('-api', '-frontend');
    return `https://${frontendServiceName}.onrender.com`;
  }
  
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5173'; // Vite default port
  }
  
  // Production fallback - you'll need to set this manually
  return 'https://reachroots.onrender.com'; // Frontend production domain
}

// Function to get backend URL
function getBackendURL() {
  // Check for explicit environment variable
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  
  // For Render, use the external URL
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  
  // For Render with hostname
  if (process.env.RENDER_EXTERNAL_HOSTNAME) {
    return `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
  }
  
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // Production fallback
  return 'https://reachroots-backend.onrender.com'; // Backend production domain
}

// Export the configuration
module.exports = {
  ...getEnvironmentConfig(),
  getClientURL,
  getBackendURL
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Environment Configuration:');
  console.log(`   NODE_ENV: ${getEnvironmentConfig().NODE_ENV}`);
  console.log(`   PORT: ${getEnvironmentConfig().PORT}`);
  console.log(`   CLIENT_URL: ${getEnvironmentConfig().CLIENT_URL}`);
  console.log(`   BACKEND_URL: ${getEnvironmentConfig().BACKEND_URL}`);
  console.log(`   CORS_ORIGIN: ${getEnvironmentConfig().CORS_ORIGIN}`);
}
