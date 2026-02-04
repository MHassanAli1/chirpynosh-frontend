'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getClaims, cancelClaim, resendOtp, calculateStatsFromClaims, type MyClaim, type ClaimStats } from '@/services/claims.api';
import type { ClaimStatus } from '@/services/listings.api';

/**
 * My Claims Page - Shows all claims for the recipient
 */
export default function RecipientClaimsPage() {
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
            await cancelClaim(claimId, 'Cancelled by user');
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
                    <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
                    <p className="text-gray-600 mt-1">Track your food claims and pickups</p>
                </div>
                <Link
                    href="/hub"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                    <span>🍕</span>
                    Browse Food
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon="📋" label="Total Claims" value={stats.totalClaims.toString()} />
                    <StatCard icon="⏳" label="Pending" value={stats.pendingClaims.toString()} />
                    <StatCard icon="✅" label="Completed" value={stats.completedClaims.toString()} />
                    <StatCard icon="🌱" label="Food Saved" value={`${stats.totalFoodSaved} items`} />
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Claims List */}
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={fetchClaims}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-5xl">📭</span>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">No claims found</h3>
                            <p className="mt-2 text-gray-600">
                                {activeTab === 'ALL'
                                    ? "You haven't claimed any food yet."
                                    : `No ${activeTab.toLowerCase()} claims.`}
                            </p>
                            <Link
                                href="/hub"
                                className="inline-block mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                            >
                                Browse Available Food
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {claims.map((claim) => (
                                <div
                                    key={claim.id}
                                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        {/* Listing Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">🍕</span>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {claim.listing?.title || 'Food Item'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        by {claim.listing?.organization?.name || 'Unknown Supplier'}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(claim.status)}`}>
                                                    {claim.status}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Quantity</span>
                                                    <p className="font-medium text-gray-900">
                                                        {claim.quantity} {claim.listing?.unit || 'items'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Total</span>
                                                    <p className="font-medium text-gray-900">
                                                        {formatPrice(claim.totalPrice)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Claimed</span>
                                                    <p className="font-medium text-gray-900">
                                                        {formatDate(claim.createdAt)}
                                                    </p>
                                                </div>
                                                {claim.status === 'PENDING' && claim.listing?.pickupStartAt && (
                                                    <div>
                                                        <span className="text-gray-500">Pickup</span>
                                                        <p className="font-medium text-gray-900">
                                                            {formatDate(claim.listing.pickupStartAt)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {claim.status === 'PENDING' && (
                                            <div className="flex sm:flex-col gap-2">
                                                <button
                                                    onClick={() => handleResendOtp(claim.id)}
                                                    disabled={resendingId === claim.id}
                                                    className="flex-1 sm:flex-none px-3 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                                >
                                                    {resendingId === claim.id ? '...' : '📧 Resend OTP'}
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(claim.id)}
                                                    disabled={cancellingId === claim.id}
                                                    className="flex-1 sm:flex-none px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                >
                                                    {cancellingId === claim.id ? '...' : '❌ Cancel'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cancellation reason */}
                                    {claim.status === 'CANCELLED' && claim.cancelReason && (
                                        <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                                            <strong>Reason:</strong> {claim.cancelReason}
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

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
                <span>{icon}</span>
                <span className="text-sm text-gray-600">{label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
