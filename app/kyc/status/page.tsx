'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { kycApi, KycStatusResponse } from '@/services/auth.api';

/**
 * KYC Status Page
 * Shows current KYC status (pending, approved, rejected)
 */
export default function KycStatusPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [kycStatus, setKycStatus] = useState<KycStatusResponse | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await kycApi.getStatus();
                if (status) {
                    setKycStatus(status);
                    // If not submitted or rejected, redirect to submit
                    if (status.status === 'NOT_SUBMITTED' || status.status === 'REJECTED') {
                        router.push('/kyc/submit');
                        return;
                    }
                    // If approved, redirect to dashboard
                    if (status.status === 'APPROVED') {
                        router.push('/dashboard');
                        return;
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatus();
    }, [router]);

    if (isLoading || !kycStatus) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Status Header */}
                <div className={`p-8 text-center ${kycStatus.status === 'PENDING' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                        kycStatus.status === 'APPROVED' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                            'bg-gradient-to-br from-red-400 to-rose-500'
                    } text-white`}>
                    <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl">
                            {kycStatus.status === 'PENDING' ? '⏳' :
                                kycStatus.status === 'APPROVED' ? '✓' : '✕'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold">
                        {kycStatus.status === 'PENDING' && 'Verification Pending'}
                        {kycStatus.status === 'APPROVED' && 'Verification Approved'}
                        {kycStatus.status === 'REJECTED' && 'Verification Rejected'}
                    </h1>
                    <p className="mt-2 text-white/80">
                        {kycStatus.status === 'PENDING' && 'Your documents are being reviewed by our team.'}
                        {kycStatus.status === 'APPROVED' && 'Your organization is verified!'}
                        {kycStatus.status === 'REJECTED' && 'Please review the issues and resubmit.'}
                    </p>
                </div>

                {/* Status Details */}
                <div className="p-6 space-y-4">
                    {kycStatus.status === 'PENDING' && (
                        <>
                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                                <span className="text-2xl">📋</span>
                                <div>
                                    <p className="font-medium text-amber-800">Under Review</p>
                                    <p className="text-sm text-amber-600">
                                        This usually takes 1-2 business days.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-900">What happens next?</h3>
                                <ul className="space-y-2 text-sm text-gray-800">
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">✓</span>
                                        Our team reviews your submitted documents
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">✓</span>
                                        We verify your business information
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">✓</span>
                                        You&apos;ll receive an email notification when complete
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">✓</span>
                                        Once approved, you can access your full dashboard
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Submission Details */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <h3 className="font-medium text-gray-900">Submission Details</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-800 font-medium">Business Name</span>
                                <p className="font-semibold text-gray-900">{kycStatus.businessRegisteredName || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-800 font-medium">Tax ID</span>
                                <p className="font-semibold text-gray-900">{kycStatus.taxId || '-'}</p>
                            </div>
                            <div>
                                <span className="text-gray-800 font-medium">Submitted</span>
                                <p className="font-semibold text-gray-900">
                                    {kycStatus.submittedAt
                                        ? new Date(kycStatus.submittedAt).toLocaleDateString()
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-800 font-medium">Status</span>
                                <p className={`font-medium ${kycStatus.status === 'PENDING' ? 'text-amber-600' :
                                        kycStatus.status === 'APPROVED' ? 'text-emerald-600' :
                                            'text-red-600'
                                    }`}>
                                    {kycStatus.status}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-800">
                    If you have questions about your verification status, please contact our support team at{' '}
                    <a href="mailto:support@chirpynosh.com" className="text-emerald-600 hover:underline">
                        support@chirpynosh.com
                    </a>
                </p>
            </div>
        </div>
    );
}
