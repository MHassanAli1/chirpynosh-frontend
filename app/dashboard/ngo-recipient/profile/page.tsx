'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { profileApi } from '@/services/profile.api';
import Link from 'next/link';
import { ProfileAvatar, EditableField } from '@/components/profile/ProfileComponents';

/**
 * NGO Recipient Profile Page - Fully Functional
 */
export default function NgoProfilePage() {
    const { user, isLoading, setUser, fetchUser } = useAuthStore();
    
    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        organizationName: user?.organization?.name || '',
    });

    // Reset form when user changes
    const resetForm = useCallback(() => {
        setFormData({
            name: user?.name || '',
            organizationName: user?.organization?.name || '',
        });
        setIsEditing(false);
        setError(null);
    }, [user]);

    // Handle avatar upload
    const handleAvatarUpload = useCallback(async (file: File) => {
        setIsUploadingAvatar(true);
        setError(null);
        try {
            const updatedUser = await profileApi.uploadAvatar(file);
            // Update local user state
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
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Unable to load profile</p>
                <button onClick={fetchUser} className="mt-4 text-blue-600 hover:underline">
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
                    <h1 className="text-2xl font-bold text-gray-900">Organization Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your organization settings and information</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
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

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header with avatar */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
                    <div className="flex items-center gap-6">
                        <ProfileAvatar
                            avatar={user.avatar}
                            name={user.organization?.name || user.name}
                            size="lg"
                            editable={true}
                            onUpload={handleAvatarUpload}
                            onDelete={handleAvatarDelete}
                            uploading={isUploadingAvatar}
                            colorScheme="blue"
                        />
                        <div className="text-white">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">
                                    {user.organization?.name || user.name || 'Organization'}
                                </h2>
                                {user.organization?.isVerified && (
                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                                        ✓ Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-blue-100">{formatRole(user.role)}</p>
                            <p className="text-blue-200 text-sm mt-1">Member since {formatDate(user.createdAt)}</p>
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
                                label="Contact Person"
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

                    {/* Organization Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span>🏢</span> Organization Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EditableField
                                label="Organization Name"
                                value={isEditing ? formData.organizationName : (user.organization?.name || '')}
                                onChange={(value) => setFormData({ ...formData, organizationName: value })}
                                editing={isEditing}
                                placeholder="Your organization name"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Organization Type</label>
                                <p className="text-gray-900 font-medium py-2">{user.organization?.type || 'NGO'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Verification Status</label>
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                                    user.organization?.isVerified
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {user.organization?.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Your Role</label>
                                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                                    {user.organization?.userRole || 'Member'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Security Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span>🔒</span> Security
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Auth Provider</label>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                                    user.authProvider === 'GOOGLE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {user.authProvider === 'GOOGLE' ? '🔵 Google' : '📧 Email'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Email Verified</label>
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                                    user.isEmailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {user.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        href="/dashboard/ngo-recipient/claims"
                        className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                        <span className="text-2xl">📦</span>
                        <div>
                            <p className="font-medium text-gray-900">My Claims</p>
                            <p className="text-sm text-gray-600">View all your food claims</p>
                        </div>
                    </Link>
                    <Link
                        href="/hub"
                        className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                        <span className="text-2xl">🍕</span>
                        <div>
                            <p className="font-medium text-gray-900">Browse Food</p>
                            <p className="text-sm text-gray-600">Find available donations</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* KYC Status Link */}
            <Link
                href="/kyc/status"
                className="block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-colors"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">📋</span>
                        <div>
                            <h3 className="font-semibold text-gray-900">KYC Verification</h3>
                            <p className="text-sm text-gray-600">View your verification status and documents</p>
                        </div>
                    </div>
                    <span className="text-blue-600">→</span>
                </div>
            </Link>
        </div>
    );
}
