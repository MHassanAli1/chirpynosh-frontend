'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as adminApi from '@/services/admin.api';

type Role = 'SIMPLE_RECIPIENT' | 'NGO_RECIPIENT' | 'FOOD_SUPPLIER' | 'ADMIN';

/**
 * Users Management Page with infinite scroll and filters
 */
export default function UsersManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialRole = searchParams.get('role') as Role | null;
    const initialRestricted = searchParams.get('isRestricted');
    const initialSearch = searchParams.get('search') || '';

    const [users, setUsers] = useState<adminApi.AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');

    // Filters
    const [role, setRole] = useState<Role | ''>(initialRole || '');
    const [isRestricted, setIsRestricted] = useState<string>(initialRestricted || '');
    const [search, setSearch] = useState(initialSearch);
    const [searchInput, setSearchInput] = useState(initialSearch);

    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Fetch data
    const fetchData = useCallback(async (pageNum: number, reset = false) => {
        try {
            if (pageNum === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            const result = await adminApi.getUsers({
                page: pageNum,
                limit: 10,
                role: role || undefined,
                isRestricted: isRestricted === 'true' ? true : isRestricted === 'false' ? false : undefined,
                search: search || undefined,
            });

            if (reset || pageNum === 1) {
                setUsers(result.users);
            } else {
                setUsers(prev => [...prev, ...result.users]);
            }
            setHasMore(result.hasMore);
            setPage(pageNum);
        } catch {
            setError('Failed to load users');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [role, isRestricted, search]);

    useEffect(() => {
        fetchData(1, true);
    }, [fetchData]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (role) params.set('role', role);
        if (isRestricted) params.set('isRestricted', isRestricted);
        if (search) params.set('search', search);
        router.replace(`/admin-dash/users?${params.toString()}`);
    }, [role, isRestricted, search, router]);

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
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, page, fetchData]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
    };

    // User Actions
    const handleRestrict = async (id: string) => {
        const reason = prompt('Enter restriction reason:');
        if (!reason) return;
        try {
            await adminApi.restrictUser(id, reason);
            fetchData(1, true);
        } catch {
            setError('Failed to restrict user');
        }
    };

    const handleUnrestrict = async (id: string) => {
        if (!confirm('Unrestrict this user?')) return;
        try {
            await adminApi.unrestrictUser(id);
            fetchData(1, true);
        } catch {
            setError('Failed to unrestrict user');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await adminApi.deleteUser(id);
            fetchData(1, true);
        } catch {
            setError('Failed to delete user');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                <p className="text-slate-600 mt-1">Manage user accounts and permissions</p>
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
                                placeholder="Search by email or name..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder:text-slate-500"
                            />
                            <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                        </div>
                    </form>

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role | '')}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    >
                        <option value="">All Roles</option>
                        <option value="SIMPLE_RECIPIENT">Simple Recipients</option>
                        <option value="NGO_RECIPIENT">NGO Recipients</option>
                        <option value="FOOD_SUPPLIER">Food Suppliers</option>
                        <option value="ADMIN">Administrators</option>
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

                    {(role || isRestricted || search) && (
                        <button
                            onClick={() => {
                                setRole('');
                                setIsRestricted('');
                                setSearch('');
                                setSearchInput('');
                            }}
                            className="text-slate-600 hover:text-slate-800 text-sm"
                        >
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
            ) : users.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                    <span className="text-4xl mb-4 block">👥</span>
                    <p className="text-slate-600">No users found</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Organization</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Joined</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm text-slate-700">
                                                            {user.name?.[0] || user.email[0].toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{user.name || 'No name'}</div>
                                                    <div className="text-xs text-slate-600">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-700">
                                            {user.orgMemberships?.[0]?.org.name || '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {user.isRestricted ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                    🚫 Restricted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                                    ✓ Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={`/admin-dash/users/${user.id}`}
                                                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                                                >
                                                    View
                                                </a>
                                                {user.role !== 'ADMIN' && (
                                                    <>
                                                        {user.isRestricted ? (
                                                            <button
                                                                onClick={() => handleUnrestrict(user.id)}
                                                                className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                                                            >
                                                                Unrestrict
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRestrict(user.id)}
                                                                className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                                                            >
                                                                Restrict
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                                        >
                                                            Delete
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

                    <div ref={loadMoreRef} className="py-4 text-center">
                        {isLoadingMore && (
                            <div className="animate-spin w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                        )}
                        {!hasMore && users.length > 0 && (
                            <p className="text-sm text-slate-500">No more users</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    const styles: Record<string, string> = {
        SIMPLE_RECIPIENT: 'bg-slate-100 text-slate-700',
        NGO_RECIPIENT: 'bg-blue-100 text-blue-700',
        FOOD_SUPPLIER: 'bg-orange-100 text-orange-700',
        ADMIN: 'bg-purple-100 text-purple-700',
    };
    const labels: Record<string, string> = {
        SIMPLE_RECIPIENT: 'Recipient',
        NGO_RECIPIENT: 'NGO',
        FOOD_SUPPLIER: 'Supplier',
        ADMIN: 'Admin',
    };
    return (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[role] || styles.SIMPLE_RECIPIENT}`}>
            {labels[role] || role}
        </span>
    );
}
