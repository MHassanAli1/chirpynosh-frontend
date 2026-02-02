'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getSupplierClaims,
  verifyPickupOtp,
  getListingImageUrl,
  type FoodClaim,
  type ClaimStatus,
} from '@/services/listings.api';

type TabStatus = 'all' | ClaimStatus;

const STATUS_BADGES: Record<ClaimStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending Pickup', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
  EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-700' },
};

export default function SupplierClaimsPage() {
  const [claims, setClaims] = useState<FoodClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [verifyingClaim, setVerifyingClaim] = useState<string | null>(null);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const response = await getSupplierClaims(params);
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

  const handleVerifyPickup = async (claimId: string) => {
    const otp = otpInputs[claimId];
    if (!otp || otp.length !== 6) {
      setVerifyError('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingClaim(claimId);
    setVerifyError(null);

    try {
      await verifyPickupOtp(claimId, otp);
      await fetchClaims();
      setOtpInputs((prev) => ({ ...prev, [claimId]: '' }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid OTP';
      setVerifyError(errorMessage);
    } finally {
      setVerifyingClaim(null);
    }
  };

  const tabs: { value: TabStatus; label: string; count?: number }[] = [
    { value: 'all', label: 'All Claims' },
    {
      value: 'PENDING',
      label: 'Pending',
      count: claims.filter((c) => c.status === 'PENDING').length,
    },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const filteredClaims =
    activeTab === 'all' ? claims : claims.filter((c) => c.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claim Management</h1>
          <p className="text-gray-500">Verify pickups and track claims</p>
        </div>
        <Link
          href="/dashboard/food-supplier"
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Back to Dashboard
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
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
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
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredClaims.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
          <p className="text-gray-500">
            {activeTab === 'PENDING'
              ? 'No pending pickups at the moment'
              : 'Claims will appear here when recipients claim your listings'}
          </p>
        </div>
      )}

      {/* Claims List */}
      {!isLoading && filteredClaims.length > 0 && (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              otpValue={otpInputs[claim.id] || ''}
              onOtpChange={(value) => setOtpInputs((prev) => ({ ...prev, [claim.id]: value }))}
              onVerify={() => handleVerifyPickup(claim.id)}
              isVerifying={verifyingClaim === claim.id}
              verifyError={verifyingClaim === claim.id ? verifyError : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ClaimCardProps {
  claim: FoodClaim;
  otpValue: string;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  isVerifying: boolean;
  verifyError: string | null;
}

function ClaimCard({
  claim,
  otpValue,
  onOtpChange,
  onVerify,
  isVerifying,
  verifyError,
}: ClaimCardProps) {
  const listing = claim.listing;
  const claimer = claim.claimer;
  const badge = STATUS_BADGES[claim.status];
  const isPending = claim.status === 'PENDING';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Listing Image */}
        <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
          {listing?.imageKeys?.[0] ? (
            <Image
              src={getListingImageUrl(listing.imageKeys[0])}
              alt={listing.title || 'Food listing'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{listing?.title}</h3>
              <p className="text-sm text-gray-500">
                Claimed {claim.quantity} {listing?.unit}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {/* Claimer Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-lg">
                  {claim.claimerType === 'NGO' ? '🏢' : '👤'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {claimer?.organization?.name || claimer?.name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-500">
                  {claim.claimerType === 'NGO' ? 'NGO Recipient' : 'Individual'}
                  {claimer?.email && ` • ${claimer.email}`}
                </p>
              </div>
            </div>
          </div>

          {/* Pickup Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>🕐</span>
            <span>
              Pickup: {new Date(claim.createdAt).toLocaleDateString()} at{' '}
              {new Date(claim.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* OTP Verification (for pending claims) */}
          {isPending && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Enter OTP to verify pickup:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  maxLength={6}
                />
                <button
                  onClick={onVerify}
                  disabled={isVerifying || otpValue.length !== 6}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              {verifyError && <p className="text-sm text-red-600 mt-2">{verifyError}</p>}
            </div>
          )}

          {/* Completed Info */}
          {claim.status === 'COMPLETED' && claim.completedAt && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-sm text-green-600">
                ✓ Pickup completed on {new Date(claim.completedAt).toLocaleDateString()} at{' '}
                {new Date(claim.completedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
