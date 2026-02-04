'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getClaims, cancelClaim, resendOtp, calculateStatsFromClaims, type MyClaim, type ClaimStats } from '@/services/claims.api';
import type { ClaimStatus } from '@/services/listings.api';
import { getListingImageUrl } from '@/services/listings.api';

/**
 * NGO Recipient Claims Page - Shows all claims for the NGO
 */
export default function NgoClaimsPage() {
    const [claims, setClaims] = useState<MyClaim[]>([]);
    const [stats, setStats] = useState<ClaimStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ClaimStatus | 'ALL'>('ALL');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [resendingId, setResendingId] = useState<string | null>(null);

    const fetchClaims = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = activeTab !== 'ALL' ? { status: activeTab } : {};
            const response = await getClaims(params);
            setClaims(response.claims);
            
            // Calculate stats from all claims
            if (activeTab === 'ALL') {
                const calculatedStats = calculateStatsFromClaims(response.claims);
                setStats(calculatedStats);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load claims');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchClaims();
    }, [fetchClaims]);

    const handleCancel = async (claimId: string) => {
        if (!confirm('Are you sure you want to cancel this claim?')) return;
        
        setCancellingId(claimId);
        try {
            await cancelClaim(claimId, 'Cancelled by organization');
            fetchClaims();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to cancel claim');
        } finally {
            setCancellingId(null);
        }
    };

    const handleResendOtp = async (claimId: string) => {
        setResendingId(claimId);
        try {
            const response = await resendOtp(claimId);
            alert(response.message || 'OTP sent to your email!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to resend OTP');
        } finally {
            setResendingId(null);
        }
    };

    const getStatusBadge = (status: ClaimStatus) => {
        const styles: Record<ClaimStatus, string> = {
            PENDING: 'bg-amber-100 text-amber-700',
            COMPLETED: 'bg-emerald-100 text-emerald-700',
            CANCELLED: 'bg-red-100 text-red-700',
            EXPIRED: 'bg-gray-100 text-gray-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-600';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: string | number) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return num === 0 ? 'Free' : `$${num.toFixed(2)}`;
    };

    const tabs: { key: ClaimStatus | 'ALL'; label: string }[] = [
        { key: 'ALL', label: 'All Claims' },
        { key: 'PENDING', label: 'Pending Pickup' },
        { key: 'COMPLETED', label: 'Completed' },
        { key: 'CANCELLED', label: 'Cancelled' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organization Claims</h1>
                    <p className="text-gray-600 mt-1">Track and manage your food pickups</p>
                </div>
                <Link
                    href="/hub"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <span>🍕</span>
                    Browse Food Hub
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-2xl font-bold text-gray-900">{stats.totalClaims}</div>
                        <div className="text-sm text-gray-600">Total Claims</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-2xl font-bold text-amber-600">{stats.pendingClaims}</div>
                        <div className="text-sm text-gray-600">Pending Pickup</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-2xl font-bold text-emerald-600">{stats.completedClaims}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalFoodSaved}</div>
                        <div className="text-sm text-gray-600">Items Received</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={fetchClaims}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📦</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No claims yet</h3>
                            <p className="text-gray-600 mb-6">
                                Start claiming food from the hub to distribute to your beneficiaries.
                            </p>
                            <Link
                                href="/hub"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                Browse Available Food
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {claims.map((claim) => (
                                <div
                                    key={claim.id}
                                    className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    {/* Image */}
                                    <div className="w-full sm:w-24 h-32 sm:h-24 relative rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                        {claim.listing?.imageKeys?.[0] ? (
                                            <Image
                                                src={getListingImageUrl(claim.listing.imageKeys[0], { width: 200, height: 200 })}
                                                alt={claim.listing?.title || 'Food item'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">
                                                🍕
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {claim.listing?.title || 'Food Claim'}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(claim.status)}`}>
                                                {claim.status}
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-2">
                                            {claim.listing?.organization?.name && (
                                                <span>From: {claim.listing.organization.name}</span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Quantity:</span>{' '}
                                                <span className="font-medium">{claim.quantity} {claim.listing?.unit || 'items'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Total:</span>{' '}
                                                <span className="font-medium text-blue-600">{formatPrice(claim.totalPrice)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Claimed:</span>{' '}
                                                <span className="font-medium">{formatDate(claim.createdAt)}</span>
                                            </div>
                                        </div>

                                        {claim.status === 'COMPLETED' && claim.pickedUpAt && (
                                            <div className="text-sm text-emerald-600 mt-2">
                                                ✓ Picked up on {formatDate(claim.pickedUpAt)}
                                            </div>
                                        )}

                                        {claim.status === 'CANCELLED' && claim.cancelReason && (
                                            <div className="text-sm text-red-600 mt-2">
                                                Reason: {claim.cancelReason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {claim.status === 'PENDING' && (
                                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleResendOtp(claim.id)}
                                                disabled={resendingId === claim.id}
                                                className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                                            >
                                                {resendingId === claim.id ? 'Sending...' : 'Resend OTP'}
                                            </button>
                                            <button
                                                onClick={() => handleCancel(claim.id)}
                                                disabled={cancellingId === claim.id}
                                                className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                                            >
                                                {cancellingId === claim.id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
