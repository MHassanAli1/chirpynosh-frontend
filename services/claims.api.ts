'use client';

import axios from 'axios';
import { type FoodListing, type ClaimStatus } from './listings.api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface MyClaim {
  id: string;
  listingId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: ClaimStatus;
  createdAt: string;
  pickedUpAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  listing?: Partial<FoodListing> & {
    organization?: {
      name: string;
    };
  };
}

export interface ClaimsResponse {
  success: boolean;
  claims: MyClaim[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ClaimStats {
  totalClaims: number;
  pendingClaims: number;
  completedClaims: number;
  totalFoodSaved: number;
  impactScore: number;
}

/**
 * Get user's claims with optional filters
 */
export const getClaims = async (params?: {
  status?: ClaimStatus;
  page?: number;
  limit?: number;
}): Promise<ClaimsResponse> => {
  const { data } = await axios.get(`${API_URL}/claims`, {
    params,
    withCredentials: true,
  });
  return data;
};

/**
 * Get a single claim by ID
 */
export const getClaimById = async (claimId: string): Promise<{ claim: MyClaim }> => {
  const { data } = await axios.get(`${API_URL}/claims/${claimId}`, {
    withCredentials: true,
  });
  return data;
};

/**
 * Cancel a claim
 */
export const cancelClaim = async (claimId: string, reason?: string): Promise<{ claim: MyClaim }> => {
  const { data } = await axios.post(
    `${API_URL}/claims/${claimId}/cancel`,
    { reason: reason || 'Cancelled by user' },
    { withCredentials: true }
  );
  return data;
};

/**
 * Resend pickup OTP
 */
export const resendOtp = async (claimId: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await axios.post(
    `${API_URL}/claims/${claimId}/resend-otp`,
    {},
    { withCredentials: true }
  );
  return data;
};

/**
 * Get claim statistics for dashboard
 */
export const getClaimStats = async (): Promise<ClaimStats> => {
  try {
    const { data } = await axios.get(`${API_URL}/claims/stats`, {
      withCredentials: true,
    });
    return data.stats;
  } catch {
    // Return default stats if endpoint not available
    return {
      totalClaims: 0,
      pendingClaims: 0,
      completedClaims: 0,
      totalFoodSaved: 0,
      impactScore: 0,
    };
  }
};

/**
 * Calculate stats from claims array (client-side fallback)
 */
export const calculateStatsFromClaims = (claims: MyClaim[]): ClaimStats => {
  const pendingClaims = claims.filter(c => c.status === 'PENDING').length;
  const completedClaims = claims.filter(c => c.status === 'COMPLETED').length;
  
  // Estimate food saved (rough calculation based on quantity)
  const totalFoodSaved = claims
    .filter(c => c.status === 'COMPLETED')
    .reduce((sum, c) => sum + c.quantity, 0);

  // Impact score calculation (example formula)
  const impactScore = completedClaims * 10 + totalFoodSaved * 2;

  return {
    totalClaims: claims.length,
    pendingClaims,
    completedClaims,
    totalFoodSaved,
    impactScore,
  };
};

export const claimsApi = {
  getClaims,
  getClaimById,
  cancelClaim,
  resendOtp,
  getClaimStats,
  calculateStatsFromClaims,
};

export default claimsApi;
