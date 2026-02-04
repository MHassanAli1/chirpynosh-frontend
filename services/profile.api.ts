import { apiClient, UserProfile, ApiResponse } from './auth.api';

/**
 * Profile update payload
 */
export interface UpdateProfilePayload {
    name?: string;
}

/**
 * Profile stats response
 */
export interface ProfileStats {
    totalClaims: number;
    completedClaims: number;
    pendingClaims: number;
    cancelledClaims: number;
    totalListings?: number;
    activeListings?: number;
}

/**
 * Profile API service
 */
export const profileApi = {
    /**
     * Get current user's profile
     */
    getProfile: async (): Promise<UserProfile> => {
        try {
            const response = await apiClient.get<ApiResponse<UserProfile>>('/profile');
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to get profile');
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Failed to get profile');
        }
    },

    /**
     * Update user profile
     */
    updateProfile: async (data: UpdateProfilePayload): Promise<UserProfile> => {
        try {
            const response = await apiClient.patch<ApiResponse<UserProfile>>('/profile', data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update profile');
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Failed to update profile');
        }
    },

    /**
     * Upload avatar image
     */
    uploadAvatar: async (file: File): Promise<UserProfile> => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await apiClient.post<ApiResponse<UserProfile>>(
                '/profile/avatar',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to upload avatar');
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Failed to upload avatar');
        }
    },

    /**
     * Delete avatar
     */
    deleteAvatar: async (): Promise<UserProfile> => {
        try {
            const response = await apiClient.delete<ApiResponse<UserProfile>>('/profile/avatar');
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to delete avatar');
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Failed to delete avatar');
        }
    },

    /**
     * Get profile stats
     */
    getStats: async (): Promise<ProfileStats> => {
        try {
            const response = await apiClient.get<ApiResponse<ProfileStats>>('/profile/stats');
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to get profile stats');
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Failed to get profile stats');
        }
    },
};

export default profileApi;
