import { getServerUser, getServerKycStatus } from '@/lib/auth.server';
import { redirect } from 'next/navigation';

/**
 * NGO Recipient Dashboard
 * Requires approved KYC to access
 */
export default async function NgoRecipientDashboard() {
    const user = await getServerUser();

    if (!user || user.role !== 'NGO_RECIPIENT') {
        redirect('/dashboard');
    }

    const kycStatus = await getServerKycStatus();
    if (!kycStatus || kycStatus.status !== 'APPROVED') {
        redirect('/kyc/submit');
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                        ✓ Verified NGO
                    </span>
                </div>
                <h1 className="text-2xl font-bold">
                    {user.organization?.name || 'Your Organization'}
                </h1>
                <p className="mt-2 text-blue-100">
                    Manage your food claims and help distribute to those in need.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon="🍕" label="Active Claims" value="5" subtext="in progress" />
                <StatCard icon="✅" label="Completed" value="42" subtext="this month" />
                <StatCard icon="👥" label="People Served" value="320" subtext="beneficiaries" />
                <StatCard icon="🌱" label="Food Saved" value="156 kg" subtext="from waste" />
            </div>

            {/* Active Claims */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Active Claims</h2>
                    <a href="/dashboard/claims" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View All →
                    </a>
                </div>
                <p className="text-gray-500 text-sm">
                    Track and manage your organization&apos;s food claims.
                </p>
            </div>

            {/* Browse Available Food */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Available Food</h2>
                    <a href="/hub" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Browse Hub →
                    </a>
                </div>
                <p className="text-gray-500 text-sm">
                    Find available food donations from verified suppliers.
                </p>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtext }: {
    icon: string;
    label: string;
    value: string;
    subtext: string;
}) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-gray-500">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-400">{subtext}</div>
        </div>
    );
}
