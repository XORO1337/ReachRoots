// API Configuration with environment detection
const getBaseUrl = (): string => {
  // 1. Check for explicit environment variable
  if (import.meta.env.VITE_API_URL) {
    console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;

  // 2. Check for localhost/127.0.0.1
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('Detected localhost, using local backend');
    return 'http://localhost:10000';
  }
  
  // 3. Check for GitHub Codespaces (app.github.dev or github.dev)
  if (hostname.includes('app.github.dev') || hostname.includes('github.dev')) {
    // Attempt to replace the frontend port with the backend port (5000)
    // Typical format: <codespace-name>-<port>.<domain>
    // We want to replace the last number before the domain with 5000
    
    // Try to find the port in the hostname and replace it
    // This regex looks for a hyphen followed by digits, followed by the domain suffix
    const newHostname = hostname.replace(/-\d+(\.app\.github\.dev|\.github\.dev)/, '-10000$1');
    
    if (newHostname !== hostname) {
      console.log('Detected Codespace, constructed backend URL:', `https://${newHostname}`);
      return `https://${newHostname}`;
    }
    
    // Fallback: if we couldn't do a simple replacement, try the split method but be careful
    // This assumes the format name-port.domain
    const parts = hostname.split('.');
    const subdomain = parts[0];
    const domain = parts.slice(1).join('.');
    
    const subParts = subdomain.split('-');
    // If the last part is a number (port), replace it
    if (!isNaN(Number(subParts[subParts.length - 1]))) {
      subParts[subParts.length - 1] = '10000';
      const newUrl = `https://${subParts.join('-')}.${domain}`;
      console.log('Detected Codespace (fallback logic), constructed backend URL:', newUrl);
      return newUrl;
    }
  }
  
  // 4. Production fallback
  // Only use production URL if we are actually ON the production domain or if we can't determine otherwise
  if (hostname.includes('https://super-duper-fortnight-4jvx7qp4wxwc7jjg-5174.app.github.dev')) {
    console.log('Detected production frontend, using production backend');
    return 'https://super-duper-fortnight-4jvx7qp4wxwc7jjg-10000.app.github.dev';
  }

  // 5. Default for unknown environments (likely local dev with custom host)
  console.warn('Unknown environment, defaulting to localhost:10000');
  return 'http://localhost:10000';
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
      CATEGORIES_WITH_COUNTS: '/api/products/categories-with-counts',
      BY_CATEGORY: '/api/products/by-category',
      BY_ARTISAN: '/api/products/by-artisan',
      FEATURED: '/api/products/featured',
      REVIEWS: (productId: string) => `/api/products/${productId}/reviews`,
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
export const shouldUseHashRouting = (): boolean => {
  if (import.meta.env.VITE_ROUTER_MODE === 'browser') {
    return false;
  }
  return true;
};

export const buildGoogleOAuthUrl = (role: 'customer' | 'artisan' | 'distributor'): string => {
  const params = new URLSearchParams({ role });

  if (typeof window !== 'undefined') {
    params.set('redirect', window.location.origin);
  }

  if (shouldUseHashRouting()) {
    params.set('hashRouting', '1');
  }

  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE_OAUTH}?${params.toString()}`;
};
