'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import {
  getPublicListingById,
  getListingImageUrl,
  type FoodListing,
} from '@/services/listings.api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<FoodListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await axios.post(
        `${API_URL}/claims`,
        { listingId: listing.id, quantity },
        { withCredentials: true }
      );
      setSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.message || 'Failed to create claim. Please try again.');
      } else {
        setSubmitError('Failed to create claim. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num === 0 ? 'Free' : `$${num.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Claim Submitted!</h2>
          <p className="text-gray-500 mb-6">
            We&apos;ve sent a pickup OTP to your email. Show this OTP to the supplier when you pick up your order.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              View My Claims
            </Link>
            <Link
              href="/hub"
              className="block px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Browse More Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const unitPrice = parseFloat(listing.subsidizedPrice);
  const totalPrice = unitPrice * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/hub" className="hover:text-green-600">Donation Hub</Link>
            <span>/</span>
            <Link href={`/hub/${listing.id}`} className="hover:text-green-600">{listing.title}</Link>
            <span>/</span>
            <span className="text-gray-900">Claim</span>
          </nav>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Listing Summary */}
          <div className="flex gap-4 p-6 border-b border-gray-100">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              {listing.imageKeys?.[0] ? (
                <Image
                  src={getListingImageUrl(listing.imageKeys[0], { width: 100, height: 100 })}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{listing.title}</h2>
              <p className="text-sm text-gray-500">{listing.organization?.name}</p>
              <p className="text-green-600 font-medium mt-1">
                {formatPrice(listing.subsidizedPrice)} per {listing.unit}
              </p>
            </div>
          </div>

          {/* Claim Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Complete Your Claim</h3>

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
                {submitError}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity ({listing.unit})
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(listing.remainingStock, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={listing.remainingStock}
                  className="w-20 text-center px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(listing.remainingStock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">
                  Max: {listing.remainingStock}
                </span>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Unit Price</span>
                <span className="font-medium">{formatPrice(listing.subsidizedPrice)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Quantity</span>
                <span className="font-medium">× {quantity}</span>
              </div>
              <div className="border-t border-gray-200 my-2" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-green-600">
                  {totalPrice === 0 ? 'Free' : `$${totalPrice.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>📧 OTP Verification:</strong> After claiming, you&apos;ll receive an OTP via email. 
                Show this to the supplier when picking up your order.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Claim'}
              </button>
              <Link
                href={`/hub/${listing.id}`}
                className="px-6 py-4 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
