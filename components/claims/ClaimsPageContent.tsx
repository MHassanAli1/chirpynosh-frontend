'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { claimsApi, type MyClaim } from '@/services/claims.api';
import { getListingImageUrl, type ClaimStatus } from '@/services/listings.api';

type TabStatus = 'all' | ClaimStatus;

const STATUS_BADGES: Record<ClaimStatus, { label: string; className: string; icon: string }> = {
  PENDING: { label: 'Pending Pickup', className: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700', icon: '✅' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700', icon: '❌' },
  EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-700', icon: '⏰' },
};

interface ClaimsPageProps {
  title?: string;
  accentColor?: 'green' | 'blue';
  showOrgColumn?: boolean;
}

export default function ClaimsPageContent({ 
  title = 'My Claims', 
  accentColor = 'green',
  showOrgColumn = false,
}: ClaimsPageProps) {
  const [claims, setClaims] = useState<MyClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const colorClasses = {
    green: {
      button: 'bg-green-600 hover:bg-green-700',
      tab: 'border-green-500 text-green-600',
      badge: 'bg-green-100 text-green-600',
      link: 'text-green-600 hover:text-green-700',
      spinner: 'border-green-200 border-t-green-500',
    },
    blue: {
      button: 'bg-blue-600 hover:bg-blue-700',
      tab: 'border-blue-500 text-blue-600',
      badge: 'bg-blue-100 text-blue-600',
      link: 'text-blue-600 hover:text-blue-700',
      spinner: 'border-blue-200 border-t-blue-500',
    },
  }[accentColor];

  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const response = await claimsApi.getClaims(params);
      setClaims(response.claims || []);
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
      await claimsApi.cancelClaim(claimId);
      await fetchClaims();
    } catch (err) {
      console.error('Failed to cancel claim:', err);
      alert('Failed to cancel claim. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendOtp = async (claimId: string) => {
    setActionLoading(claimId);
    try {
      await claimsApi.resendOtp(claimId);
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
      label: 'Pending Pickup',
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
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-700 font-medium">Track your food claims and pickups</p>
        </div>
        <Link
          href="/hub"
          className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-colors ${colorClasses.button}`}
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
                ? colorClasses.tab
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${colorClasses.badge}`}>
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
          <div className={`w-8 h-8 border-4 rounded-full animate-spin ${colorClasses.spinner}`} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredClaims.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No claims found</h3>
          <p className="text-gray-700 mb-6">
            {activeTab === 'PENDING'
              ? 'You don\'t have any pending pickups'
              : 'Start by browsing the donation hub and claiming some food!'}
          </p>
          <Link
            href="/hub"
            className={`inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-colors ${colorClasses.button}`}
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
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
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
                          className={`font-semibold text-gray-900 hover:underline transition-colors ${colorClasses.link}`}
                        >
                          {listing?.title || 'Food Listing'}
                        </Link>
                        {showOrgColumn && listing?.organization?.name && (
                          <p className="text-sm text-gray-600">from {listing.organization.name}</p>
                        )}
                        <p className="text-sm text-gray-700 font-medium">
                          {claim.quantity} {listing?.unit || 'items'} • {formatPrice(claim.totalPrice)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                        <span>{badge.icon}</span> {badge.label}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="text-sm text-gray-700 mb-4 space-y-1">
                      <p><span className="font-medium">Claimed:</span> {formatDate(claim.createdAt)}</p>
                      {claim.pickedUpAt && (
                        <p className="text-green-700">
                          <span className="font-medium">✅ Picked up:</span> {formatDate(claim.pickedUpAt)}
                        </p>
                      )}
                      {claim.cancelledAt && (
                        <p className="text-red-600">
                          <span className="font-medium">❌ Cancelled:</span> {formatDate(claim.cancelledAt)}
                          {claim.cancelReason && ` — ${claim.cancelReason}`}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleResendOtp(claim.id)}
                          disabled={actionLoading === claim.id}
                          className={`px-4 py-2 text-sm border rounded-lg disabled:opacity-50 transition-colors ${
                            accentColor === 'green' 
                              ? 'border-green-200 text-green-600 hover:bg-green-50' 
                              : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                          }`}
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
