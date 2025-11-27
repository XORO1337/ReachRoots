import { API_CONFIG, buildApiUrl } from '../config/api';

export interface SellerProfile {
  id: string;
  name: string;
  city: string;
  state: string;
  avatar: string;
  story?: string;
  specialties: string[];
  rating: number;
  totalProducts: number;
  yearsOfExperience: number;
  bio?: string;
  region?: string;
  skills?: string[];
  phone?: string;
  email?: string;
}

export interface ArtisanListResponse {
  success: boolean;
  message: string;
  data?: {
    artisans: ArtisanApiProfile[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface ArtisanApiProfile {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
  bio?: string;
  region?: string;
  skills?: string[];
  city?: string;
  state?: string;
  yearsOfExperience?: number;
  totalProducts?: number;
  rating?: number;
  createdAt?: string;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * Transform API artisan response to SellerProfile format used in UI
 */
const transformArtisanToSeller = (artisan: ArtisanApiProfile): SellerProfile => {
  const user = artisan.userId && typeof artisan.userId === 'object' ? artisan.userId : null;
  
  return {
    id: artisan._id,
    name: user?.name || 'Artisan',
    city: artisan.city || artisan.region || 'India',
    state: artisan.state || '',
    avatar: user?.profileImage || '/api/placeholder/200/200',
    story: artisan.bio || 'A skilled artisan creating beautiful handcrafted items with traditional techniques passed down through generations.',
    specialties: artisan.skills || [],
    rating: artisan.rating || 4.5,
    totalProducts: artisan.totalProducts || 0,
    yearsOfExperience: artisan.yearsOfExperience || 5,
    bio: artisan.bio,
    region: artisan.region,
    skills: artisan.skills,
    phone: user?.phone,
    email: user?.email,
  };
};

class SellerService {
  /**
   * Get all sellers/artisans with pagination
   */
  static async getAllSellers(page: number = 1, limit: number = 10): Promise<{
    sellers: SellerProfile[];
    totalPages: number;
    totalCount: number;
  }> {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.ARTISANS.BASE}?page=${page}&limit=${limit}`);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ArtisanListResponse = await response.json();
      if (result.success && result.data) {
        return {
          sellers: result.data.artisans.map(transformArtisanToSeller),
          totalPages: result.data.totalPages,
          totalCount: result.data.totalCount,
        };
      }

      return { sellers: [], totalPages: 0, totalCount: 0 };
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
      return { sellers: [], totalPages: 0, totalCount: 0 };
    }
  }

  /**
   * Get a single seller/artisan by ID
   */
  static async getSellerById(sellerId: string): Promise<SellerProfile | null> {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.ARTISANS.BASE}/${sellerId}`);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        return transformArtisanToSeller(result.data);
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch seller:', error);
      return null;
    }
  }

  /**
   * Search sellers by skills
   */
  static async searchBySkills(skills: string[], page: number = 1, limit: number = 10): Promise<{
    sellers: SellerProfile[];
    totalPages: number;
    totalCount: number;
  }> {
    try {
      const skillsParam = skills.join(',');
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.ARTISANS.SEARCH_BY_SKILLS}?skills=${skillsParam}&page=${page}&limit=${limit}`);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ArtisanListResponse = await response.json();
      if (result.success && result.data) {
        return {
          sellers: result.data.artisans.map(transformArtisanToSeller),
          totalPages: result.data.totalPages,
          totalCount: result.data.totalCount,
        };
      }

      return { sellers: [], totalPages: 0, totalCount: 0 };
    } catch (error) {
      console.error('Failed to search sellers by skills:', error);
      return { sellers: [], totalPages: 0, totalCount: 0 };
    }
  }

  /**
   * Search sellers by region
   */
  static async searchByRegion(region: string, page: number = 1, limit: number = 10): Promise<{
    sellers: SellerProfile[];
    totalPages: number;
    totalCount: number;
  }> {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.ARTISANS.SEARCH_BY_REGION}?region=${region}&page=${page}&limit=${limit}`);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ArtisanListResponse = await response.json();
      if (result.success && result.data) {
        return {
          sellers: result.data.artisans.map(transformArtisanToSeller),
          totalPages: result.data.totalPages,
          totalCount: result.data.totalCount,
        };
      }

      return { sellers: [], totalPages: 0, totalCount: 0 };
    } catch (error) {
      console.error('Failed to search sellers by region:', error);
      return { sellers: [], totalPages: 0, totalCount: 0 };
    }
  }

  /**
   * Get top rated sellers
   */
  static async getTopSellers(limit: number = 5): Promise<SellerProfile[]> {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.ARTISANS.BASE}?limit=${limit}`);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ArtisanListResponse = await response.json();
      if (result.success && result.data) {
        return result.data.artisans.map(transformArtisanToSeller);
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch top sellers:', error);
      return [];
    }
  }
}

export default SellerService;
