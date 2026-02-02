import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Refresh token lock to prevent race conditions
let isRefreshing = false;
let refreshPromise: Promise<{ user: UserProfile } | null> | null = null;

/**
 * Axios client with httpOnly cookie support
 */
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track failed refresh attempts to prevent redirect loops
let failedRefreshCount = 0;
const MAX_REFRESH_FAILURES = 2;

/**
 * Axios response interceptor for automatic token refresh on 401
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only try to refresh on 401 errors, not on auth endpoints, and only once per request
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/signin') &&
            !originalRequest.url?.includes('/auth/logout') &&
            failedRefreshCount < MAX_REFRESH_FAILURES
        ) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const response = await apiClient.post('/auth/refresh');
                if (response.data?.success) {
                    failedRefreshCount = 0; // Reset on success
                    // Retry the original request
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                failedRefreshCount++;
                // If refresh fails, let the original error propagate
            }
        }

        return Promise.reject(error);
    }
);

/**
 * User roles (ADMIN excluded from signup)
 */
export type UserRole = 'SIMPLE_RECIPIENT' | 'NGO_RECIPIENT' | 'FOOD_SUPPLIER' | 'ADMIN';

/**
 * Organization info
 */
export interface OrgInfo {
    id: string;
    name: string;
    type: 'NGO' | 'FOOD_SUPPLIER';
    isVerified: boolean;
    userRole: 'OWNER' | 'MANAGER' | 'MEMBER';
}

/**
 * User profile from backend
 */
export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    avatar: string | null;
    authProvider: 'EMAIL' | 'GOOGLE';
    isEmailVerified: boolean;
    organization: OrgInfo | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Signup request payload (email/password)
 */
export interface SignupPayload {
    email: string;
    password: string;
    name?: string;
    role: Exclude<UserRole, 'ADMIN'>;
    organizationName?: string;
}

/**
 * Login request payload
 */
export interface LoginPayload {
    email: string;
    password: string;
}

/**
 * Google Auth payload
 */
export interface GoogleAuthPayload {
    googleToken: string;
    role: Exclude<UserRole, 'ADMIN'>;
    organizationName?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Array<{ path: string; message: string }>;
}

/**
 * Extract error message from axios error
 */
const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiResponse;
        if (data?.message) return data.message;
        if (data?.errors?.[0]?.message) return data.errors[0].message;
    }
    return 'Something went wrong. Please try again.';
};

/**
 * Auth API service
 * All methods use httpOnly cookies - no token storage
 */
export const authApi = {
    /**
     * Email signup - Creates account and sends OTP
     * Does NOT issue tokens - OTP verification required first
     */
    signup: async (data: SignupPayload): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/signup', data);
            return { message: response.data.message || 'OTP sent to your email' };
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    /**
     * Verify OTP and get tokens (set as httpOnly cookies)
     */
    verifyOtp: async (email: string, otp: string): Promise<{ user: UserProfile }> => {
        try {
            const response = await apiClient.post<ApiResponse<UserProfile>>('/auth/verify-otp', { email, otp });
            if (response.data.success && response.data.data) {
                return { user: response.data.data };
            }
            throw new Error(response.data.message || 'Verification failed');
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    /**
     * Resend OTP to email
     */
    resendOtp: async (email: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<ApiResponse>('/auth/resend-otp', { email });
            return { message: response.data.message || 'OTP resent successfully' };
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    /**
     * Login with email and password (must be verified)
     */
    login: async (data: LoginPayload): Promise<{ user: UserProfile }> => {
        try {
            const response = await apiClient.post<ApiResponse<UserProfile>>('/auth/signin', data);
            if (response.data.success && response.data.data) {
                return { user: response.data.data };
            }
            throw new Error(response.data.message || 'Login failed');
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    /**
     * Google OAuth signup/signin
     * - New users: Creates account with specified role
     * - Existing users: Signs in (role param ignored)
     */
    googleAuth: async (data: GoogleAuthPayload): Promise<{ user: UserProfile; isNewUser: boolean }> => {
        try {
            const response = await apiClient.post<ApiResponse<UserProfile & { isNewUser: boolean }>>('/auth/google', data);
            if (response.data.success && response.data.data) {
                const { isNewUser, ...user } = response.data.data;
                return { user, isNewUser };
            }
            throw new Error(response.data.message || 'Google authentication failed');
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    /**
     * Get current user profile (uses httpOnly cookie)
     */
    me: async (): Promise<UserProfile | null> => {
        try {
            const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/me');
            return response.data.data || null;
        } catch {
            return null;
        }
    },

    /**
     * Refresh tokens (uses httpOnly cookie)
     * Uses a lock to prevent race conditions with concurrent refresh requests
     */
    refresh: async (): Promise<{ user: UserProfile } | null> => {
        // If already refreshing, wait for the existing promise
        if (isRefreshing && refreshPromise) {
            return refreshPromise;
        }

        // Set lock and create shared promise
        isRefreshing = true;
        refreshPromise = (async () => {
            try {
                const response = await apiClient.post<ApiResponse<UserProfile>>('/auth/refresh');
                if (response.data.data) {
                    return { user: response.data.data };
                }
                return null;
            } catch {
                return null;
            } finally {
                // Release lock after a small delay to handle near-simultaneous requests
                setTimeout(() => {
                    isRefreshing = false;
                    refreshPromise = null;
                }, 100);
            }
        })();

        return refreshPromise;
    },

    /**
     * Logout - clears httpOnly cookies
     */
    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/auth/logout');
        } catch {
            // Ignore logout errors
        }
    },
};

/**
 * KYC Status types
 */
export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KycStatusResponse {
    status: KycStatus;
    businessRegisteredName: string | null;
    taxId: string | null;
    phoneNumber: string | null;
    businessAddress: string | null;
    hasDocuments: {
        taxDocument: boolean;
        registrationDoc: boolean;
        businessLicense: boolean;
        idProof: boolean;
    };
    submittedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
}

/**
 * KYC API service
 */
export const kycApi = {
    /**
     * Get current organization's KYC status
     */
    getStatus: async (): Promise<KycStatusResponse | null> => {
        try {
            const response = await apiClient.get<ApiResponse<KycStatusResponse>>('/kyc/status');
            return response.data.data || null;
        } catch {
            return null;
        }
    },

    /**
     * Upload a KYC document
     */
    uploadDocument: async (docType: string, file: File): Promise<{ success: boolean }> => {
        try {
            const formData = new FormData();
            formData.append('document', file);
            
            const response = await apiClient.post<ApiResponse>(
                `/kyc/upload/${docType}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return { success: response.data.success };
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },

    /**
     * Submit KYC for review
     */
    submit: async (data: {
        businessRegisteredName: string;
        taxId: string;
        phoneNumber: string;
        businessAddress: string;
    }): Promise<{ status: KycStatus }> => {
        try {
            const response = await apiClient.post<ApiResponse<{ status: KycStatus }>>('/kyc/submit', data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'KYC submission failed');
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    },
};

export default authApi;
