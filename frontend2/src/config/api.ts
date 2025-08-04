// API Configuration with environment detection
const getBaseUrl = (): string => {
  // Check if we're in development environment (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // For GitHub Codespaces, use the correct external URL
  if (window.location.hostname.includes('app.github.dev')) {
    return 'https://cautious-zebra-x5549r5475j6f979-5000.app.github.dev';
  }
  
  // Fallback to the Codespaces URL
  return 'https://cautious-zebra-x5549r5475j6f979-5000.app.github.dev';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      GOOGLE_OAUTH: '/api/auth/google',
      PROFILE: '/api/auth/profile',
      LOGOUT: '/api/auth/logout',
      SEND_OTP: '/api/auth/send-otp',
      RESEND_OTP: '/api/auth/resend-otp',
      VERIFY_OTP: '/api/auth/verify-otp',
      OTP_STATUS: '/api/auth/otp-status',
    },
    PRODUCTS: {
      BASE: '/api/products',
      SEARCH: '/api/products/search',
      CATEGORIES: '/api/products/categories',
      BY_CATEGORY: '/api/products/by-category',
      BY_ARTISAN: '/api/products/by-artisan',
      FEATURED: '/api/products/featured',
    },
    ARTISANS: {
      BASE: '/api/artisans',
      SEARCH_BY_SKILLS: '/api/artisans/search/skills',
      SEARCH_BY_REGION: '/api/artisans/search/region',
    },
    ORDERS: {
      BASE: '/api/orders',
      SEARCH: '/api/orders/search',
    }
  }
} as const;

// Helper function to build full URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for Google OAuth with role
export const buildGoogleOAuthUrl = (role: 'customer' | 'artisan' | 'distributor'): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE_OAUTH}?role=${role}`;
};
