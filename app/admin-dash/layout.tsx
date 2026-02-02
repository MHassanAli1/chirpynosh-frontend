import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth.server';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard - ChirpyNosh',
    description: 'Admin panel for managing users, organizations, and KYC',
};

const navItems = [
    { href: '/admin-dash', label: 'Dashboard', icon: '📊' },
    { href: '/admin-dash/kyc', label: 'KYC Review', icon: '📋' },
    { href: '/admin-dash/users', label: 'Users', icon: '👥' },
    { href: '/admin-dash/organizations', label: 'Organizations', icon: '🏢' },
];

/**
 * Admin Dashboard Layout
 * Only accessible to ADMIN users
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getServerUser();

    // Check authentication
    if (!user) {
        redirect('/login');
    }

    // Check admin role
    if (user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                {/* Logo */}
                <div className="p-5 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🛡️</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Admin Panel</h1>
                            <p className="text-xs text-slate-400">ChirpyNosh</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
                            {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-sm">{user.name?.[0] || user.email[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name || 'Admin'}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}
