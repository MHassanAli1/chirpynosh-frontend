'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { browseListings, getListingImageUrl, type FoodListing } from '@/services/listings.api';
import { prefersReducedMotion } from '@/lib/gsap';

/**
 * Category colors for visual variety
 */
const CATEGORY_COLORS: Record<string, string> = {
    'Fruits': 'bg-orange-100 text-orange-700',
    'Vegetables': 'bg-green-100 text-green-700',
    'Dairy': 'bg-blue-100 text-blue-700',
    'Bakery': 'bg-amber-100 text-amber-700',
    'Meat': 'bg-red-100 text-red-700',
    'Seafood': 'bg-cyan-100 text-cyan-700',
    'Prepared Foods': 'bg-purple-100 text-purple-700',
    'Beverages': 'bg-pink-100 text-pink-700',
    'Snacks': 'bg-yellow-100 text-yellow-700',
    'default': 'bg-gray-100 text-gray-700',
};

/**
 * Skeleton card for loading state
 */
function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-gray-200" />
            
            {/* Content placeholder */}
            <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-10 bg-gray-200 rounded-full w-24" />
                </div>
            </div>
        </div>
    );
}

/**
 * Listing card component
 */
interface ListingCardProps {
    listing: FoodListing;
    index: number;
}

function ListingCard({ listing, index }: ListingCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (prefersReducedMotion()) return;
        
        const card = cardRef.current;
        if (!card) return;

        // Entrance animation with stagger based on index
        gsap.fromTo(card,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: (index % 6) * 0.1,
                ease: 'power2.out',
            }
        );
    }, [index]);

    // Format date helper
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Get category color
    const categoryColor = CATEGORY_COLORS[listing.category] || CATEGORY_COLORS.default;

    // Get image URL or fallback
    const imageUrl = listing.imageKeys?.[0] 
        ? getListingImageUrl(listing.imageKeys[0], { width: 400, height: 300 })
        : null;

    // Calculate urgency (expires within 24 hours) using a stable reference time
    const expiresAt = new Date(listing.expiresAt);
    const [now] = useState(() => Date.now());
    const hoursUntilExpiry = (expiresAt.getTime() - now) / (1000 * 60 * 60);
    const isUrgent = hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;

    return (
        <div
            ref={cardRef}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-500 hover:-translate-y-1"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
                {imageUrl && !imageError ? (
                    <Image
                        src={imageUrl}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={() => setImageError(true)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.704 2.704 0 003 15.546V12a9 9 0 0118 0v3.546z" />
                        </svg>
                    </div>
                )}

                {/* Urgency badge */}
                {isUrgent && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        Expires soon
                    </div>
                )}

                {/* Stock indicator */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full text-gray-700 shadow-sm">
                    {listing.remainingStock} {listing.unit} left
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Category */}
                <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
                    {listing.category}
                </span>

                {/* Title */}
                <h3 className="mt-3 text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {listing.title}
                </h3>

                {/* Organization */}
                <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                    {listing.organization?.name || 'Partner'}
                </p>

                {/* Pickup window */}
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        {formatDate(listing.pickupStartAt)} • {formatTime(listing.pickupStartAt)} - {formatTime(listing.pickupEndAt)}
                    </span>
                </div>

                {/* Price and CTA */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-emerald-600">
                            ${parseFloat(listing.subsidizedPrice).toFixed(2)}
                        </span>
                        {parseFloat(listing.originalPrice) > parseFloat(listing.subsidizedPrice) && (
                            <span className="text-sm text-gray-400 line-through">
                                ${parseFloat(listing.originalPrice).toFixed(2)}
                            </span>
                        )}
                    </div>
                    
                    <Link
                        href={`/hub/${listing.id}`}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full hover:bg-emerald-100 transition-colors"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * ListingsSection Component
 * 
 * Infinite scroll food listings with real API integration.
 * Features:
 * - IntersectionObserver for infinite loading
 * - Skeleton loaders during fetch
 * - Smooth fade-in animations
 * - Virtualized-ready structure
 * - Filter bar (optional)
 * - prefers-reduced-motion support
 */
export default function ListingsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    
    const [listings, setListings] = useState<FoodListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Available categories
    const categories = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Prepared Foods', 'Beverages'];

    /**
     * Fetch listings from API
     */
    const fetchListings = useCallback(async (pageNum: number, category?: string) => {
        try {
            const response = await browseListings({
                page: pageNum,
                limit: 12,
                category: category || undefined,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });

            if (response.success && response.listings) {
                return {
                    listings: response.listings,
                    hasMore: pageNum < response.pagination.totalPages,
                };
            }
            return { listings: [], hasMore: false };
        } catch (err) {
            console.error('Failed to fetch listings:', err);
            throw err;
        }
    }, []);

    /**
     * Initial load
     */
    useEffect(() => {
        const loadInitial = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchListings(1, selectedCategory);
                setListings(result.listings);
                setHasMore(result.hasMore);
                setPage(1);
            } catch {
                setError('Failed to load listings. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadInitial();
    }, [selectedCategory, fetchListings]);

    /**
     * Heading entrance animation
     */
    useEffect(() => {
        if (prefersReducedMotion()) return;
        
        const heading = headingRef.current;
        if (!heading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        gsap.fromTo(heading,
                            { opacity: 0, y: 40 },
                            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
                        );
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(heading);
        return () => observer.disconnect();
    }, []);

    /**
     * Infinite scroll observer
     */
    useEffect(() => {
        const loadMoreEl = loadMoreRef.current;
        if (!loadMoreEl || !hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    setIsLoadingMore(true);
                    try {
                        const nextPage = page + 1;
                        const result = await fetchListings(nextPage, selectedCategory);
                        setListings(prev => [...prev, ...result.listings]);
                        setHasMore(result.hasMore);
                        setPage(nextPage);
                    } catch {
                        setError('Failed to load more listings.');
                    } finally {
                        setIsLoadingMore(false);
                    }
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(loadMoreEl);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, page, selectedCategory, fetchListings]);

    /**
     * Handle category filter change
     */
    const handleCategoryChange = (category: string) => {
        if (category === selectedCategory) {
            setSelectedCategory('');
        } else {
            setSelectedCategory(category);
        }
    };

    return (
        <section
            ref={sectionRef}
            className="relative z-30 w-full bg-gradient-to-b from-gray-50 via-white to-gray-50 py-24"
        >
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div
                    ref={headingRef}
                    className="text-center mb-12"
                >
                    <span className="inline-flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium uppercase tracking-wider mb-4">
                        <span className="w-8 h-px bg-emerald-500" />
                        Available Now
                        <span className="w-8 h-px bg-emerald-500" />
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Fresh food,{' '}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ready for pickup
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Browse available food from our verified partners. Reserve your items and pick them up fresh.
                    </p>
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedCategory === ''
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                        }`}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryChange(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedCategory === category
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Error state */}
                {error && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                {/* Listings grid */}
                {!isLoading && listings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing, index) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && listings.length === 0 && !error && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
                        <p className="text-gray-600">
                            {selectedCategory 
                                ? `No ${selectedCategory.toLowerCase()} items available right now.`
                                : 'Check back soon for new food listings!'
                            }
                        </p>
                    </div>
                )}

                {/* Load more trigger */}
                {hasMore && !isLoading && (
                    <div ref={loadMoreRef} className="mt-12">
                        {isLoadingMore && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* End of list indicator */}
                {!hasMore && listings.length > 0 && (
                    <div className="text-center mt-12 py-8">
                        <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                            <span className="w-8 h-px bg-gray-300" />
                            You&apos;ve seen all available listings
                            <span className="w-8 h-px bg-gray-300" />
                        </span>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-16 text-center">
                    <Link
                        href="/hub"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-full shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Browse All Listings
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
