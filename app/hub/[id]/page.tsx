'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  getPublicListingById,
  getListingImageUrl,
  getListingVideoUrl,
  type FoodListing,
} from '@/services/listings.api';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<FoodListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const response = await getPublicListingById(listingId);
        setListing(response.listing);
      } catch (err) {
        console.error('Failed to fetch listing:', err);
        setError('Listing not found or no longer available');
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num === 0 ? 'Free' : `$${num.toFixed(2)}`;
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="aspect-video bg-gray-200 rounded-xl mb-6" />
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/hub"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Browse Listings
          </Link>
        </div>
      </div>
    );
  }

  const claimerTypeLabel = {
    NGO: 'NGOs Only',
    INDIVIDUAL: 'Individuals Only',
    BOTH: 'Everyone',
  }[listing.claimerType];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/hub" className="hover:text-green-600">Donation Hub</Link>
            <span>/</span>
            <span className="text-gray-900">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Media Gallery */}
          <div>
            {/* Main Image/Video */}
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
              {showVideo && listing.videoKey ? (
                <video
                  src={getListingVideoUrl(listing.videoKey)}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : listing.imageKeys?.[selectedImage] ? (
                <Image
                  src={getListingImageUrl(listing.imageKeys[selectedImage], { width: 800, height: 800 })}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">🍽️</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {(listing.imageKeys?.length > 1 || listing.videoKey) && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.imageKeys?.map((key, index) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedImage(index); setShowVideo(false); }}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index && !showVideo
                        ? 'border-green-500'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={getListingImageUrl(key, { width: 100, height: 100 })}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
                {listing.videoKey && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 bg-gray-900 flex items-center justify-center transition-all ${
                      showVideo ? 'border-green-500' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">▶️</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Title & Supplier */}
            <div className="mb-6">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                {listing.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 mb-2">
                {listing.title}
              </h1>
              <p className="text-gray-800 font-medium">
                by <span className="font-semibold text-gray-900">{listing.organization?.name}</span>
              </p>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(listing.subsidizedPrice)}
                </span>
                {parseFloat(listing.subsidizedPrice) < parseFloat(listing.originalPrice) && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(listing.originalPrice)}
                  </span>
                )}
                <span className="text-gray-800 font-medium">per {listing.unit}</span>
              </div>
              <p className="text-sm text-gray-800 font-medium">
                {listing.remainingStock} of {listing.totalStock} {listing.unit} remaining
              </p>
            </div>

            {/* Pickup Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">📍 Pickup Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-gray-400">🕐</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Pickup Window</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {formatDate(listing.pickupStartAt)} — {formatDate(listing.pickupEndAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400">⏰</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Expires</p>
                    <p className="text-sm text-gray-800 font-medium">{formatDate(listing.expiresAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400">👥</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Available For</p>
                    <p className="text-sm text-gray-800 font-medium">{claimerTypeLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-800 whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-4">
              <Link
                href={`/hub/${listing.id}/claim`}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold text-center hover:bg-green-700 transition-colors"
              >
                Claim Now
              </Link>
              <button
                onClick={() => router.back()}
                className="px-6 py-4 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
