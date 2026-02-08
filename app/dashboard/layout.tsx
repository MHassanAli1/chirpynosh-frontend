import { redirect } from 'next/navigation';
import {
    getServerUser,
    getServerKycStatus,
    isOrganizationRole,
    getDashboardPath,
    getKycRedirectPath
} from '@/lib/auth.server';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Dashboard - ChirpyNosh',
    description: 'Your ChirpyNosh dashboard',
};

/**
 * Dashboard Layout - Server Component
 * Handles authentication and role-based access control
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Get user server-side
    const user = await getServerUser();

    // Not authenticated - redirect to login
    if (!user) {
        redirect('/login');
    }

    // Get current path from headers (not available in layout, handled in page)
    const userRole = user.role;
    const expectedPath = getDashboardPath(userRole);

    // For organization users, check KYC status
    if (isOrganizationRole(userRole)) {
        const kycStatus = await getServerKycStatus();

        // If no KYC or not approved, redirect to appropriate KYC page
        if (!kycStatus || kycStatus.status !== 'APPROVED') {
            const kycPath = getKycRedirectPath(kycStatus?.status || 'NOT_SUBMITTED');
            if (kycPath) {
                redirect(kycPath);
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dashboard Sidebar */}
            <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 hidden lg:block">
                <nav className="p-4 space-y-2">
                    <DashboardNavItem
                        href={expectedPath}
                        icon="🏠"
                        label="Dashboard"
                    />

                    {userRole === 'SIMPLE_RECIPIENT' && (
                        <>
                            <DashboardNavItem href="/dashboard/recipient/browse" icon="🍕" label="Browse Food" />
                            <DashboardNavItem href="/dashboard/recipient/claims" icon="📋" label="My Claims" />
                            <DashboardNavItem href="/dashboard/recipient/profile" icon="👤" label="Profile" />
                        </>
                    )}

                    {userRole === 'NGO_RECIPIENT' && (
                        <>
                            <DashboardNavItem href="/dashboard/ngo-recipient/claims" icon="📋" label="My Claims" />
                            <DashboardNavItem href="/dashboard/ngo-recipient/profile" icon="🏢" label="Organization" />
                        </>
                    )}

                    {userRole === 'FOOD_SUPPLIER' && (
                        <>
                            <DashboardNavItem href="/dashboard/food-supplier/listings" icon="📦" label="My Listings" />
                            <DashboardNavItem href="/dashboard/food-supplier/add" icon="➕" label="Add Listing" />
                            <DashboardNavItem href="/dashboard/food-supplier/claims" icon="📋" label="Incoming Claims" />
                            <DashboardNavItem href="/dashboard/food-supplier/profile" icon="🏢" label="Organization" />
                        </>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-[calc(100vh-4rem)]">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

/**
 * Dashboard navigation item component
 */
function DashboardNavItem({
    href,
    icon,
    label
}: {
    href: string;
    icon: string;
    label: string;
}) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition-colors"
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{label}</span>
        </a>
    );
}
