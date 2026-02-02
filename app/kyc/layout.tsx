import { redirect } from 'next/navigation';
import { getServerUser, isOrganizationRole } from '@/lib/auth.server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'KYC Verification - ChirpyNosh',
    description: 'Complete your organization verification',
};

/**
 * KYC Layout - Only for organization users
 */
export default async function KycLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getServerUser();

    // Not authenticated
    if (!user) {
        redirect('/login');
    }

    // Only org users need KYC
    if (!isOrganizationRole(user.role)) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">🏢</span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-gray-900">
                                Organization Verification
                            </h1>
                            <p className="text-sm text-gray-500">
                                {user.organization?.name || 'Your Organization'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
