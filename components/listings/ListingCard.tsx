'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { getListingImageUrl, type FoodListing } from '@/services/listings.api';

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
  'default': 'bg-amber-50 text-amber-600',
};

/**
 * Props for ListingCard component
 */
export interface ListingCardProps {
  listing: FoodListing;
  index?: number;
  variant?: 'default' | 'urgent';
  showAnimation?: boolean;
  ctaText?: string;
}

/**
 * Reusable Listing Card Component
 * 
 * Used across the platform for displaying food listings:
 * - Landing page listings section
 * - Donation Hub page
 * - Near Expiry page
 */
export default function ListingCard({ 
  listing, 
  index = 0, 
  variant = 'default',
  showAnimation = true,
  ctaText = 'View Details'
}: ListingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  // GSAP entrance animation
  useEffect(() => {
    if (!showAnimation) return;
    
    const card = cardRef.current;
    if (!card) return;

    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: (index % 8) * 0.08,
        ease: 'power2.out',
      }
    );
  }, [index, showAnimation]);

  // Calculate expiry urgency
  const expiresAt = new Date(listing.expiresAt);
  const now = new Date();
  const hoursUntilExpiry = Math.max(0, (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  const getExpiryBadge = () => {
    if (hoursUntilExpiry <= 2) return { text: 'URGENT!', color: 'bg-red-600 text-white animate-pulse' };
    if (hoursUntilExpiry <= 6) return { text: 'Expires soon', color: 'bg-red-500 text-white' };
    if (hoursUntilExpiry <= 12) return { text: `${Math.round(hoursUntilExpiry)}h left`, color: 'bg-orange-500 text-white' };
    if (hoursUntilExpiry <= 24) return { text: `${Math.round(hoursUntilExpiry)}h left`, color: 'bg-amber-500 text-white' };
    return { text: `${Math.ceil(hoursUntilExpiry / 24)}d left`, color: 'bg-green-100 text-green-700' };
  };
  
  const expiryBadge = getExpiryBadge();

  // Format pickup date and time
  const pickupStart = new Date(listing.pickupStartAt);
  const pickupEnd = new Date(listing.pickupEndAt);
  const pickupDate = pickupStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const startTime = pickupStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const endTime = pickupEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Price formatting
  const subsidizedPrice = parseFloat(listing.subsidizedPrice);
  const originalPrice = parseFloat(listing.originalPrice || '0');
  const isFree = subsidizedPrice === 0;
  const hasDiscount = originalPrice > subsidizedPrice;

  // Get category color
  const categoryColor = CATEGORY_COLORS[listing.category] || CATEGORY_COLORS.default;

  // Get image URL from imageKeys
  const imageUrl = listing.imageKeys?.[0] 
    ? getListingImageUrl(listing.imageKeys[0], { width: 400, height: 400 })
    : null;

  return (
    <Link href={`/hub/${listing.id}`} className="block">
      <div 
        ref={cardRef}
        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#86EFAC] hover:shadow-xl hover:shadow-[#16A34A]/10 hover:-translate-y-1 transition-all duration-300 h-full cursor-pointer"
        style={showAnimation ? { opacity: 0 } : undefined}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-[#F4FFF8] to-[#ECFDF3] overflow-hidden">
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
              <svg className="w-16 h-16 text-[#16A34A]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.704 2.704 0 003 15.546V12a9 9 0 0118 0v3.546z" />
              </svg>
            </div>
          )}
          
          {/* Expiry badge - top left */}
          <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${expiryBadge.color}`}>
            {expiryBadge.text}
          </div>
          
          {/* Stock badge - top right */}
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm">
            {listing.remainingStock} {listing.unit} left
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          {/* Category tag */}
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${categoryColor}`}>
            {listing.category}
          </span>
          
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1 line-clamp-1 group-hover:text-[#16A34A] transition-colors">
            {listing.title}
          </h3>
          
          {/* Description */}
          {listing.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}
          
          {/* Partner Organization */}
          <p className="text-gray-500 text-sm mb-2 line-clamp-1">
            {listing.organization?.name || 'Partner'}
          </p>
          
          {/* Pickup time */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            <svg className="w-4 h-4 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{pickupDate} • {startTime} - {endTime}</span>
          </div>
          
          {/* Price and CTA row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#16A34A]">
                {isFree ? 'FREE' : `$${subsidizedPrice.toFixed(2)}`}
              </span>
              {hasDiscount && !isFree && (
                <span className="text-sm text-gray-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <span className="px-4 py-2 border-2 border-[#16A34A] text-[#16A34A] rounded-full text-sm font-semibold group-hover:bg-[#16A34A] group-hover:text-white transition-all duration-300">
              {variant === 'urgent' ? 'Reserve Now' : ctaText}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Skeleton card for loading state
 */
export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50" />
      
      {/* Content placeholder */}
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="h-10 bg-gray-100 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}
