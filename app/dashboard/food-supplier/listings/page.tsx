'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getMyListings,
  pauseListing,
  resumeListing,
  deleteListing,
  getListingImageUrl,
  type FoodListing,
  type ListingStatus,
} from '@/services/listings.api';

type TabStatus = 'all' | ListingStatus;

const STATUS_BADGES: Record<ListingStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700' },
  SOLD_OUT: { label: 'Sold Out', className: 'bg-gray-100 text-gray-700' },
  EXPIRED: { label: 'Expired', className: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
};

export default function SupplierListingsPage() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const response = await getMyListings(params);
      setListings(response.listings || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handlePauseResume = async (listing: FoodListing) => {
    setActionLoading(listing.id);
    try {
      if (listing.status === 'ACTIVE') {
        await pauseListing(listing.id);
      } else if (listing.status === 'PAUSED') {
        await resumeListing(listing.id);
      }
      await fetchListings();
    } catch (err) {
      console.error('Failed to update listing:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (listing: FoodListing) => {
    if (!confirm('Are you sure you want to cancel this listing? This cannot be undone.')) {
      return;
    }
    setActionLoading(listing.id);
    try {
      await deleteListing(listing.id);
      await fetchListings();
    } catch (err) {
      console.error('Failed to delete listing:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const tabs: { value: TabStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'SOLD_OUT', label: 'Sold Out' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500">Manage your food donations</p>
        </div>
        <Link
          href="/dashboard/food-supplier/add"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors font-medium"
        >
          <span className="text-lg">+</span>
          Add Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
          <button onClick={fetchListings} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && listings.length === 0 && (
        <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-500 mb-6">
            Start sharing your surplus food with those who need it.
          </p>
          <Link
            href="/dashboard/food-supplier/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors font-medium"
          >
            <span>+</span>
            Create Your First Listing
          </Link>
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onPauseResume={handlePauseResume}
              onDelete={handleDelete}
              isLoading={actionLoading === listing.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ListingCardProps {
  listing: FoodListing;
  onPauseResume: (listing: FoodListing) => void;
  onDelete: (listing: FoodListing) => void;
  isLoading: boolean;
}

function ListingCard({ listing, onPauseResume, onDelete, isLoading }: ListingCardProps) {
  const badge = STATUS_BADGES[listing.status];
  const mainImage = listing.imageKeys?.[0];
  const stockPercent = (listing.remainingStock / listing.totalStock) * 100;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-video bg-gray-100">
        {mainImage ? (
          <Image
            src={getListingImageUrl(mainImage, { width: 400, height: 225 })}
            alt={listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span className="text-4xl">📷</span>
          </div>
        )}
        {/* Status Badge */}
        <span
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
        {/* Image count */}
        {listing.imageKeys && listing.imageKeys.length > 1 && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white rounded-full text-xs">
            +{listing.imageKeys.length - 1} photos
          </span>
        )}
        {/* Video indicator */}
        {listing.videoKey && (
          <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white rounded-full text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Video
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
        <p className="text-sm text-gray-500">{listing.category}</p>

        {/* Stock */}
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Stock</span>
            <span className="font-medium">
              {listing.remainingStock}/{listing.totalStock} {listing.unit}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold text-orange-600">
            ${parseFloat(listing.subsidizedPrice).toFixed(2)}
          </span>
          {parseFloat(listing.subsidizedPrice) < parseFloat(listing.originalPrice) && (
            <span className="text-sm text-gray-400 line-through">
              ${parseFloat(listing.originalPrice).toFixed(2)}
            </span>
          )}
          <span className="text-xs text-gray-500">per {listing.unit.toLowerCase()}</span>
        </div>

        {/* Pickup Window */}
        <div className="text-xs text-gray-500 mt-2">
          📍 Pickup: {formatDate(listing.pickupStartAt)} - {formatDate(listing.pickupEndAt)}
        </div>

        {/* Claims */}
        {listing._count && listing._count.claims > 0 && (
          <div className="text-xs text-green-600 mt-1">
            ✓ {listing._count.claims} claim{listing._count.claims !== 1 ? 's' : ''}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/dashboard/food-supplier/listings/${listing.id}`}
            className="flex-1 text-center py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            View
          </Link>
          {(listing.status === 'ACTIVE' || listing.status === 'PAUSED') && (
            <>
              <button
                onClick={() => onPauseResume(listing)}
                disabled={isLoading}
                className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? '...' : listing.status === 'ACTIVE' ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => onDelete(listing)}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                🗑
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
