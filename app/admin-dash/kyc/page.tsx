'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as adminApi from '@/services/admin.api';

type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
type OrgType = 'NGO' | 'SUPPLIER';

/**
 * KYC Management Page with infinite scroll and filters
 */
export default function KycManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filters from URL
    const initialStatus = searchParams.get('status') as KycStatus | null;
    const initialOrgType = searchParams.get('orgType') as OrgType | null;
    const initialSearch = searchParams.get('search') || '';

    const [submissions, setSubmissions] = useState<adminApi.KycSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');

    // Filters
    const [status, setStatus] = useState<KycStatus | ''>(initialStatus || '');
    const [orgType, setOrgType] = useState<OrgType | ''>(initialOrgType || '');
    const [search, setSearch] = useState(initialSearch);
    const [searchInput, setSearchInput] = useState(initialSearch);

    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Fetch data
    const fetchData = useCallback(async (pageNum: number, reset = false) => {
        try {
            if (pageNum === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            const result = await adminApi.getKycSubmissions({
                page: pageNum,
                limit: 10,
                status: status || undefined,
                orgType: orgType || undefined,
                search: search || undefined,
            });

            if (reset || pageNum === 1) {
                setSubmissions(result.submissions);
            } else {
                setSubmissions(prev => [...prev, ...result.submissions]);
            }
            setHasMore(result.hasMore);
            setPage(pageNum);
        } catch {
            setError('Failed to load KYC submissions');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [status, orgType, search]);

    // Initial load
    useEffect(() => {
        fetchData(1, true);
    }, [fetchData]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (orgType) params.set('orgType', orgType);
        if (search) params.set('search', search);
        router.replace(`/admin-dash/kyc?${params.toString()}`);
    }, [status, orgType, search, router]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    fetchData(page + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, page, fetchData]);

    // Handle search submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
    };

    // Handle filter change
    const handleFilterChange = (filterType: 'status' | 'orgType', value: string) => {
        if (filterType === 'status') {
            setStatus(value as KycStatus | '');
        } else {
            setOrgType(value as OrgType | '');
        }
    };

    // KYC Actions
    const handleApprove = async (id: string) => {
        if (!confirm('Approve this KYC submission?')) return;
        try {
            await adminApi.approveKyc(id);
            fetchData(1, true);
        } catch {
            setError('Failed to approve KYC');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await adminApi.rejectKyc(id, reason);
            fetchData(1, true);
        } catch {
            setError('Failed to reject KYC');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">KYC Review</h1>
                    <p className="text-slate-600 mt-1">Manage organization verification requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by organization name..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder:text-slate-500"
                            />
                            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                        </div>
                    </form>

                    {/* Status Filter */}
                    <select
                        value={status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="NOT_SUBMITTED">Not Submitted</option>
                    </select>

                    {/* Org Type Filter */}
                    <select
                        value={orgType}
                        onChange={(e) => handleFilterChange('orgType', e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    >
                        <option value="">All Types</option>
                        <option value="NGO">NGO Recipients</option>
                        <option value="SUPPLIER">Food Suppliers</option>
                    </select>

                    {/* Reset */}
                    {(status || orgType || search) && (
                        <button
                            onClick={() => {
                                setStatus('');
                                setOrgType('');
                                setSearch('');
                                setSearchInput('');
                            }}
                            className="text-slate-500 hover:text-slate-700 text-sm"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
            )}

            {/* Loading */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                </div>
            ) : submissions.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <span className="text-4xl mb-4 block">📋</span>
                    <p className="text-slate-500">No KYC submissions found</p>
                </div>
            ) : (
                <>
                    {/* Submissions List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Organization</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Submitted</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {submissions.map(kyc => (
                                    <tr key={kyc.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-slate-900">{kyc.orgName}</div>
                                            {kyc.businessRegisteredName && (
                                                <div className="text-xs text-slate-500">{kyc.businessRegisteredName}</div>
                                            )}
                                            {kyc.isOrgRestricted && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">Restricted</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${kyc.orgType === 'NGO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {kyc.orgType === 'NGO' ? '🏛️ NGO' : '🍕 Supplier'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={kyc.status} />
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={`/admin-dash/kyc/${kyc.id}`}
                                                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                                                >
                                                    View
                                                </a>
                                                {kyc.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(kyc.id)}
                                                            className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(kyc.id)}
                                                            className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Load More Trigger */}
                    <div ref={loadMoreRef} className="py-4 text-center">
                        {isLoadingMore && (
                            <div className="animate-spin w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                        )}
                        {!hasMore && submissions.length > 0 && (
                            <p className="text-sm text-slate-400">No more submissions</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        NOT_SUBMITTED: 'bg-slate-100 text-slate-600',
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
