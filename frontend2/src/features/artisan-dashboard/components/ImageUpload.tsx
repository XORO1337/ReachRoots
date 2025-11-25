import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageUploadService from '../../../services/imageUploadService';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
  disabled?: boolean;
}

interface ImagePreview {
  file?: File;
  url: string;
  isUploaded: boolean;
  isUploading?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 5,
  existingImages = [],
  disabled = false
}) => {
  const [images, setImages] = useState<ImagePreview[]>(() => 
    existingImages.map(url => ({ url, isUploaded: true }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validation = imageUploadService.validateFiles(fileArray);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    // Check total image count
    if (images.length + fileArray.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Create preview images
    const newPreviews: ImagePreview[] = fileArray.map(file => ({
      file,
      url: imageUploadService.generatePreviewUrl(file),
      isUploaded: false,
      isUploading: true
    }));

    setImages(prev => [...prev, ...newPreviews]);
    setUploadingCount(prev => prev + fileArray.length);

    // Upload files
    try {
      const uploadResult = await imageUploadService.uploadImages(fileArray);
      
      // Update images with uploaded URLs
      setImages(prev => 
        prev.map(img => {
          const fileIndex = fileArray.findIndex(file => 
            img.file && file.name === img.file.name && file.size === img.file.size
          );
          
          if (fileIndex !== -1 && uploadResult.data.images[fileIndex]) {
            // Clean up preview URL
            if (img.file) {
              imageUploadService.cleanupPreviewUrl(img.url);
            }
            
            return {
              url: uploadResult.data.images[fileIndex].url,
              isUploaded: true,
              isUploading: false
            };
          }
          
          return img;
        })
      );

      // Update parent component with all uploaded URLs
      const allUploadedUrls = images
        .filter(img => img.isUploaded)
        .map(img => img.url)
        .concat(uploadResult.data.urls);
      
      onImagesChange(allUploadedUrls);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
      
      // Remove failed uploads
      setImages(prev => 
        prev.filter(img => !fileArray.some(file => 
          img.file && file.name === img.file.name && file.size === img.file.size
        ))
      );
    } finally {
      setUploadingCount(prev => prev - fileArray.length);
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];
    
    // Clean up preview URL if it's a file preview
    if (imageToRemove.file && !imageToRemove.isUploaded) {
      imageUploadService.cleanupPreviewUrl(imageToRemove.url);
    }
    
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Update parent component
    const uploadedUrls = newImages
      .filter(img => img.isUploaded)
      .map(img => img.url);
    onImagesChange(uploadedUrls);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!disabled) {
      const files = e.dataTransfer.files;
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Product Images (Optional)
      </label>
      
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            Drop images here or click to select
          </p>
          <p className="text-xs text-gray-500">
            JPEG, PNG, GIF, WebP • Max 5MB each • Up to {maxImages} images
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {image.isUploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : (
                  <img
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Remove button */}
              {!image.isUploading && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {/* Upload status indicator */}
              {image.isUploaded && (
                <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploadingCount > 0 && (
        <div className="flex items-center space-x-2 text-sm text-orange-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}...</span>
        </div>
      )}

      {/* Status message */}
      <p className="text-xs text-gray-500">
        {images.length} of {maxImages} images selected
      </p>
    </div>
  );
};

export default ImageUpload;
