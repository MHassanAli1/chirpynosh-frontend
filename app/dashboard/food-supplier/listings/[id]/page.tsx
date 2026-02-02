'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  getListingById,
  pauseListing,
  resumeListing,
  deleteListing,
  getListingImageUrl,
  getListingVideoUrl,
  getVideoThumbnailUrl,
  type FoodListing,
} from '@/services/listings.api';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<FoodListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const response = await getListingById(listingId);
        setListing(response.listing);
      } catch (err) {
        console.error('Failed to fetch listing:', err);
        setError('Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const handlePauseResume = async () => {
    if (!listing) return;
    setActionLoading(true);
    try {
      let response;
      if (listing.status === 'ACTIVE') {
        response = await pauseListing(listing.id);
      } else {
        response = await resumeListing(listing.id);
      }
      setListing(response.listing);
    } catch (err) {
      console.error('Failed to update listing:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    if (!confirm('Are you sure you want to cancel this listing? This cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteListing(listing.id);
      router.push('/dashboard/food-supplier/listings');
    } catch (err) {
      console.error('Failed to delete listing:', err);
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="aspect-video bg-gray-200 rounded-xl mb-6" />
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-700 mb-4">{error || 'Listing not found'}</p>
          <Link
            href="/dashboard/food-supplier/listings"
            className="text-orange-600 hover:underline"
          >
            ← Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const stockPercent = (listing.remainingStock / listing.totalStock) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard/food-supplier" className="hover:text-orange-600">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/dashboard/food-supplier/listings" className="hover:text-orange-600">
          Listings
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Section */}
        <div className="space-y-4">
          {/* Main Image/Video */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            {showVideo && listing.videoKey ? (
              <video
                src={getListingVideoUrl(listing.videoKey)}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
              />
            ) : listing.imageKeys && listing.imageKeys[selectedImage] ? (
              <Image
                src={getListingImageUrl(listing.imageKeys[selectedImage], { width: 800, height: 800 })}
                alt={listing.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <span className="text-6xl">📷</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {(listing.imageKeys?.length > 0 || listing.videoKey) && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {listing.imageKeys?.map((key, index) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedImage(index);
                    setShowVideo(false);
                  }}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index && !showVideo
                      ? 'border-orange-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={getListingImageUrl(key, { width: 64, height: 64 })}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
              {listing.videoKey && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    showVideo ? 'border-orange-500' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={getVideoThumbnailUrl(listing.videoKey, { width: 64, height: 64 })}
                    alt="Video"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Status & Title */}
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                listing.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : listing.status === 'PAUSED'
                    ? 'bg-yellow-100 text-yellow-700'
                    : listing.status === 'SOLD_OUT'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
              }`}
            >
              {listing.status}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            <p className="text-gray-500">{listing.category}</p>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
              <p className="text-gray-600">{listing.description}</p>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-orange-600">
              ${parseFloat(listing.subsidizedPrice).toFixed(2)}
            </span>
            {parseFloat(listing.subsidizedPrice) < parseFloat(listing.originalPrice) && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ${parseFloat(listing.originalPrice).toFixed(2)}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                  {Math.round(
                    ((parseFloat(listing.originalPrice) - parseFloat(listing.subsidizedPrice)) /
                      parseFloat(listing.originalPrice)) *
                      100
                  )}
                  % off
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Stock Available</span>
              <span className="font-semibold">
                {listing.remainingStock} / {listing.totalStock} {listing.unit}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  stockPercent > 50
                    ? 'bg-green-500'
                    : stockPercent > 20
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${stockPercent}%` }}
              />
            </div>
          </div>

          {/* Who Can Claim */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Who Can Claim</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                listing.claimerType === 'BOTH'
                  ? 'bg-blue-100 text-blue-700'
                  : listing.claimerType === 'NGO'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-teal-100 text-teal-700'
              }`}
            >
              {listing.claimerType === 'BOTH'
                ? '👥 Everyone (NGOs & Individuals)'
                : listing.claimerType === 'NGO'
                  ? '🏢 NGOs Only'
                  : '👤 Individuals Only'}
            </span>
          </div>

          {/* Pickup Window */}
          <div className="bg-orange-50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-orange-700 mb-2">📍 Pickup Window</h3>
            <p className="text-orange-900">
              {formatDate(listing.pickupStartAt)} → {formatDate(listing.pickupEndAt)}
            </p>
          </div>

          {/* Expiry */}
          <div className="text-sm text-gray-500">
            ⏰ Food expires: {formatDate(listing.expiresAt)}
          </div>

          {/* Actions */}
          {(listing.status === 'ACTIVE' || listing.status === 'PAUSED') && (
            <div className="flex gap-3 pt-4">
              <Link
                href={`/dashboard/food-supplier/listings/${listing.id}/edit`}
                className="flex-1 py-3 text-center font-medium text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={handlePauseResume}
                disabled={actionLoading}
                className="flex-1 py-3 font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {actionLoading ? '...' : listing.status === 'ACTIVE' ? '⏸️ Pause' : '▶️ Resume'}
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-3 font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Claims Section */}
      {listing._count && listing._count.claims > 0 && (
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Claims ({listing._count.claims})
            </h2>
            <Link
              href={`/dashboard/food-supplier/claims?listingId=${listing.id}`}
              className="text-orange-600 hover:underline text-sm font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
