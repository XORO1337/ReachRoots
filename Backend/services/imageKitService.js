const multer = require('multer');
const ImageKit = require('imagekit');

class ImageKitService {
  constructor() {
    // Check if ImageKit credentials are available
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      console.warn('ImageKit credentials not found. Image upload functionality will be disabled.');
      this.imagekit = null;
      return;
    }

    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
  }

  // Check if ImageKit is properly initialized
  _checkInitialization() {
    if (!this.imagekit) {
      throw new Error('ImageKit is not properly configured. Please check your environment variables.');
    }
  }

  // Upload image to ImageKit
  async uploadImage(file, fileName, folder = 'products') {
    try {
      this._checkInitialization();
      
      const uploadResponse = await this.imagekit.upload({
        file: file.buffer || file, // buffer for multer files
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true,
        extensions: [
          {
            name: 'google-auto-tagging',
            maxTags: 5,
            minConfidence: 95
          }
        ]
      });

      return {
        success: true,
        data: {
          fileId: uploadResponse.fileId,
          name: uploadResponse.name,
          url: uploadResponse.url,
          thumbnailUrl: uploadResponse.thumbnailUrl,
          size: uploadResponse.size,
          width: uploadResponse.width,
          height: uploadResponse.height
        }
      };
    } catch (error) {
      console.error('ImageKit upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files, folder = 'products') {
    try {
      this._checkInitialization();
      
      const uploadPromises = files.map((file, index) => {
        const fileName = `${Date.now()}_${index}_${file.originalname || 'upload'}`;
        return this.uploadImage(file, fileName, folder);
      });

      const results = await Promise.all(uploadPromises);
      return {
        success: true,
        data: results.map(result => result.data)
      };
    } catch (error) {
      console.error('ImageKit multiple upload error:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  // Delete image from ImageKit
  async deleteImage(fileId) {
    try {
      this._checkInitialization();
      
      await this.imagekit.deleteFile(fileId);
      return { success: true };
    } catch (error) {
      console.error('ImageKit delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  // Get image details
  async getImageDetails(fileId) {
    try {
      this._checkInitialization();
      
      const details = await this.imagekit.getFileDetails(fileId);
      return {
        success: true,
        data: details
      };
    } catch (error) {
      console.error('ImageKit get details error:', error);
      throw new Error(`Failed to get image details: ${error.message}`);
    }
  }

  // Transform image URL (resize, crop, etc.)
  getTransformedUrl(originalUrl, transformations) {
    try {
      if (!this.imagekit) {
        console.warn('ImageKit not initialized. Returning original URL.');
        return originalUrl;
      }
      
      return this.imagekit.url({
        src: originalUrl,
        transformation: transformations
      });
    } catch (error) {
      console.error('ImageKit transform error:', error);
      return originalUrl; // fallback to original
    }
  }

  // Get authentication parameters for frontend direct upload
  getAuthenticationParameters() {
    try {
      this._checkInitialization();
      
      const authParams = this.imagekit.getAuthenticationParameters();
      return {
        success: true,
        data: authParams
      };
    } catch (error) {
      console.error('ImageKit auth error:', error);
      throw new Error(`Failed to get authentication parameters: ${error.message}`);
    }
  }
}

module.exports = new ImageKitService();
