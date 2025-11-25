import { API_CONFIG, buildApiUrl } from '../config/api';

export interface ArtisanProfile {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  bio?: string;
  region: string;
  skills: string[];
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ArtisansResponse {
  success: boolean;
  message: string;
  data?: {
    artisans: ArtisanProfile[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

const defaultHeaders = {
  'Content-Type': 'application/json',
};

class ArtisanService {
  static async getTopArtisans(limit: number = 5): Promise<ArtisanProfile[]> {
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

      const result: ArtisansResponse = await response.json();
      if (result.success && result.data) {
        return result.data.artisans.slice(0, limit);
      }

      throw new Error(result.message || 'Unable to fetch artisans');
    } catch (error) {
      console.error('Failed to fetch top artisans:', error);
      return [];
    }
  }
}

export default ArtisanService;
