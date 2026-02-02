'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as adminApi from '@/services/admin.api';

type OrgType = 'NGO' | 'SUPPLIER';

/**
 * Organizations Management Page with infinite scroll and filters
 */
export default function OrganizationsManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialType = searchParams.get('type') as OrgType | null;
    const initialVerified = searchParams.get('isVerified');
    const initialRestricted = searchParams.get('isRestricted');
    const initialSearch = searchParams.get('search') || '';

    const [organizations, setOrganizations] = useState<adminApi.AdminOrganization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');

    // Filters
    const [type, setType] = useState<OrgType | ''>(initialType || '');
    const [isVerified, setIsVerified] = useState<string>(initialVerified || '');
    const [isRestricted, setIsRestricted] = useState<string>(initialRestricted || '');
    const [search, setSearch] = useState(initialSearch);
    const [searchInput, setSearchInput] = useState(initialSearch);

    const loadMoreRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async (pageNum: number, reset = false) => {
        try {
            if (pageNum === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            const result = await adminApi.getOrganizations({
                page: pageNum,
                limit: 10,
                type: type || undefined,
                isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
                isRestricted: isRestricted === 'true' ? true : isRestricted === 'false' ? false : undefined,
                search: search || undefined,
            });

            if (reset || pageNum === 1) {
                setOrganizations(result.organizations);
            } else {
                setOrganizations(prev => [...prev, ...result.organizations]);
            }
            setHasMore(result.hasMore);
            setPage(pageNum);
        } catch {
            setError('Failed to load organizations');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [type, isVerified, isRestricted, search]);

    useEffect(() => {
        fetchData(1, true);
    }, [fetchData]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (type) params.set('type', type);
        if (isVerified) params.set('isVerified', isVerified);
        if (isRestricted) params.set('isRestricted', isRestricted);
        if (search) params.set('search', search);
        router.replace(`/admin-dash/organizations?${params.toString()}`);
    }, [type, isVerified, isRestricted, search, router]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    fetchData(page + 1);
                }
            },
            { threshold: 0.1 }
        );
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, page, fetchData]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
    };

    const handleRestrict = async (id: string) => {
        const reason = prompt('Enter restriction reason:');
        if (!reason) return;
        try {
            await adminApi.restrictOrganization(id, reason);
            fetchData(1, true);
        } catch {
            setError('Failed to restrict organization');
        }
    };

    const handleUnrestrict = async (id: string) => {
        if (!confirm('Unrestrict this organization?')) return;
        try {
            await adminApi.unrestrictOrganization(id);
            fetchData(1, true);
        } catch {
            setError('Failed to unrestrict organization');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
        try {
            await adminApi.deleteOrganization(id);
            fetchData(1, true);
        } catch {
            setError('Failed to delete organization');
        }
    };

    const clearFilters = () => {
        setType('');
        setIsVerified('');
        setIsRestricted('');
        setSearch('');
        setSearchInput('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
                <p className="text-slate-600 mt-1">Manage NGO recipients and food suppliers</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex flex-wrap gap-4 items-center">
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

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as OrgType | '')}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    >
                        <option value="">All Types</option>
                        <option value="NGO">NGO Recipients</option>
                        <option value="SUPPLIER">Food Suppliers</option>
                    </select>

                    <select
                        value={isVerified}
                        onChange={(e) => setIsVerified(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    >
                        <option value="">All Verification</option>
                        <option value="true">Verified</option>
                        <option value="false">Not Verified</option>
                    </select>

                    <select
                        value={isRestricted}
                        onChange={(e) => setIsRestricted(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    >
                        <option value="">All Status</option>
                        <option value="false">Active</option>
                        <option value="true">Restricted</option>
                    </select>

                    {(type || isVerified || isRestricted || search) && (
                        <button onClick={clearFilters} className="text-slate-500 hover:text-slate-700 text-sm">
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                </div>
            ) : organizations.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <span className="text-4xl mb-4 block">🏢</span>
                    <p className="text-slate-600">No organizations found</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Organization</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Owner</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">KYC</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {organizations.map(org => (
                                    <tr key={org.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    {org.type === 'NGO' ? '🏛️' : '🍕'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{org.name}</div>
                                                    <div className="text-xs text-slate-500">{org.memberCount} members</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${org.type === 'NGO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {org.type === 'NGO' ? 'NGO' : 'Supplier'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {org.owner?.name || org.owner?.email || '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <KycBadge status={org.kycStatus} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                {org.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full w-fit">
                                                        ✓ Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full w-fit">
                                                        Not Verified
                                                    </span>
                                                )}
                                                {org.isRestricted && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full w-fit">
                                                        🚫 Restricted
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={`/admin-dash/organizations/${org.id}`}
                                                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                                                >
                                                    View
                                                </a>
                                                {org.isRestricted ? (
                                                    <button
                                                        onClick={() => handleUnrestrict(org.id)}
                                                        className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                                                    >
                                                        Unrestrict
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRestrict(org.id)}
                                                        className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                                                    >
                                                        Restrict
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(org.id)}
                                                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div ref={loadMoreRef} className="py-4 text-center">
                        {isLoadingMore && (
                            <div className="animate-spin w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                        )}
                        {!hasMore && organizations.length > 0 && (
                            <p className="text-sm text-slate-400">No more organizations</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function KycBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        NOT_SUBMITTED: 'bg-slate-100 text-slate-600',
        PENDING: 'bg-amber-100 text-amber-700',
        APPROVED: 'bg-emerald-100 text-emerald-700',
        REJECTED: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
        NOT_SUBMITTED: 'No KYC',
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
