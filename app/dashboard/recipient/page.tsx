'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { getClaims, calculateStatsFromClaims, type MyClaim, type ClaimStats } from '@/services/claims.api';
import { getListingImageUrl } from '@/services/listings.api';

/**
 * Simple Recipient Dashboard
 * Shows real-time data from backend
 */
export default function RecipientDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<ClaimStats | null>(null);
    const [recentClaims, setRecentClaims] = useState<MyClaim[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await getClaims({ limit: 5 });
            setRecentClaims(response.claims);
            const calculatedStats = calculateStatsFromClaims(response.claims);
            setStats(calculatedStats);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-amber-100 text-amber-700',
            COMPLETED: 'bg-emerald-100 text-emerald-700',
            CANCELLED: 'bg-red-100 text-red-700',
            EXPIRED: 'bg-gray-100 text-gray-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-600';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header with Profile Info */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold ring-4 ring-white/30 overflow-hidden">
                            {user?.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt={user?.name || 'User'}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                (user?.name || 'U')[0].toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Welcome back, {user?.name || 'Friend'}! 👋
                            </h1>
                            <p className="text-emerald-100 text-sm mt-1">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/recipient/profile"
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                    >
                        View Profile
                    </Link>
                </div>
                <p className="mt-4 text-emerald-100">
                    Find and claim surplus food from local suppliers and organizations.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon="📦"
                    label="Pending Pickup"
                    value={String(stats?.pendingClaims || 0)}
                    subtext="claims to collect"
                />
                <StatCard
                    icon="✅"
                    label="Completed"
                    value={String(stats?.completedClaims || 0)}
                    subtext="successful pickups"
                />
                <StatCard
                    icon="🍕"
                    label="Total Claims"
                    value={String(stats?.totalClaims || 0)}
                    subtext="food items claimed"
                />
                <StatCard
                    icon="⭐"
                    label="Impact Score"
                    value={String(stats?.impactScore || 0)}
                    subtext="points earned"
                />
            </div>

            {/* Account Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📋</span> Account Summary
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Account Type</p>
                        <p className="font-semibold text-gray-900">Individual Recipient</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-semibold text-gray-900">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Email Status</p>
                        <p className={`font-semibold ${user?.isEmailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {user?.isEmailVerified ? '✓ Verified' : '⏳ Unverified'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-semibold text-gray-900 truncate">{user?.name || 'Not set'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/hub"
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            🍕
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Browse Available Food</h3>
                            <p className="text-sm text-gray-600">Find donations near you</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/dashboard/recipient/claims"
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📋
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">View My Claims</h3>
                            <p className="text-sm text-gray-600">Track your pickups</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Claims */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Claims</h2>
                    <Link
                        href="/dashboard/recipient/claims"
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                        View All →
                    </Link>
                </div>
                <div className="p-4">
                    {recentClaims.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-3">🍕</div>
                            <p className="text-gray-600 mb-4">No claims yet. Start exploring!</p>
                            <Link
                                href="/hub"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                            >
                                Browse Food Hub
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentClaims.map((claim) => (
                                <div
                                    key={claim.id}
                                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                        {claim.listing?.imageKeys?.[0] ? (
                                            <Image
                                                src={getListingImageUrl(claim.listing.imageKeys[0], { width: 100, height: 100 })}
                                                alt={claim.listing?.title || 'Food'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">
                                                🍕
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {claim.listing?.title || 'Food Claim'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {claim.quantity} items • {formatDate(claim.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(claim.status)}`}>
                                        {claim.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtext }: {
    icon: string;
    label: string;
    value: string;
    subtext: string;
}) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-gray-700 font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-600">{subtext}</div>
        </div>
    );
}
