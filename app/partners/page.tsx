'use client';

import { useEffect, useState, useCallback } from 'react';
import { getVerifiedSuppliers, getVerifiedNGOs } from '@/services/listings.api';

interface Partner {
  id: string;
  name: string;
  type: 'supplier' | 'ngo';
  listingCount?: number;
  description?: string;
  verified: boolean;
}

export default function PartnersPage() {
  const [suppliers, setSuppliers] = useState<Partner[]>([]);
  const [ngos, setNgos] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'suppliers' | 'ngos'>('all');

  const fetchPartners = useCallback(async () => {
    setIsLoading(true);
    try {
      const [suppResponse, ngoResponse] = await Promise.all([
        getVerifiedSuppliers(),
        getVerifiedNGOs(),
      ]);
      
      const supplierList: Partner[] = (suppResponse.suppliers || []).map((s: { id: string; name: string; listingCount?: number }) => ({
        id: s.id,
        name: s.name,
        type: 'supplier' as const,
        listingCount: s.listingCount,
        verified: true,
        description: `Active food supplier with ${s.listingCount || 0} listings`,
      }));
      
      const ngoList: Partner[] = (ngoResponse.ngos || []).map((n: { id: string; name: string; claimCount?: number }) => ({
        id: n.id,
        name: n.name,
        type: 'ngo' as const,
        verified: true,
        description: `Community partner with ${n.claimCount || 0} food claims`,
      }));
      
      setSuppliers(supplierList);
      setNgos(ngoList);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const allPartners = [...suppliers, ...ngos];
  const filteredPartners = activeTab === 'all' 
    ? allPartners 
    : activeTab === 'suppliers' 
      ? suppliers 
      : ngos;

  return (
    <div 
      className="min-h-screen pt-24 pb-16"
      style={{ background: 'linear-gradient(180deg, #F4FFF8 0%, #ECFDF3 50%, #ffffff 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#86EFAC]/50 shadow-sm mb-4">
            <svg className="w-5 h-5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-[#16A34A]">Our Network</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Our Partners</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet the food suppliers and organizations working together to reduce waste 
            and feed communities in need.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-[#16A34A]">{suppliers.length || '—'}</div>
            <div className="text-sm text-gray-500">Food Suppliers</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{ngos.length || '—'}</div>
            <div className="text-sm text-gray-500">NGO Partners</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-purple-600">1,200+</div>
            <div className="text-sm text-gray-500">Meals Shared</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Partners' },
            { id: 'suppliers', label: 'Food Suppliers' },
            { id: 'ngos', label: 'NGO Recipients' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'suppliers' | 'ngos')}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Partners Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner, index) => (
              <PartnerCard key={partner.id} partner={partner} index={index} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredPartners.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F4FFF8] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No partners found</h3>
            <p className="text-gray-500">Check back soon as we grow our network.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-[#16A34A] to-emerald-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Want to become a partner?</h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Join our network of food suppliers and NGOs making a difference in the community.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/signup"
              className="px-6 py-3 bg-white text-[#16A34A] rounded-full font-semibold hover:bg-gray-100 transition-all"
            >
              Become a Supplier
            </a>
            <a
              href="/signup"
              className="px-6 py-3 bg-white/20 text-white border border-white/40 rounded-full font-semibold hover:bg-white/30 transition-all"
            >
              Register as NGO
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Partner Card Component
function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  const isSupplier = partner.type === 'supplier';
  
  return (
    <div 
      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#86EFAC] hover:shadow-xl hover:shadow-[#16A34A]/10 hover:-translate-y-1 transition-all duration-300"
      style={{ 
        animationDelay: `${index * 50}ms`,
        opacity: 0,
        animation: `fadeUp 0.5s ease-out ${index * 50}ms forwards`
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
          isSupplier 
            ? 'bg-gradient-to-br from-[#16A34A] to-emerald-600' 
            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}>
          {isSupplier ? (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 group-hover:text-[#16A34A] transition-colors">
              {partner.name}
            </h3>
            {partner.verified && (
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
            isSupplier 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'bg-blue-50 text-blue-600'
          }`}>
            {isSupplier ? 'Food Supplier' : 'NGO Recipient'}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        {partner.description || 'Partner in our food rescue network.'}
      </p>
      
      {isSupplier && partner.listingCount !== undefined && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>{partner.listingCount} active listings</span>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
