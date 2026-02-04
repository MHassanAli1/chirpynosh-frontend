'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  uploadListingImage,
  uploadListingVideo,
  deleteUploadedMedia,
  getListingImageUrl,
  getVideoThumbnailUrl,
} from '@/services/listings.api';

interface MediaUploadProps {
  imageKeys: string[];
  videoKey: string | null;
  onImagesChange: (keys: string[]) => void;
  onVideoChange: (key: string | null) => void;
  maxImages?: number;
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  type: 'image' | 'video';
}

export function MediaUpload({
  imageKeys,
  videoKey,
  onImagesChange,
  onVideoChange,
  maxImages = 5,
  disabled = false,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(
    async (files: FileList) => {
      if (imageKeys.length + files.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      setError(null);
      const newUploading: UploadingFile[] = [];

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed');
          continue;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          setError('Image must be less than 10MB');
          continue;
        }

        const uploadId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        newUploading.push({ id: uploadId, file, progress: 0, type: 'image' });
      }

      setUploading((prev) => [...prev, ...newUploading]);

      // Upload all files
      const uploadedKeys: string[] = [];
      for (const upload of newUploading) {
        try {
          setUploading((prev) =>
            prev.map((u) => (u.id === upload.id ? { ...u, progress: 50 } : u))
          );

          const result = await uploadListingImage(upload.file);
          uploadedKeys.push(result.publicId);

          setUploading((prev) =>
            prev.map((u) => (u.id === upload.id ? { ...u, progress: 100 } : u))
          );
        } catch (err) {
          console.error('Image upload failed:', err);
          setError('Failed to upload image');
        } finally {
          setUploading((prev) => prev.filter((u) => u.id !== upload.id));
        }
      }

      if (uploadedKeys.length > 0) {
        onImagesChange([...imageKeys, ...uploadedKeys]);
      }
    },
    [imageKeys, maxImages, onImagesChange]
  );

  const handleVideoUpload = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Only video files are allowed');
        return;
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setError('Video must be less than 50MB');
        return;
      }

      setError(null);
      const uploadId = `vid_${Date.now()}`;
      setUploading((prev) => [...prev, { id: uploadId, file, progress: 0, type: 'video' }]);

      try {
        setUploading((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: 30 } : u))
        );

        const result = await uploadListingVideo(file);

        setUploading((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: 100 } : u))
        );

        onVideoChange(result.publicId);
      } catch (err) {
        console.error('Video upload failed:', err);
        setError('Failed to upload video');
      } finally {
        setUploading((prev) => prev.filter((u) => u.id !== uploadId));
      }
    },
    [onVideoChange]
  );

  const removeImage = useCallback(
    async (keyToRemove: string) => {
      try {
        await deleteUploadedMedia(keyToRemove);
      } catch (err) {
        console.error('Failed to delete image:', err);
      }
      onImagesChange(imageKeys.filter((key) => key !== keyToRemove));
    },
    [imageKeys, onImagesChange]
  );

  const removeVideo = useCallback(async () => {
    if (videoKey) {
      try {
        await deleteUploadedMedia(videoKey);
      } catch (err) {
        console.error('Failed to delete video:', err);
      }
      onVideoChange(null);
    }
  }, [videoKey, onVideoChange]);

  const isUploadingImages = uploading.some((u) => u.type === 'image');
  const isUploadingVideo = uploading.some((u) => u.type === 'video');

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Images Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images <span className="text-red-500">*</span>
          <span className="text-gray-700 font-medium ml-1">
            ({imageKeys.length}/{maxImages})
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {/* Existing Images */}
          {imageKeys.map((key, index) => (
            <div
              key={key}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
            >
              <Image
                src={getListingImageUrl(key, { width: 200, height: 200 })}
                alt={`Listing image ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === 0 && (
                <span className="absolute top-1 left-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  Main
                </span>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(key)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* Uploading Images */}
          {uploading
            .filter((u) => u.type === 'image')
            .map((upload) => (
              <div
                key={upload.id}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-500 mt-2">{upload.progress}%</span>
                </div>
              </div>
            ))}

          {/* Add Image Button */}
          {imageKeys.length < maxImages && !disabled && (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploadingImages}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs mt-1">Add Image</span>
            </button>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          disabled={disabled}
        />

        <p className="text-xs text-gray-700 font-medium mt-2">
          Upload 1-5 images (max 10MB each). First image will be the main display image.
        </p>
      </div>

      {/* Video Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video <span className="text-gray-600 font-medium">(optional)</span>
        </label>

        {videoKey ? (
          <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-gray-200 group">
            <Image
              src={getVideoThumbnailUrl(videoKey, { width: 400, height: 225 })}
              alt="Video thumbnail"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : isUploadingVideo ? (
          <div className="w-full max-w-md aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500 mt-3">Uploading video...</span>
          </div>
        ) : !disabled ? (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="w-full max-w-md aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 transition-colors"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm mt-2">Add Video</span>
          </button>
        ) : null}

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
          disabled={disabled}
        />

        <p className="text-xs text-gray-500 mt-2">
          Upload a short video showcasing your food (max 50MB, recommended under 30 seconds).
        </p>
      </div>
    </div>
  );
}
