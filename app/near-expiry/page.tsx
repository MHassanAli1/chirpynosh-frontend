'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  browseListings,
  type FoodListing,
} from '@/services/listings.api';
import { ListingCard, ListingCardSkeleton } from '@/components/listings';

export default function NearExpiryPage() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNearExpiryListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch listings sorted by expiry date (soonest first)
      const response = await browseListings({
        page: 1,
        limit: 50,
        sortBy: 'expiresAt',
        sortOrder: 'asc',
      });
      
      // Filter to only show items expiring within 48 hours
      const now = new Date();
      const nearExpiryListings = (response.listings || []).filter((listing: FoodListing) => {
        const expiresAt = new Date(listing.expiresAt);
        const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilExpiry > 0 && hoursUntilExpiry <= 48;
      });
      
      setListings(nearExpiryListings);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Unable to connect to server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNearExpiryListings();
  }, [fetchNearExpiryListings]);

  return (
    <div 
      className="min-h-screen pt-24 pb-16"
      style={{ background: 'linear-gradient(180deg, #F4FFF8 0%, #ECFDF3 50%, #ffffff 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Near Expiry</h1>
          </div>
          <p className="text-gray-600 pl-13">
            Items expiring within 48 hours — save food, reduce waste
          </p>
        </div>

        {/* Urgency Indicator */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Critical (0-6h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm font-medium text-gray-700">Urgent (6-24h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-sm font-medium text-gray-700">Soon (24-48h)</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && listings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              No food items are nearing expiry right now. Check back later.
            </p>
            <Link href="/hub" className="text-[#16A34A] hover:underline font-medium">
              Browse all listings →
            </Link>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} variant="urgent" ctaText="Reserve Now" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
