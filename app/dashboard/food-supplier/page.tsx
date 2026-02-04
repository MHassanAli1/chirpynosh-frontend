'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { profileApi, type ProfileStats } from '@/services/profile.api';
import { getMyListings, type Listing } from '@/services/listings.api';

/**
 * Food Supplier Dashboard
 * Shows real-time data from backend
 */
export default function FoodSupplierDashboard() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthStore();
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            // Fetch stats from profile API
            const profileStats = await profileApi.getStats();
            setStats(profileStats);

            // Fetch recent listings
            const listingsResponse = await getMyListings({ limit: 5 });
            setListings(listingsResponse.listings);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            if (user.role !== 'FOOD_SUPPLIER') {
                router.push('/dashboard');
                return;
            }
            fetchDashboardData();
        }
    }, [authLoading, user, router, fetchDashboardData]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            AVAILABLE: 'bg-emerald-100 text-emerald-700',
            CLAIMED: 'bg-amber-100 text-amber-700',
            COMPLETED: 'bg-blue-100 text-blue-700',
            EXPIRED: 'bg-gray-100 text-gray-700',
            CANCELLED: 'bg-red-100 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-600';
    };

    if (isLoading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header with Profile Info */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold ring-4 ring-white/30 overflow-hidden">
                            {user.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt={user.organization?.name || 'Business'}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                (user.organization?.name || user.name || 'B')[0].toUpperCase()
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {user.organization?.isVerified && (
                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                                        ✓ Verified Supplier
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold">
                                {user.organization?.name || 'Your Business'}
                            </h1>
                            <p className="text-orange-100 text-sm mt-1">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/food-supplier/profile"
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                    >
                        View Profile
                    </Link>
                </div>
                <p className="mt-4 text-orange-100">
                    Manage your food listings and connect with recipients.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    icon="📦" 
                    label="Active Listings" 
                    value={stats?.activeListings?.toString() || '0'} 
                    subtext="available" 
                />
                <StatCard 
                    icon="📋" 
                    label="Pending Claims" 
                    value={stats?.pendingClaims?.toString() || '0'} 
                    subtext="awaiting pickup" 
                />
                <StatCard 
                    icon="✅" 
                    label="Completed" 
                    value={stats?.completedClaims?.toString() || '0'} 
                    subtext="donations" 
                />
                <StatCard 
                    icon="📊" 
                    label="Total Listings" 
                    value={stats?.totalListings?.toString() || '0'} 
                    subtext="created" 
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
                        <p className="font-semibold text-gray-900">Food Supplier</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Organization</p>
                        <p className="font-semibold text-gray-900">{user.organization?.name || 'Not set'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Verification</p>
                        <p className={`font-semibold ${user.organization?.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {user.organization?.isVerified ? '✓ Verified' : '⏳ Pending'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/dashboard/food-supplier/add"
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            ➕
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Add New Listing</h3>
                            <p className="text-sm text-gray-500">Post surplus food for donation</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/dashboard/food-supplier/claims"
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📋
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Review Claims</h3>
                            <p className="text-sm text-gray-500">{stats?.pendingClaims || 0} pending claims to review</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
                    <Link href="/dashboard/food-supplier/listings" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                        View All →
                    </Link>
                </div>

                {listings.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No listings yet. Start by adding your first food listing!</p>
                        <Link
                            href="/dashboard/food-supplier/add"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <span>➕</span> Add Listing
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {listings.map((listing) => (
                            <Link
                                key={listing.id}
                                href={`/dashboard/food-supplier/listings/${listing.id}`}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                                    {listing.images?.[0] ? (
                                        <Image
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl">🍕</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                                    <p className="text-sm text-gray-500">{formatDate(listing.createdAt)}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(listing.status)}`}>
                                    {listing.status}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
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
            <div className="text-xs text-gray-700 font-medium">{subtext}</div>
        </div>
    );
}
