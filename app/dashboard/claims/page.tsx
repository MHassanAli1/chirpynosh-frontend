'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { getListingImageUrl, type FoodListing, type ClaimStatus } from '@/services/listings.api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface MyClaim {
  id: string;
  listingId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: ClaimStatus;
  createdAt: string;
  pickedUpAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  listing?: Partial<FoodListing>;
}

type TabStatus = 'all' | ClaimStatus;

const STATUS_BADGES: Record<ClaimStatus, { label: string; className: string; icon: string }> = {
  PENDING: { label: 'Pending Pickup', className: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700', icon: '✅' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700', icon: '❌' },
  EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-700', icon: '⏰' },
};

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<MyClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const { data } = await axios.get(`${API_URL}/claims`, {
        params,
        withCredentials: true,
      });
      setClaims(data.claims || []);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
      setError('Failed to load claims');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleCancel = async (claimId: string) => {
    if (!confirm('Are you sure you want to cancel this claim?')) return;
    
    setActionLoading(claimId);
    try {
      await axios.post(
        `${API_URL}/claims/${claimId}/cancel`,
        { reason: 'Cancelled by user' },
        { withCredentials: true }
      );
      await fetchClaims();
    } catch (err) {
      console.error('Failed to cancel claim:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendOtp = async (claimId: string) => {
    setActionLoading(claimId);
    try {
      await axios.post(`${API_URL}/claims/${claimId}/resend-otp`, {}, { withCredentials: true });
      alert('OTP resent to your email!');
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num === 0 ? 'Free' : `$${num.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const tabs: { value: TabStatus; label: string; count?: number }[] = [
    { value: 'all', label: 'All Claims' },
    {
      value: 'PENDING',
      label: 'Pending',
      count: claims.filter(c => c.status === 'PENDING').length,
    },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const filteredClaims = activeTab === 'all' ? claims : claims.filter(c => c.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-500">Track your food donations and pickups</p>
        </div>
        <Link
          href="/hub"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          🍽️ Browse Listings
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredClaims.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
          <p className="text-gray-500 mb-6">
            {activeTab === 'PENDING'
              ? 'You don\'t have any pending pickups'
              : 'Start by browsing the donation hub and claiming some food!'}
          </p>
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Browse Donation Hub
          </Link>
        </div>
      )}

      {/* Claims List */}
      {!isLoading && filteredClaims.length > 0 && (
        <div className="space-y-4">
          {filteredClaims.map((claim) => {
            const listing = claim.listing;
            const badge = STATUS_BADGES[claim.status];
            const isPending = claim.status === 'PENDING';

            return (
              <div
                key={claim.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="relative w-full sm:w-40 h-32 sm:h-auto flex-shrink-0">
                    {listing?.imageKeys?.[0] ? (
                      <Image
                        src={getListingImageUrl(listing.imageKeys[0], { width: 200, height: 150 })}
                        alt={listing.title || 'Food listing'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-3xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <Link
                          href={`/hub/${claim.listingId}`}
                          className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                        >
                          {listing?.title || 'Food Listing'}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {claim.quantity} {listing?.unit || 'items'} • {formatPrice(claim.totalPrice)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                        <span>{badge.icon}</span> {badge.label}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="text-sm text-gray-500 mb-4">
                      <p>Claimed: {formatDate(claim.createdAt)}</p>
                      {claim.pickedUpAt && <p>Picked up: {formatDate(claim.pickedUpAt)}</p>}
                      {claim.cancelledAt && (
                        <p className="text-red-500">
                          Cancelled: {formatDate(claim.cancelledAt)}
                          {claim.cancelReason && ` - ${claim.cancelReason}`}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleResendOtp(claim.id)}
                          disabled={actionLoading === claim.id}
                          className="px-4 py-2 text-sm border border-green-200 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === claim.id ? 'Sending...' : '📧 Resend OTP'}
                        </button>
                        <button
                          onClick={() => handleCancel(claim.id)}
                          disabled={actionLoading === claim.id}
                          className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          Cancel Claim
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
