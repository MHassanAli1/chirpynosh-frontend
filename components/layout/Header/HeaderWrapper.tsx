'use client';

import { useEffect } from 'react';
import Header from './header';
import { useAuthStore } from '@/stores/authStore';

/**
 * HeaderWrapper - Client Component wrapper for Header
 * Connects auth store to Header component
 */
export default function HeaderWrapper() {
    const { user, initialize, logout } = useAuthStore();

    // Initialize auth state on mount (fetch /me)
    useEffect(() => {
        initialize();
    }, [initialize]);

    const handleLogout = async () => {
        await logout();
        // Optionally redirect to login
        window.location.href = '/login';
    };

    // Map Zustand user to Header's expected format
    const headerUser = user ? {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role.toLowerCase() as 'simple_recipient' | 'ngo_recipient' | 'food_supplier' | 'admin',
    } : null;

    return <Header user={headerUser} onLogout={handleLogout} />;
}
