import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance with credentials
const listingsApi = axios.create({
  baseURL: `${API_URL}/listings`,
  withCredentials: true,
});

// Hub API (public)
const hubApi = axios.create({
  baseURL: `${API_URL}/hub`,
  withCredentials: true,
});

// ============================================================================
// TYPES
// ============================================================================

export type ClaimerType = 'NGO' | 'INDIVIDUAL' | 'BOTH';
export type ListingStatus = 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'EXPIRED' | 'CANCELLED';
export type ClaimStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface FoodListing {
  id: string;
  orgId: string;
  title: string;
  description: string | null;
  category: string;
  totalStock: number;
  remainingStock: number;
  unit: string;
  originalPrice: string; // Decimal as string
  subsidizedPrice: string;
  claimerType: ClaimerType;
  pickupStartAt: string;
  pickupEndAt: string;
  expiresAt: string;
  status: ListingStatus;
  imageKeys: string[];
  videoKey: string | null;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    name: string;
  };
  _count?: {
    claims: number;
  };
}

export interface FoodClaim {
  id: string;
  listingId: string;
  claimerId: string;
  claimerOrgId: string | null;
  claimerType: 'NGO' | 'INDIVIDUAL';
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: ClaimStatus;
  completedAt: string | null;
  pickedUpAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  listing?: Partial<FoodListing>;
  claimer?: {
    id: string;
    name: string | null;
    email: string;
    organization?: {
      name: string;
    };
  };
  claimerOrg?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateListingPayload {
  title: string;
  description?: string;
  category: string;
  totalStock: number;
  unit: string;
  originalPrice: number;
  subsidizedPrice: number;
  claimerType: ClaimerType;
  pickupStartAt: string;
  pickupEndAt: string;
  expiresAt: string;
  imageKeys: string[];
  videoKey?: string;
}

export interface UpdateListingPayload {
  title?: string;
  description?: string;
  category?: string;
  totalStock?: number;
  unit?: string;
  originalPrice?: number;
  subsidizedPrice?: number;
  claimerType?: ClaimerType;
  pickupStartAt?: string;
  pickupEndAt?: string;
  expiresAt?: string;
  status?: 'ACTIVE' | 'PAUSED';
  imageKeys?: string[];
  videoKey?: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  listings?: T[];
  claims?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadResponse {
  success: boolean;
  publicId: string;
  url: string;
}

// ============================================================================
// SUPPLIER LISTINGS API
// ============================================================================

/**
 * Get supplier's own listings
 */
export const getMyListings = async (params?: {
  status?: ListingStatus;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<FoodListing>> => {
  const { data } = await listingsApi.get('/', { params });
  return data;
};

/**
 * Get a single listing by ID
 */
export const getListingById = async (id: string): Promise<{ success: boolean; listing: FoodListing }> => {
  const { data } = await listingsApi.get(`/${id}`);
  return data;
};

/**
 * Create a new listing
 */
export const createListing = async (payload: CreateListingPayload): Promise<{ success: boolean; listing: FoodListing }> => {
  const { data } = await listingsApi.post('/', payload);
  return data;
};

/**
 * Update a listing
 */
export const updateListing = async (
  id: string,
  payload: UpdateListingPayload
): Promise<{ success: boolean; listing: FoodListing }> => {
  const { data } = await listingsApi.patch(`/${id}`, payload);
  return data;
};

/**
 * Pause a listing
 */
export const pauseListing = async (id: string): Promise<{ success: boolean; listing: FoodListing }> => {
  const { data } = await listingsApi.patch(`/${id}/pause`);
  return data;
};

/**
 * Resume a paused listing
 */
export const resumeListing = async (id: string): Promise<{ success: boolean; listing: FoodListing }> => {
  const { data } = await listingsApi.patch(`/${id}/resume`);
  return data;
};

/**
 * Delete (cancel) a listing
 */
export const deleteListing = async (id: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await listingsApi.delete(`/${id}`);
  return data;
};

// ============================================================================
// SUPPLIER CLAIMS API
// ============================================================================

/**
 * Get claims for supplier's listings
 */
export const getSupplierClaims = async (params?: {
  status?: ClaimStatus;
  listingId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<FoodClaim>> => {
  const { data } = await listingsApi.get('/claims', { params });
  return data;
};

/**
 * Verify pickup OTP
 */
export const verifyPickupOtp = async (
  claimId: string,
  otp: string
): Promise<{ success: boolean; claim: FoodClaim; message: string }> => {
  const { data } = await listingsApi.post(`/claims/${claimId}/verify`, { otp });
  return data;
};

// ============================================================================
// MEDIA UPLOAD API
// ============================================================================

/**
 * Upload a listing image
 */
export const uploadListingImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const { data } = await listingsApi.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/**
 * Upload a listing video
 */
export const uploadListingVideo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('video', file);
  
  const { data } = await listingsApi.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/**
 * Delete uploaded media
 * Note: publicId is passed in the body since it can contain slashes
 */
export const deleteUploadedMedia = async (publicId: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await listingsApi.delete('/upload', { data: { publicId } });
  return data;
};

// ============================================================================
// PUBLIC HUB API
// ============================================================================

export interface BrowseListingsParams {
  search?: string;
  category?: string;
  claimerType?: 'NGO' | 'INDIVIDUAL';
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'createdAt' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Browse public listings
 */
export const browseListings = async (params?: BrowseListingsParams): Promise<PaginatedResponse<FoodListing>> => {
  const { data } = await hubApi.get('/listings', { params });
  return data;
};

/**
 * Get a public listing by ID
 */
export const getPublicListingById = async (id: string): Promise<{ success: boolean; listing: FoodListing }> => {
  const { data } = await hubApi.get(`/listings/${id}`);
  return data;
};

/**
 * Get all categories
 */
export const getCategories = async (): Promise<{ success: boolean; categories: { name: string; count: number }[] }> => {
  const { data } = await hubApi.get('/categories');
  return data;
};

/**
 * Get verified suppliers
 */
export const getVerifiedSuppliers = async (): Promise<{
  success: boolean;
  suppliers: { id: string; name: string; listingCount: number }[];
}> => {
  const { data } = await hubApi.get('/suppliers');
  return data;
};

/**
 * Get verified NGOs
 */
export const getVerifiedNGOs = async (): Promise<{
  success: boolean;
  ngos: { id: string; name: string; claimCount: number }[];
}> => {
  const { data } = await hubApi.get('/ngos');
  return data;
};

// ============================================================================
// CLOUDINARY URL HELPERS
// ============================================================================

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';

/**
 * Get the full URL for a listing image
 */
export const getListingImageUrl = (publicId: string, options?: { width?: number; height?: number }): string => {
  const transforms = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  transforms.push('c_fill', 'f_auto', 'q_auto');
  
  const transformStr = transforms.length > 0 ? `${transforms.join(',')}/` : '';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}${publicId}`;
};

/**
 * Get the full URL for a listing video
 */
export const getListingVideoUrl = (publicId: string): string => {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${publicId}`;
};

/**
 * Get video thumbnail URL
 */
export const getVideoThumbnailUrl = (publicId: string, options?: { width?: number; height?: number }): string => {
  const transforms = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  transforms.push('c_fill', 'f_auto', 'q_auto');
  
  const transformStr = transforms.length > 0 ? `${transforms.join(',')}/` : '';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformStr}${publicId}.jpg`;
};
