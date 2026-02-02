'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ListingForm } from '@/components/supplier/ListingForm';
import { getListingById, type FoodListing } from '@/services/listings.api';

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<FoodListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleSuccess = (updatedListing: FoodListing) => {
    router.push(`/dashboard/food-supplier/listings/${updatedListing.id}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-40 bg-gray-200 rounded mb-6" />
          <div className="h-10 bg-gray-200 rounded mb-4" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
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

  // Only allow editing for ACTIVE or PAUSED listings
  if (listing.status !== 'ACTIVE' && listing.status !== 'PAUSED') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <p className="text-yellow-700 mb-4">
            This listing cannot be edited because it is {listing.status.toLowerCase()}.
          </p>
          <Link
            href={`/dashboard/food-supplier/listings/${listing.id}`}
            className="text-orange-600 hover:underline"
          >
            ← Back to listing
          </Link>
        </div>
      </div>
    );
  }

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
        <Link
          href={`/dashboard/food-supplier/listings/${listing.id}`}
          className="hover:text-orange-600 truncate max-w-[150px]"
        >
          {listing.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900">Edit</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-500 mt-1">Update your food listing details.</p>
      </div>

      {/* Form */}
      <ListingForm listing={listing} onSuccess={handleSuccess} />
    </div>
  );
}
