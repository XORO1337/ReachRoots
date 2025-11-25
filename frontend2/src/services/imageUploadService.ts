import { api } from '../utils/api';

export interface ImageUploadResponse {
  success: boolean;
  data: {
    images: Array<{
      fileId: string;
      name: string;
      url: string;
      thumbnailUrl: string;
      size: number;
      width: number;
      height: number;
    }>;
    urls: string[];
  };
}

export interface ImageKitAuthParams {
  signature: string;
  expire: number;
  token: string;
}

class ImageUploadService {
  // Upload images through the backend
  async uploadImages(files: File[]): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      // Set content type to multipart/form-data by not setting it explicitly
      // The browser will set it with the boundary
      const response = await api.post('/api/artisan-dashboard/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to upload images'
      );
    }
  }

  // Upload a single image
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    return this.uploadImages([file]);
  }

  // Get ImageKit authentication parameters for direct frontend uploads
  async getAuthParameters(): Promise<ImageKitAuthParams> {
    try {
      const response = await api.get('/api/artisan-dashboard/upload/auth');
      return response.data.data;
    } catch (error: any) {
      console.error('Get auth parameters error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get authentication parameters'
      );
    }
  }

  // Validate file before upload
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image size must be less than 5MB'
      };
    }

    return { isValid: true };
  }

  // Validate multiple files
  validateFiles(files: File[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (files.length === 0) {
      errors.push('No files selected');
    }

    if (files.length > 5) {
      errors.push('Maximum 5 images allowed');
    }

    files.forEach((file, index) => {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate preview URL for a file
  generatePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Clean up preview URLs
  cleanupPreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  // Transform ImageKit URL with transformations
  getTransformedUrl(
    originalUrl: string,
    transformations: Record<string, string | number>
  ): string {
    try {
      const url = new URL(originalUrl);
      const searchParams = new URLSearchParams();

      Object.entries(transformations).forEach(([key, value]) => {
        searchParams.append(key, value.toString());
      });

      url.search = searchParams.toString();
      return url.toString();
    } catch (error) {
      console.error('URL transformation error:', error);
      return originalUrl; // fallback to original
    }
  }

  // Get thumbnail URL
  getThumbnailUrl(originalUrl: string, width = 200, height = 200): string {
    return this.getTransformedUrl(originalUrl, {
      'tr': `w-${width},h-${height},c-at_max`
    });
  }
}

export default new ImageUploadService();
