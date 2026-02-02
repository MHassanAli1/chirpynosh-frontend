'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import * as adminApi from '@/services/admin.api';

/**
 * Admin User Detail Page
 */
export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<adminApi.AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUser = async () => {
        try {
            const data = await adminApi.getUserById(userId);
            setUser(data);
        } catch {
            setError('Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const handleRestrict = async () => {
        const reason = prompt('Enter restriction reason:');
        if (!reason) return;
        setActionLoading(true);
        try {
            await adminApi.restrictUser(userId, reason);
            fetchUser();
        } catch {
            alert('Failed to restrict user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnrestrict = async () => {
        if (!confirm('Unrestrict this user?')) return;
        setActionLoading(true);
        try {
            await adminApi.unrestrictUser(userId);
            fetchUser();
        } catch {
            alert('Failed to unrestrict user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        setActionLoading(true);
        try {
            await adminApi.deleteUser(userId);
            router.push('/admin-dash/users');
        } catch {
            alert('Failed to delete user');
            setActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="space-y-4">
                <button onClick={() => router.back()} className="text-slate-600 hover:text-slate-900">
                    ← Back
                </button>
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error || 'User not found'}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-600 hover:text-slate-900">
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{user.name || 'Unnamed User'}</h1>
                        <p className="text-slate-600">{user.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {user.isRestricted ? (
                        <button
                            onClick={handleUnrestrict}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            Unrestrict User
                        </button>
                    ) : (
                        <button
                            onClick={handleRestrict}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                        >
                            Restrict User
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        Delete User
                    </button>
                </div>
            </div>

            {/* Restriction Banner */}
            {user.isRestricted && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-xl">🚫</span>
                    <div>
                        <h3 className="font-medium text-red-800">Account Restricted</h3>
                        <p className="text-sm text-red-700 mt-1">
                            Reason: {user.restrictionReason || 'No reason provided'}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                            Restricted on: {user.restrictedAt ? new Date(user.restrictedAt).toLocaleString() : 'Unknown date'}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">User Details</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    (user.name?.[0] || user.email[0]).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-slate-900 text-lg">{user.name || 'No Name'}</div>
                                <div className="text-slate-500">{user.email}</div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        <InfoRow label="Role" value={user.role.replace('_', ' ')} />
                        <InfoRow label="Auth Provider" value={user.authProvider} />
                        <InfoRow label="Verified" value={user.isEmailVerified ? 'Yes' : 'No'} />
                        <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                        <InfoRow label="User ID" value={user.id} />
                    </div>
                </div>

                {/* Organizations */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Organizations</h2>
                    {user.orgMemberships && user.orgMemberships.length > 0 ? (
                        <div className="space-y-4">
                            {user.orgMemberships.map((membership) => (
                                <div key={membership.org.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-slate-900">{membership.org.name}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                            <span className={`px-2 py-0.5 rounded-full ${membership.org.type === 'NGO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {membership.org.type}
                                            </span>
                                            {membership.org.isVerified && (
                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Verified</span>
                                            )}
                                        </div>
                                    </div>
                                    <a
                                        href={`/admin-dash/organizations/${membership.org.id}`}
                                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                        View →
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg">
                            No organization memberships
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-1">
            <span className="text-slate-600">{label}</span>
            <span className="text-slate-900 font-medium">{value}</span>
        </div>
    );
}
