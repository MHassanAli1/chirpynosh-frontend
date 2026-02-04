'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { profileApi, type ProfileStats } from '@/services/profile.api';
import Link from 'next/link';
import { ProfileAvatar, EditableField } from '@/components/profile/ProfileComponents';

/**
 * Recipient Profile Page - Fully Functional
 */
export default function RecipientProfilePage() {
    const { user, isLoading, setUser, fetchUser } = useAuthStore();
    
    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
    });

    // Load stats
    useEffect(() => {
        const loadStats = async () => {
            try {
                const profileStats = await profileApi.getStats();
                setStats(profileStats);
            } catch (err) {
                console.error('Failed to load stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };
        loadStats();
    }, []);

    // Update form when user changes
    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '' });
        }
    }, [user]);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({ name: user?.name || '' });
        setIsEditing(false);
        setError(null);
    }, [user]);

    // Handle avatar upload
    const handleAvatarUpload = useCallback(async (file: File) => {
        setIsUploadingAvatar(true);
        setError(null);
        try {
            const updatedUser = await profileApi.uploadAvatar(file);
            setUser(updatedUser);
            setSuccessMessage('Profile photo updated!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload photo');
        } finally {
            setIsUploadingAvatar(false);
        }
    }, [setUser]);

    // Handle avatar delete
    const handleAvatarDelete = useCallback(async () => {
        setIsUploadingAvatar(true);
        setError(null);
        try {
            const updatedUser = await profileApi.deleteAvatar();
            setUser(updatedUser);
            setSuccessMessage('Profile photo removed!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove photo');
        } finally {
            setIsUploadingAvatar(false);
        }
    }, [setUser]);

    // Handle save
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        try {
            const updatedUser = await profileApi.updateProfile({
                name: formData.name || undefined,
            });
            setUser(updatedUser);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    }, [formData, setUser]);

    const formatRole = (role: string) => {
        return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Unable to load profile</p>
                <button onClick={fetchUser} className="mt-4 text-emerald-600 hover:underline">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account settings</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
                    ✓ {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    ⚠ {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? '—' : stats?.totalClaims || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Claims</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-emerald-600">
                        {statsLoading ? '—' : stats?.completedClaims || 0}
                    </p>
                    <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-amber-600">
                        {statsLoading ? '—' : stats?.pendingClaims || 0}
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-red-600">
                        {statsLoading ? '—' : stats?.cancelledClaims || 0}
                    </p>
                    <p className="text-sm text-gray-600">Cancelled</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header with avatar */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8">
                    <div className="flex items-center gap-6">
                        <ProfileAvatar
                            avatar={user.avatar}
                            name={user.name}
                            size="lg"
                            editable={true}
                            onUpload={handleAvatarUpload}
                            onDelete={handleAvatarDelete}
                            uploading={isUploadingAvatar}
                            colorScheme="emerald"
                        />
                        <div className="text-white">
                            <h2 className="text-xl font-bold">{user.name || 'User'}</h2>
                            <p className="text-emerald-100">{formatRole(user.role)}</p>
                            <p className="text-emerald-200 text-sm mt-1">Member since {formatDate(user.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 space-y-6">
                    {/* Account Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span>👤</span> Account Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EditableField
                                label="Full Name"
                                value={isEditing ? formData.name : (user.name || '')}
                                onChange={(value) => setFormData({ ...formData, name: value })}
                                editing={isEditing}
                                placeholder="Your full name"
                            />
                            <EditableField
                                label="Email"
                                value={user.email}
                                onChange={() => {}}
                                editing={false}
                                disabled={true}
                            />
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Account Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                <span>👤</span>
                                {formatRole(user.role)}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email Status</label>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                user.isEmailVerified
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                            }`}>
                                {user.isEmailVerified ? '✓ Verified' : '⏳ Unverified'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        href="/dashboard/recipient/claims"
                        className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                        <span className="text-2xl">📋</span>
                        <div>
                            <p className="font-medium text-gray-900">My Claims</p>
                            <p className="text-sm text-gray-600">View your food claims</p>
                        </div>
                    </Link>
                    <Link
                        href="/hub"
                        className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
                    >
                        <span className="text-2xl">🍕</span>
                        <div>
                            <p className="font-medium text-gray-900">Browse Food</p>
                            <p className="text-sm text-gray-600">Find available food</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
