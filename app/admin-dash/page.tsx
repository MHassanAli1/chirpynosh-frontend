'use client';

import { useState, useEffect } from 'react';
import * as adminApi from '@/services/admin.api';

/**
 * Admin Dashboard Overview
 */
export default function AdminDashboard() {
    const [stats, setStats] = useState<adminApi.DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminApi.getDashboardStats();
                setStats(data);
            } catch {
                setError('Failed to load dashboard stats');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Monitor and manage your platform</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    icon="👥"
                    label="Total Users"
                    value={stats.overview.totalUsers}
                    color="blue"
                />
                <StatCard
                    icon="🏢"
                    label="Organizations"
                    value={stats.overview.totalOrgs}
                    color="purple"
                />
                <StatCard
                    icon="⏳"
                    label="Pending KYC"
                    value={stats.overview.pendingKyc}
                    color="amber"
                    highlight={stats.overview.pendingKyc > 0}
                />
                <StatCard
                    icon="🚫"
                    label="Restricted Users"
                    value={stats.overview.restrictedUsers}
                    color="red"
                />
                <StatCard
                    icon="🏢"
                    label="Restricted Orgs"
                    value={stats.overview.restrictedOrgs}
                    color="orange"
                />
            </div>

            {/* Weekly Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">This Week</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">New Users</span>
                            <span className="text-2xl font-bold text-emerald-600">
                                +{stats.recent.newUsersThisWeek}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">KYC Submissions</span>
                            <span className="text-2xl font-bold text-blue-600">
                                {stats.recent.kycSubmissionsThisWeek}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Users by Role */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Users by Role</h2>
                    <div className="space-y-3">
                        {Object.entries(stats.usersByRole).map(([role, count]) => (
                            <div key={role} className="flex justify-between items-center">
                                <span className="text-slate-600 text-sm">{formatRole(role)}</span>
                                <span className="font-semibold text-slate-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Organizations by Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Organizations by Type</h2>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(stats.orgsByType).map(([type, count]) => (
                        <div key={type} className="bg-slate-50 rounded-lg p-4">
                            <div className="text-2xl mb-1">
                                {type === 'NGO' ? '🏛️' : '🍕'}
                            </div>
                            <div className="text-sm text-slate-500">
                                {type === 'NGO' ? 'NGO Recipients' : 'Food Suppliers'}
                            </div>
                            <div className="text-xl font-bold text-slate-900 mt-1">{count}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickAction
                    href="/admin-dash/kyc?status=PENDING"
                    icon="📋"
                    title="Review Pending KYC"
                    description={`${stats.overview.pendingKyc} submissions awaiting review`}
                />
                <QuickAction
                    href="/admin-dash/users"
                    icon="👥"
                    title="Manage Users"
                    description="View and manage user accounts"
                />
                <QuickAction
                    href="/admin-dash/organizations"
                    icon="🏢"
                    title="Manage Organizations"
                    description="View and manage organizations"
                />
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
    highlight = false,
}: {
    icon: string;
    label: string;
    value: number;
    color: 'blue' | 'purple' | 'amber' | 'red' | 'orange';
    highlight?: boolean;
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className={`bg-white rounded-xl p-5 shadow-sm border ${highlight ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
                <span className="text-xl">{icon}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
        </div>
    );
}

function QuickAction({
    href,
    icon,
    title,
    description,
}: {
    href: string;
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <a
            href={href}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
        </a>
    );
}

function formatRole(role: string): string {
    const roleMap: Record<string, string> = {
        SIMPLE_RECIPIENT: 'Simple Recipients',
        NGO_RECIPIENT: 'NGO Recipients',
        FOOD_SUPPLIER: 'Food Suppliers',
        ADMIN: 'Administrators',
    };
    return roleMap[role] || role;
}
