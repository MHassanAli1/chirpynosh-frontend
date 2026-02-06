'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  browseListings,
  getCategories,
  type FoodListing,
  type BrowseListingsParams,
} from '@/services/listings.api';
import { ListingCard, ListingCardSkeleton } from '@/components/listings';

export default function DonationHubPage() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<BrowseListingsParams>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: BrowseListingsParams = { ...filters };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const response = await browseListings(params);
      setListings(response.listings || []);
      setPagination({
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Unable to connect to server. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  const fetchFiltersData = useCallback(async () => {
    try {
      const catResponse = await getCategories();
      setCategories(catResponse.categories || []);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  }, []);

  useEffect(() => {
    fetchFiltersData();
  }, [fetchFiltersData]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (key: keyof BrowseListingsParams, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div 
      className="min-h-screen pt-24 pb-16"
      style={{ background: 'linear-gradient(180deg, #F4FFF8 0%, #ECFDF3 50%, #ffffff 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Donation Hub</h1>
          <p className="text-gray-600">Browse and reserve surplus food from local partners</p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food, partner..."
                  className="w-full pl-12 pr-4 py-3 bg-[#F4FFF8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] focus:bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-[#F4FFF8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] focus:bg-white text-gray-900 transition-all duration-200 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select
                value={filters.claimerType || ''}
                onChange={(e) => handleFilterChange('claimerType', e.target.value as 'NGO' | 'INDIVIDUAL' | undefined)}
                className="w-full px-4 py-3 bg-[#F4FFF8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] focus:bg-white text-gray-900 transition-all duration-200 cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="NGO">NGOs Only</option>
                <option value="INDIVIDUAL">Individuals</option>
              </select>
            </div>
          </form>

          {/* Sort Row */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Sort:</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as ['price' | 'createdAt' | 'expiresAt', 'asc' | 'desc'];
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 text-gray-900 text-sm transition-all duration-200 cursor-pointer"
              >
                <option value="createdAt-desc">Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="expiresAt-asc">Expiring Soon</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setFilters({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' });
                setSearchQuery('');
              }}
              className="ml-auto text-sm text-gray-500 hover:text-[#16A34A] transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && listings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F4FFF8] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Check back soon for fresh surplus food from our partners.
            </p>
            <button
              onClick={() => {
                setFilters({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' });
                setSearchQuery('');
              }}
              className="text-[#16A34A] hover:underline font-medium"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !error && listings.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  disabled={filters.page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium transition-all"
                >
                  ←
                </button>
                <span className="px-4 py-2 text-gray-600 font-medium">
                  {filters.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  disabled={filters.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium transition-all"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
