import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, UserProfile } from '@/services/auth.api';

/**
 * Auth store state interface
 */
interface AuthState {
    user: UserProfile | null;
    isLoading: boolean;
    isInitialized: boolean;
    
    // Actions
    setUser: (user: UserProfile | null) => void;
    fetchUser: () => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
    refreshAuth: () => Promise<boolean>;
}

/**
 * Zustand store for user authentication state
 * Persists user profile and fetches from /me on init
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            isInitialized: false,

            setUser: (user) => set({ user }),

            fetchUser: async () => {
                set({ isLoading: true });
                try {
                    const user = await authApi.me();
                    set({ user, isLoading: false });
                } catch {
                    set({ user: null, isLoading: false });
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authApi.logout();
                } finally {
                    set({ user: null, isLoading: false });
                }
            },

            initialize: async () => {
                if (get().isInitialized) return;
                
                set({ isLoading: true });
                try {
                    // Try to refresh first (extends session)
                    const refreshResult = await authApi.refresh();
                    if (refreshResult?.user) {
                        set({ user: refreshResult.user, isInitialized: true, isLoading: false });
                        return;
                    }
                    
                    // Fallback to /me
                    const user = await authApi.me();
                    set({ user, isInitialized: true, isLoading: false });
                } catch {
                    set({ user: null, isInitialized: true, isLoading: false });
                }
            },

            refreshAuth: async () => {
                try {
                    const result = await authApi.refresh();
                    if (result?.user) {
                        set({ user: result.user });
                        return true;
                    }
                    return false;
                } catch {
                    set({ user: null });
                    return false;
                }
            },
        }),
        {
            name: 'chirpynosh-auth',
            partialize: (state) => ({ user: state.user }),
        }
    )
);

export default useAuthStore;
