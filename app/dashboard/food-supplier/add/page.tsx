'use client';

import { ListingForm } from '@/components/supplier/ListingForm';
import Link from 'next/link';

export default function AddListingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard/food-supplier" className="hover:text-orange-600">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/dashboard/food-supplier/listings" className="hover:text-orange-600">
          Listings
        </Link>
        <span>/</span>
        <span className="text-gray-900">New Listing</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
        <p className="text-gray-500 mt-1">
          Share your surplus food with those who need it. Add photos, video, and set your pickup window.
        </p>
      </div>

      {/* Form */}
      <ListingForm />
    </div>
  );
}
