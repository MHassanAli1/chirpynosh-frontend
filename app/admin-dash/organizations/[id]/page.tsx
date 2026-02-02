'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import * as adminApi from '@/services/admin.api';

/**
 * Organization Detail Page
 */
export default function OrganizationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.id as string;

    const [org, setOrg] = useState<adminApi.AdminOrganization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState('');

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const data = await adminApi.getOrganizationById(orgId);
                setOrg(data);
            } catch {
                setError('Failed to load organization');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrg();
    }, [orgId]);

    const handleRestrict = async () => {
        const reason = prompt('Enter restriction reason:');
        if (!reason) return;
        setActionLoading('restrict');
        try {
            await adminApi.restrictOrganization(orgId, reason);
            const data = await adminApi.getOrganizationById(orgId);
            setOrg(data);
        } catch {
            setError('Failed to restrict organization');
        } finally {
            setActionLoading('');
        }
    };

    const handleUnrestrict = async () => {
        if (!confirm('Unrestrict this organization?')) return;
        setActionLoading('unrestrict');
        try {
            await adminApi.unrestrictOrganization(orgId);
            const data = await adminApi.getOrganizationById(orgId);
            setOrg(data);
        } catch {
            setError('Failed to unrestrict organization');
        } finally {
            setActionLoading('');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
        setActionLoading('delete');
        try {
            await adminApi.deleteOrganization(orgId);
            router.push('/admin-dash/organizations');
        } catch {
            setError('Failed to delete organization');
            setActionLoading('');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !org) {
        return (
            <div className="space-y-4">
                <button onClick={() => router.back()} className="text-slate-600 hover:text-slate-900">
                    ← Back
                </button>
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error || 'Organization not found'}</div>
            </div>
        );
    }

    // Access full org data from API
    const fullOrg = org as typeof org & {
        verifiedAt?: string;
        restrictedAt?: string;
        createdAt?: string;
        kyc?: {
            id: string;
            status: string;
            businessRegisteredName?: string;
            taxId?: string;
            phoneNumber?: string;
            businessAddress?: string;
            submittedAt?: string;
            reviewedAt?: string;
            rejectionReason?: string;
        };
        members?: {
            orgRole: string;
            user: {
                id: string;
                email: string;
                name?: string;
                avatar?: string;
                isRestricted: boolean;
            };
        }[];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-600 hover:text-slate-900">
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{fullOrg.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${fullOrg.type === 'NGO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {fullOrg.type === 'NGO' ? '🏛️ NGO Recipient' : '🍕 Food Supplier'}
                            </span>
                            {fullOrg.isVerified && (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-medium">
                                    ✓ Verified
                                </span>
                            )}
                            {fullOrg.isRestricted && (
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">
                                    🚫 Restricted
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {fullOrg.isRestricted ? (
                        <button
                            onClick={handleUnrestrict}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {actionLoading === 'unrestrict' ? 'Processing...' : 'Unrestrict'}
                        </button>
                    ) : (
                        <button
                            onClick={handleRestrict}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                        >
                            {actionLoading === 'restrict' ? 'Processing...' : 'Restrict'}
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={!!actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            {/* Organization Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Organization Info</h2>
                    <div className="space-y-3">
                        <InfoRow label="ID" value={fullOrg.id} />
                        <InfoRow label="Type" value={fullOrg.type === 'NGO' ? 'NGO Recipient' : 'Food Supplier'} />
                        <InfoRow label="Members" value={`${fullOrg.memberCount} member(s)`} />
                        <InfoRow label="Verified" value={fullOrg.isVerified ? 'Yes' : 'No'} />
                        {fullOrg.verifiedAt && (
                            <InfoRow label="Verified At" value={new Date(fullOrg.verifiedAt).toLocaleString()} />
                        )}
                        {fullOrg.createdAt && (
                            <InfoRow label="Created" value={new Date(fullOrg.createdAt).toLocaleString()} />
                        )}
                        {fullOrg.isRestricted && (
                            <>
                                <InfoRow label="Restricted At" value={fullOrg.restrictedAt ? new Date(fullOrg.restrictedAt).toLocaleString() : '-'} />
                                <InfoRow label="Restriction Reason" value={fullOrg.restrictionReason || '-'} />
                            </>
                        )}
                    </div>
                </div>

                {/* KYC Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">KYC Information</h2>
                        {fullOrg.kyc && (
                            <a
                                href={`/admin-dash/kyc/${fullOrg.kyc.id}`}
                                className="text-sm text-emerald-600 hover:text-emerald-700"
                            >
                                View Full KYC →
                            </a>
                        )}
                    </div>
                    {fullOrg.kyc ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Status:</span>
                                <StatusBadge status={fullOrg.kyc.status} />
                            </div>
                            {fullOrg.kyc.businessRegisteredName && (
                                <InfoRow label="Registered Name" value={fullOrg.kyc.businessRegisteredName} />
                            )}
                            {fullOrg.kyc.taxId && (
                                <InfoRow label="Tax ID" value={fullOrg.kyc.taxId} />
                            )}
                            {fullOrg.kyc.phoneNumber && (
                                <InfoRow label="Phone" value={fullOrg.kyc.phoneNumber} />
                            )}
                            {fullOrg.kyc.businessAddress && (
                                <InfoRow label="Address" value={fullOrg.kyc.businessAddress} />
                            )}
                            {fullOrg.kyc.submittedAt && (
                                <InfoRow label="Submitted" value={new Date(fullOrg.kyc.submittedAt).toLocaleString()} />
                            )}
                            {fullOrg.kyc.rejectionReason && (
                                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {fullOrg.kyc.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate-500">No KYC submission yet</p>
                    )}
                </div>
            </div>

            {/* Members */}
            {fullOrg.members && fullOrg.members.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Members</h2>
                    <div className="space-y-3">
                        {fullOrg.members.map((member, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                                        {member.user.avatar ? (
                                            <img src={member.user.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-700 font-medium">
                                                {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{member.user.name || 'No name'}</p>
                                        <p className="text-sm text-slate-600">{member.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded">
                                        {member.orgRole}
                                    </span>
                                    {member.user.isRestricted && (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                            Restricted
                                        </span>
                                    )}
                                    <a
                                        href={`/admin-dash/users/${member.user.id}`}
                                        className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                                    >
                                        View
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-sm text-slate-600">{label}</span>
            <span className="text-sm text-slate-900 font-medium">{value}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        NOT_SUBMITTED: 'bg-slate-100 text-slate-700',
        PENDING: 'bg-amber-100 text-amber-700',
        APPROVED: 'bg-emerald-100 text-emerald-700',
        REJECTED: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
        NOT_SUBMITTED: 'Not Submitted',
        PENDING: 'Pending',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
    };
    return (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.NOT_SUBMITTED}`}>
            {labels[status] || status}
        </span>
    );
}
