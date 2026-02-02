'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import * as adminApi from '@/services/admin.api';

/**
 * KYC Detail Page with full document review and approve/reject actions
 */
export default function KycDetailPage() {
    const params = useParams();
    const router = useRouter();
    const kycId = params.id as string;

    const [kyc, setKyc] = useState<KycDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState('');
    const [docUrls, setDocUrls] = useState<Record<string, string>>({});
    const [loadingDocs, setLoadingDocs] = useState<string[]>([]);

    interface KycDetail {
        id: string;
        orgId: string;
        status: string;
        businessRegisteredName?: string;
        taxId?: string;
        phoneNumber?: string;
        businessAddress?: string;
        submittedAt?: string;
        reviewedAt?: string;
        reviewedBy?: string;
        rejectionReason?: string;
        organization: {
            id: string;
            name: string;
            type: string;
            isVerified: boolean;
            isRestricted: boolean;
        };
    }

    useEffect(() => {
        const fetchKyc = async () => {
            try {
                const data = await adminApi.getKycById(kycId);
                setKyc(data as unknown as KycDetail);
            } catch {
                setError('Failed to load KYC submission');
            } finally {
                setIsLoading(false);
            }
        };
        fetchKyc();
    }, [kycId]);

    const loadDocument = async (docType: string) => {
        if (docUrls[docType] || loadingDocs.includes(docType)) return;
        setLoadingDocs(prev => [...prev, docType]);
        try {
            const url = await adminApi.getKycDocumentUrl(kycId, docType);
            setDocUrls(prev => ({ ...prev, [docType]: url }));
        } catch {
            setError(`Failed to load ${docType} document`);
        } finally {
            setLoadingDocs(prev => prev.filter(d => d !== docType));
        }
    };

    const handleApprove = async () => {
        const notes = prompt('Add approval notes (optional):') || '';
        setActionLoading('approve');
        try {
            await adminApi.approveKyc(kycId, notes);
            const data = await adminApi.getKycById(kycId);
            setKyc(data as unknown as KycDetail);
        } catch {
            setError('Failed to approve KYC');
        } finally {
            setActionLoading('');
        }
    };

    const handleReject = async () => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        setActionLoading('reject');
        try {
            await adminApi.rejectKyc(kycId, reason);
            const data = await adminApi.getKycById(kycId);
            setKyc(data as unknown as KycDetail);
        } catch {
            setError('Failed to reject KYC');
        } finally {
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

    if (error || !kyc) {
        return (
            <div className="space-y-4">
                <button onClick={() => router.back()} className="text-slate-600 hover:text-slate-900">
                    ← Back
                </button>
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error || 'KYC submission not found'}</div>
            </div>
        );
    }

    const documentTypes = [
        { key: 'taxDocument', label: 'Tax Document' },
        { key: 'registrationDoc', label: 'Business Registration' },
        { key: 'businessLicense', label: 'Business License' },
        { key: 'idProof', label: 'ID Proof (Owner)' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-600 hover:text-slate-900">
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">KYC Review</h1>
                        <p className="text-slate-600">{kyc.organization.name}</p>
                    </div>
                </div>
                {kyc.status === 'PENDING' && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleApprove}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {actionLoading === 'approve' ? 'Processing...' : '✓ Approve'}
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {actionLoading === 'reject' ? 'Processing...' : '✕ Reject'}
                        </button>
                    </div>
                )}
            </div>

            {/* Status Banner */}
            <div className={`p-4 rounded-xl ${kyc.status === 'PENDING' ? 'bg-amber-50 border border-amber-200' :
                kyc.status === 'APPROVED' ? 'bg-emerald-50 border border-emerald-200' :
                    kyc.status === 'REJECTED' ? 'bg-red-50 border border-red-200' :
                        'bg-slate-50 border border-slate-200'
                }`}>
                <div className="flex items-center gap-3">
                    <StatusBadge status={kyc.status} />
                    <span className="text-sm text-slate-700">
                        {kyc.status === 'PENDING' && 'This KYC submission is awaiting review.'}
                        {kyc.status === 'APPROVED' && `Approved${kyc.reviewedAt ? ` on ${new Date(kyc.reviewedAt).toLocaleString()}` : ''}`}
                        {kyc.status === 'REJECTED' && `Rejected${kyc.reviewedAt ? ` on ${new Date(kyc.reviewedAt).toLocaleString()}` : ''}`}
                    </span>
                </div>
                {kyc.rejectionReason && (
                    <p className="mt-2 text-sm text-red-700"><strong>Reason:</strong> {kyc.rejectionReason}</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organization Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Organization</h2>
                        <a
                            href={`/admin-dash/organizations/${kyc.organization.id}`}
                            className="text-sm text-emerald-600 hover:text-emerald-700"
                        >
                            View Organization →
                        </a>
                    </div>
                    <div className="space-y-3">
                        <InfoRow label="Name" value={kyc.organization.name} />
                        <InfoRow label="Type" value={kyc.organization.type === 'NGO' ? 'NGO Recipient' : 'Food Supplier'} />
                        <InfoRow label="Verified" value={kyc.organization.isVerified ? 'Yes' : 'No'} />
                        {kyc.organization.isRestricted && (
                            <div className="p-2 bg-red-50 rounded text-sm text-red-700">
                                ⚠️ This organization is currently restricted
                            </div>
                        )}
                    </div>
                </div>

                {/* Business Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Information</h2>
                    <div className="space-y-3">
                        <InfoRow label="Registered Name" value={kyc.businessRegisteredName || '-'} />
                        <InfoRow label="Tax ID" value={kyc.taxId || '-'} />
                        <InfoRow label="Phone" value={kyc.phoneNumber || '-'} />
                        <InfoRow label="Address" value={kyc.businessAddress || '-'} />
                        {kyc.submittedAt && (
                            <InfoRow label="Submitted" value={new Date(kyc.submittedAt).toLocaleString()} />
                        )}
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {documentTypes.map(doc => (
                        <div key={doc.key} className="border border-slate-200 rounded-lg p-4">
                            <h3 className="font-medium text-slate-900 mb-2">{doc.label}</h3>
                            {docUrls[doc.key] ? (
                                <div className="space-y-2">
                                    <a
                                        href={docUrls[doc.key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-sm text-emerald-600 hover:text-emerald-700"
                                    >
                                        📄 Open Document
                                    </a>
                                    <p className="text-xs text-slate-500">Link expires in 60 seconds</p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => loadDocument(doc.key)}
                                    disabled={loadingDocs.includes(doc.key)}
                                    className="px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 disabled:opacity-50"
                                >
                                    {loadingDocs.includes(doc.key) ? 'Loading...' : 'Load Document'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
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
        PENDING: 'Pending Review',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
    };
    return (
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.NOT_SUBMITTED}`}>
            {labels[status] || status}
        </span>
    );
}
