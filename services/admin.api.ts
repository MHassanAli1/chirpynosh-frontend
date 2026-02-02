import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance with credentials
const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
  withCredentials: true,
});

// ============================================================================
// TYPES
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'SIMPLE_RECIPIENT' | 'NGO_RECIPIENT' | 'FOOD_SUPPLIER' | 'ADMIN';
  avatar: string | null;
  authProvider: 'EMAIL' | 'GOOGLE';
  isEmailVerified: boolean;
  isRestricted: boolean;
  restrictedAt: string | null;
  restrictionReason: string | null;
  createdAt: string;
  orgMemberships?: {
    org: {
      id: string;
      name: string;
      type: 'NGO' | 'SUPPLIER';
      isVerified: boolean;
    };
  }[];
}

export interface AdminOrganization {
  id: string;
  name: string;
  type: 'NGO' | 'SUPPLIER';
  isVerified: boolean;
  isRestricted: boolean;
  restrictionReason: string | null;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  memberCount: number;
  owner: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  createdAt: string;
}

export interface KycSubmission {
  id: string;
  orgId: string;
  orgName: string;
  orgType: 'NGO' | 'SUPPLIER';
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  businessRegisteredName: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  isOrgRestricted: boolean;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalOrgs: number;
    pendingKyc: number;
    restrictedUsers: number;
    restrictedOrgs: number;
  };
  usersByRole: Record<string, number>;
  orgsByType: Record<string, number>;
  recent: {
    newUsersThisWeek: number;
    kycSubmissionsThisWeek: number;
  };
}

// ============================================================================
// DASHBOARD API
// ============================================================================

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await adminApi.get('/dashboard');
  return data.data;
};

// ============================================================================
// USER API
// ============================================================================

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  isRestricted?: boolean;
  isEmailVerified?: boolean;
  search?: string;
}

export const getUsers = async (filters: UserFilters = {}): Promise<{
  users: AdminUser[];
} & PaginatedResponse<AdminUser>> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.role) params.append('role', filters.role);
  if (filters.isRestricted !== undefined) params.append('isRestricted', String(filters.isRestricted));
  if (filters.isEmailVerified !== undefined) params.append('isEmailVerified', String(filters.isEmailVerified));
  if (filters.search) params.append('search', filters.search);
  
  const { data } = await adminApi.get(`/users?${params.toString()}`);
  return data.data;
};

export const getUserById = async (id: string): Promise<AdminUser> => {
  const { data } = await adminApi.get(`/users/${id}`);
  return data.data;
};

export const updateUser = async (id: string, updates: {
  name?: string;
  role?: string;
  isEmailVerified?: boolean;
}): Promise<AdminUser> => {
  const { data } = await adminApi.patch(`/users/${id}`, updates);
  return data.data;
};

export const restrictUser = async (id: string, reason: string): Promise<void> => {
  await adminApi.patch(`/users/${id}/restrict`, { reason });
};

export const unrestrictUser = async (id: string): Promise<void> => {
  await adminApi.patch(`/users/${id}/unrestrict`);
};

export const deleteUser = async (id: string): Promise<void> => {
  await adminApi.delete(`/users/${id}`);
};

// ============================================================================
// ORGANIZATION API
// ============================================================================

export interface OrgFilters {
  page?: number;
  limit?: number;
  type?: 'NGO' | 'SUPPLIER';
  isVerified?: boolean;
  isRestricted?: boolean;
  search?: string;
}

export const getOrganizations = async (filters: OrgFilters = {}): Promise<{
  organizations: AdminOrganization[];
} & PaginatedResponse<AdminOrganization>> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.type) params.append('type', filters.type);
  if (filters.isVerified !== undefined) params.append('isVerified', String(filters.isVerified));
  if (filters.isRestricted !== undefined) params.append('isRestricted', String(filters.isRestricted));
  if (filters.search) params.append('search', filters.search);
  
  const { data } = await adminApi.get(`/organizations?${params.toString()}`);
  return data.data;
};

export const getOrganizationById = async (id: string): Promise<AdminOrganization> => {
  const { data } = await adminApi.get(`/organizations/${id}`);
  return data.data;
};

export const restrictOrganization = async (id: string, reason: string): Promise<void> => {
  await adminApi.patch(`/organizations/${id}/restrict`, { reason });
};

export const unrestrictOrganization = async (id: string): Promise<void> => {
  await adminApi.patch(`/organizations/${id}/unrestrict`);
};

export const deleteOrganization = async (id: string): Promise<void> => {
  await adminApi.delete(`/organizations/${id}`);
};

// ============================================================================
// KYC API
// ============================================================================

export interface KycFilters {
  page?: number;
  limit?: number;
  status?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  orgType?: 'NGO' | 'SUPPLIER';
  search?: string;
}

export const getKycSubmissions = async (filters: KycFilters = {}): Promise<{
  submissions: KycSubmission[];
} & PaginatedResponse<KycSubmission>> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.status) params.append('status', filters.status);
  if (filters.orgType) params.append('orgType', filters.orgType);
  if (filters.search) params.append('search', filters.search);
  
  const { data } = await adminApi.get(`/kyc?${params.toString()}`);
  return data.data;
};

export const getKycById = async (id: string): Promise<KycSubmission> => {
  const { data } = await adminApi.get(`/kyc/${id}`);
  return data.data;
};

export const getKycDocumentUrl = async (id: string, docType: string): Promise<string> => {
  const { data } = await adminApi.get(`/kyc/${id}/document/${docType}`);
  return data.data.url;
};

export const approveKyc = async (id: string, notes?: string): Promise<void> => {
  await adminApi.patch(`/kyc/${id}/approve`, { reviewNotes: notes || '' });
};

export const rejectKyc = async (id: string, reason: string): Promise<void> => {
  await adminApi.patch(`/kyc/${id}/reject`, { rejectionReason: reason });
};
