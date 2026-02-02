import { getServerUser } from '@/lib/auth.server';
import { redirect } from 'next/navigation';

/**
 * Simple Recipient Dashboard
 */
export default async function RecipientDashboard() {
    const user = await getServerUser();

    if (!user || user.role !== 'SIMPLE_RECIPIENT') {
        redirect('/dashboard');
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold">
                    Welcome back, {user.name || 'Friend'}! 👋
                </h1>
                <p className="mt-2 text-emerald-100">
                    Find and claim surplus food from local suppliers and organizations.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon="🍕"
                    label="Food Claimed"
                    value="12"
                    subtext="meals this month"
                />
                <StatCard
                    icon="🌱"
                    label="Food Saved"
                    value="8.5 kg"
                    subtext="from waste"
                />
                <StatCard
                    icon="⭐"
                    label="Impact Score"
                    value="85"
                    subtext="points earned"
                />
            </div>

            {/* Available Food Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Available Near You</h2>
                    <a href="/hub" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                        Browse Hub →
                    </a>
                </div>
                <p className="text-gray-500 text-sm">
                    Browse available food listings from local suppliers and NGOs.
                </p>
            </div>

            {/* Recent Claims */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Claims</h2>
                    <a href="/dashboard/claims" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                        View All →
                    </a>
                </div>
                <p className="text-gray-500 text-sm">
                    No recent claims. Start by browsing available food!
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
