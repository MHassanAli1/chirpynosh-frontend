import { cookies } from 'next/headers';
import type { UserProfile, KycStatusResponse } from '@/services/auth.api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Server-side auth utilities for Next.js App Router
 * These functions run on the server and can access cookies directly
 */

/**
 * Get current user from server-side (uses cookies from request)
 */
export async function getServerUser(): Promise<UserProfile | null> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;
        const refreshToken = cookieStore.get('refreshToken')?.value;
        
        if (!accessToken && !refreshToken) {
            return null;
        }

        // Build cookie header
        const cookieHeader = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ');

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Don't cache auth requests
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error('Server auth error:', error);
        return null;
    }
}

/**
 * Get KYC status for organization users (server-side)
 */
export async function getServerKycStatus(): Promise<KycStatusResponse | null> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;
        
        if (!accessToken) {
            return null;
        }

        const cookieHeader = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ');

        const response = await fetch(`${API_BASE_URL}/kyc/status`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error('Server KYC status error:', error);
        return null;
    }
}

/**
 * Check if user role requires organization/KYC verification
 */
export function isOrganizationRole(role: string): boolean {
    return role === 'NGO_RECIPIENT' || role === 'FOOD_SUPPLIER';
}

/**
 * Get the dashboard path for a given role
 */
export function getDashboardPath(role: string): string {
    switch (role) {
        case 'SIMPLE_RECIPIENT':
            return '/dashboard/recipient';
        case 'NGO_RECIPIENT':
            return '/dashboard/ngo-recipient';
        case 'FOOD_SUPPLIER':
            return '/dashboard/food-supplier';
        case 'ADMIN':
            return '/admin';
        default:
            return '/dashboard';
    }
}

/**
 * Get KYC redirect path based on status
 */
export function getKycRedirectPath(status: string): string {
    switch (status) {
        case 'NOT_SUBMITTED':
        case 'REJECTED':
            return '/kyc/submit';
        case 'PENDING':
            return '/kyc/status';
        case 'APPROVED':
            return null as unknown as string; // No redirect needed
        default:
            return '/kyc/submit';
    }
}
