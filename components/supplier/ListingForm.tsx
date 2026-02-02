'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MediaUpload } from './MediaUpload';
import {
  createListing,
  updateListing,
  type CreateListingPayload,
  type UpdateListingPayload,
  type FoodListing,
  type ClaimerType,
} from '@/services/listings.api';

interface ListingFormProps {
  listing?: FoodListing;
  onSuccess?: (listing: FoodListing) => void;
}

const CATEGORIES = [
  'Cooked Meals',
  'Bakery & Bread',
  'Fresh Produce',
  'Dairy Products',
  'Packaged Foods',
  'Beverages',
  'Snacks',
  'Groceries',
  'Other',
];

const UNITS = ['Portions', 'Boxes', 'Plates', 'KG', 'Packs', 'Bags', 'Liters', 'Units'];

export function ListingForm({ listing, onSuccess }: ListingFormProps) {
  const router = useRouter();
  const isEditing = !!listing;

  // Form state
  const [formData, setFormData] = useState({
    title: listing?.title || '',
    description: listing?.description || '',
    category: listing?.category || '',
    totalStock: listing?.totalStock || 1,
    unit: listing?.unit || 'Portions',
    originalPrice: listing ? parseFloat(listing.originalPrice) : 0,
    subsidizedPrice: listing ? parseFloat(listing.subsidizedPrice) : 0,
    claimerType: (listing?.claimerType || 'BOTH') as ClaimerType,
    pickupStartAt: listing?.pickupStartAt
      ? new Date(listing.pickupStartAt).toISOString().slice(0, 16)
      : '',
    pickupEndAt: listing?.pickupEndAt
      ? new Date(listing.pickupEndAt).toISOString().slice(0, 16)
      : '',
    expiresAt: listing?.expiresAt
      ? new Date(listing.expiresAt).toISOString().slice(0, 16)
      : '',
  });

  const [imageKeys, setImageKeys] = useState<string[]>(listing?.imageKeys || []);
  const [videoKey, setVideoKey] = useState<string | null>(listing?.videoKey || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
    },
    []
  );

  const validateForm = useCallback(() => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.category) return 'Category is required';
    if (formData.totalStock < 1) return 'Stock must be at least 1';
    if (formData.subsidizedPrice > formData.originalPrice) {
      return 'Subsidized price cannot exceed original price';
    }
    if (!formData.pickupStartAt) return 'Pickup start time is required';
    if (!formData.pickupEndAt) return 'Pickup end time is required';
    if (!formData.expiresAt) return 'Expiry time is required';
    if (new Date(formData.pickupEndAt) <= new Date(formData.pickupStartAt)) {
      return 'Pickup end time must be after start time';
    }
    if (new Date(formData.expiresAt) <= new Date()) {
      return 'Expiry time must be in the future';
    }
    if (imageKeys.length === 0) return 'At least one image is required';
    return null;
  }, [formData, imageKeys]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        category: formData.category,
        totalStock: formData.totalStock,
        unit: formData.unit,
        originalPrice: formData.originalPrice,
        subsidizedPrice: formData.subsidizedPrice,
        claimerType: formData.claimerType,
        pickupStartAt: new Date(formData.pickupStartAt).toISOString(),
        pickupEndAt: new Date(formData.pickupEndAt).toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        imageKeys,
        videoKey: videoKey || undefined,
      };

      let result;
      if (isEditing) {
        result = await updateListing(listing.id, payload as UpdateListingPayload);
      } else {
        result = await createListing(payload as CreateListingPayload);
      }

      if (onSuccess) {
        onSuccess(result.listing);
      } else {
        router.push('/dashboard/food-supplier/listings');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save listing';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Media Upload Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos & Video</h3>
        <MediaUpload
          imageKeys={imageKeys}
          videoKey={videoKey}
          onImagesChange={setImageKeys}
          onVideoChange={setVideoKey}
          disabled={isSubmitting}
        />
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Fresh Bakery Items - End of Day"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what's included, any dietary information, etc."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description?.length || 0}/500 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stock & Pricing */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock & Pricing</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Stock */}
          <div>
            <label htmlFor="totalStock" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="totalStock"
              name="totalStock"
              value={formData.totalStock}
              onChange={handleInputChange}
              min={1}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Original Price */}
          <div>
            <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Original Price (per unit)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                min={0}
                step="0.01"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Subsidized Price */}
          <div>
            <label htmlFor="subsidizedPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Subsidized Price (per unit)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="subsidizedPrice"
                name="subsidizedPrice"
                value={formData.subsidizedPrice}
                onChange={handleInputChange}
                min={0}
                step="0.01"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Set to 0 for free donations</p>
          </div>
        </div>

        {formData.subsidizedPrice < formData.originalPrice && formData.originalPrice > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              💚{' '}
              {Math.round(
                ((formData.originalPrice - formData.subsidizedPrice) / formData.originalPrice) * 100
              )}
              % discount applied!{' '}
              {formData.subsidizedPrice === 0 ? '(Free donation)' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Who Can Claim */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Who Can Claim</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'BOTH', label: 'Everyone', desc: 'NGOs & Individuals' },
            { value: 'NGO', label: 'NGOs Only', desc: 'Verified organizations' },
            { value: 'INDIVIDUAL', label: 'Individuals Only', desc: 'Personal pickups' },
          ].map((option) => (
            <label
              key={option.value}
              className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formData.claimerType === option.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="claimerType"
                value={option.value}
                checked={formData.claimerType === option.value}
                onChange={handleInputChange}
                className="sr-only"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
              <span className="text-xs text-gray-500">{option.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pickup & Expiry */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Window & Expiry</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pickup Start */}
          <div>
            <label htmlFor="pickupStartAt" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Start <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="pickupStartAt"
              name="pickupStartAt"
              value={formData.pickupStartAt}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Pickup End */}
          <div>
            <label htmlFor="pickupEndAt" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup End <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="pickupEndAt"
              name="pickupEndAt"
              value={formData.pickupEndAt}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Expiry */}
          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
              Food Expiry <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="expiresAt"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 Set pickup window when recipients can collect the food. Expiry is when the food is no
          longer safe to consume.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : isEditing ? (
            'Update Listing'
          ) : (
            'Create Listing'
          )}
        </button>
      </div>
    </form>
  );
}
