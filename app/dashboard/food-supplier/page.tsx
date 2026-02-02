import { getServerUser, getServerKycStatus } from '@/lib/auth.server';
import { redirect } from 'next/navigation';

/**
 * Food Supplier Dashboard
 * Requires approved KYC to access
 */
export default async function FoodSupplierDashboard() {
    const user = await getServerUser();

    if (!user || user.role !== 'FOOD_SUPPLIER') {
        redirect('/dashboard');
    }

    const kycStatus = await getServerKycStatus();
    if (!kycStatus || kycStatus.status !== 'APPROVED') {
        redirect('/kyc/submit');
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                        ✓ Verified Supplier
                    </span>
                </div>
                <h1 className="text-2xl font-bold">
                    {user.organization?.name || 'Your Business'}
                </h1>
                <p className="mt-2 text-orange-100">
                    Manage your food listings and connect with recipients.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon="📦" label="Active Listings" value="8" subtext="available" />
                <StatCard icon="📋" label="Pending Claims" value="3" subtext="to review" />
                <StatCard icon="✅" label="Completed" value="67" subtext="donations" />
                <StatCard icon="🌱" label="Food Saved" value="234 kg" subtext="from waste" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                    href="/dashboard/food-supplier/add"
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            ➕
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Add New Listing</h3>
                            <p className="text-sm text-gray-500">Post surplus food for donation</p>
                        </div>
                    </div>
                </a>

                <a
                    href="/dashboard/food-supplier/claims"
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📋
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Review Claims</h3>
                            <p className="text-sm text-gray-500">3 pending claims to review</p>
                        </div>
                    </div>
                </a>
            </div>

            {/* Active Listings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Your Listings</h2>
                    <a href="/dashboard/food-supplier/listings" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                        View All →
                    </a>
                </div>
                <p className="text-gray-500 text-sm">
                    Manage your active food listings and track donation progress.
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
