// CORS middleware configuration with dynamic environment detection
const { getClientURL } = require('../config/environment');

module.exports = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // React dev server
    'http://localhost:4173', // Vite preview
    'https://reachroots.onrender.com', // Current Codespace frontend
    getClientURL(), // Dynamic client URL detection
    process.env.CLIENT_URL, // Explicit client URL
    process.env.FRONTEND_URL, // Alternative env variable
    process.env.CORS_ORIGIN // Explicit CORS origin
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  // Allow requests from allowed origins or no origin (for non-browser requests)
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    // In development, allow any origin. In production, be restrictive
    if (process.env.NODE_ENV === 'development') {
      res.header('Access-Control-Allow-Origin', origin || '*');
    } else {
      console.warn(`🚫 CORS: Blocked request from origin: ${origin}`);
      console.log(`🔍 Allowed origins:`, allowedOrigins);
      return res.status(403).json({ error: 'CORS: Origin not allowed' });
    }
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control'
  );
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).json({});
  }
  
  next();
};
