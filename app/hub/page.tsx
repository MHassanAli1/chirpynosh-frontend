'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  browseListings,
  getCategories,
  getVerifiedSuppliers,
  type FoodListing,
  type BrowseListingsParams,
} from '@/services/listings.api';

export default function DonationHubPage() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string; listingCount: number }[]>([]);
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
      const [catResponse, suppResponse] = await Promise.all([
        getCategories(),
        getVerifiedSuppliers(),
      ]);
      setCategories(catResponse.categories || []);
      setSuppliers(suppResponse.suppliers || []);
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

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num === 0 ? 'FREE' : `€${num.toFixed(0)}`;
  };

  const formatPickupWindow = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTime = new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${startTime}–${endTime}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Donation Hub</h1>
              <p className="text-gray-600 mt-1">
                FREE surplus for verified recipients + discounted near-expiry items for the public.
              </p>
            </div>
            <Link
              href="/dashboard/food-supplier/add"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Add Listing
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listing / partner / notes..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
              >
                <option value="">All</option>
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
              >
                <option value="">All</option>
                <option value="NGO">NGOs Only</option>
                <option value="INDIVIDUAL">Individuals Only</option>
              </select>
            </div>
          </form>

          {/* Sort Row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as ['price' | 'createdAt' | 'expiresAt', 'asc' | 'desc'];
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white min-w-[160px]"
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="expiresAt-asc">Expiring Soon</option>
              </select>
            </div>

            {/* Supplier Filter */}
            {suppliers.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Supplier</label>
                <select
                  value={filters.supplierId || ''}
                  onChange={(e) => handleFilterChange('supplierId', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white min-w-[180px]"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters */}
            <button
              type="button"
              onClick={() => {
                setFilters({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' });
                setSearchQuery('');
              }}
              className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm text-red-600 mt-1">
                Run <code className="bg-red-100 px-1.5 py-0.5 rounded">npm run dev</code> in the backend folder.
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-6" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20" />
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </div>
                <div className="h-10 bg-gray-200 rounded-lg w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && listings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              There are no food listings available at the moment. Check back later or try different filters.
            </p>
            <button
              onClick={() => {
                setFilters({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' });
                setSearchQuery('');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !error && listings.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} formatPrice={formatPrice} formatPickupWindow={formatPickupWindow} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {filters.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  disabled={filters.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ListingCardProps {
  listing: FoodListing;
  formatPrice: (price: string) => string;
  formatPickupWindow: (start: string, end: string) => string;
}

function ListingCard({ listing, formatPrice, formatPickupWindow }: ListingCardProps) {
  const price = formatPrice(listing.subsidizedPrice);
  const isFree = parseFloat(listing.subsidizedPrice) === 0;
  const pickupTime = formatPickupWindow(listing.pickupStartAt, listing.pickupEndAt);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-bold text-gray-900 text-lg leading-tight">
          {listing.title}
        </h3>
        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-semibold ${
          isFree 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {price}
        </span>
      </div>

      {/* Supplier */}
      <p className="text-gray-500 text-sm mb-3">{listing.organization?.name}</p>

      {/* Description */}
      {listing.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          {listing.category}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          {listing.remainingStock} {listing.unit}
        </span>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
          Pred: {pickupTime}
        </span>
      </div>

      {/* Pickup Windows */}
      <p className="text-xs text-gray-500 mb-4">
        Pickup windows: {pickupTime}
      </p>

      {/* Action */}
      <Link
        href={`/hub/${listing.id}`}
        className="block w-full text-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}
