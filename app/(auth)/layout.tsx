import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ChirpyNosh - Join the Food Rescue Network',
    description: 'Sign up or login to ChirpyNosh to reduce food waste and help your community.',
};

/**
 * Auth layout - No header, centered card, light green background
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#ecfdf5] flex items-center justify-center p-4">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Top right blob */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
                {/* Bottom left blob */}
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
                {/* Center accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <main className="relative z-10 w-full max-w-md">
                {children}
            </main>
        </div>
    );
}
