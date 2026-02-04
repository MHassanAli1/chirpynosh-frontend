'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * Claims Redirect Page
 * Redirects to the appropriate claims page based on user role
 */
export default function ClaimsRedirectPage() {
    const router = useRouter();
    const { user, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
                return;
            }

            // Redirect based on role
            switch (user.role) {
                case 'SIMPLE_RECIPIENT':
                    router.push('/dashboard/recipient/claims');
                    break;
                case 'NGO_RECIPIENT':
                    router.push('/dashboard/ngo-recipient/claims');
                    break;
                case 'FOOD_SUPPLIER':
                    router.push('/dashboard/food-supplier/claims');
                    break;
                default:
                    router.push('/dashboard');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
    );
}
