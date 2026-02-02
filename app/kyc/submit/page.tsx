'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { kycApi, KycStatusResponse } from '@/services/auth.api';

/**
 * KYC Submission Page
 * Multi-step form for document upload and business info
 */
export default function KycSubmitPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [kycStatus, setKycStatus] = useState<KycStatusResponse | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        businessRegisteredName: '',
        taxId: '',
        phoneNumber: '',
        businessAddress: '',
    });

    // Document uploads
    const [documents, setDocuments] = useState({
        taxDocument: null as File | null,
        registrationDoc: null as File | null,
        businessLicense: null as File | null,
        idProof: null as File | null,
    });

    const [uploadStatus, setUploadStatus] = useState({
        taxDocument: false,
        registrationDoc: false,
        businessLicense: false,
        idProof: false,
    });

    // Fetch current KYC status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await kycApi.getStatus();
                if (status) {
                    setKycStatus(status);
                    // If pending, redirect to status page
                    if (status.status === 'PENDING') {
                        router.push('/kyc/status');
                        return;
                    }
                    // If approved, redirect to dashboard
                    if (status.status === 'APPROVED') {
                        router.push('/dashboard');
                        return;
                    }
                    // Pre-fill form if data exists
                    if (status.businessRegisteredName) {
                        setFormData({
                            businessRegisteredName: status.businessRegisteredName,
                            taxId: status.taxId || '',
                            phoneNumber: status.phoneNumber || '',
                            businessAddress: status.businessAddress || '',
                        });
                    }
                    // Update upload status
                    setUploadStatus(status.hasDocuments);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatus();
    }, [router]);

    // Handle file upload
    const handleFileUpload = async (docType: keyof typeof documents, file: File) => {
        setDocuments(prev => ({ ...prev, [docType]: file }));
        setError('');

        try {
            await kycApi.uploadDocument(docType, file);
            setUploadStatus(prev => ({ ...prev, [docType]: true }));
        } catch (err) {
            setError(`Failed to upload ${docType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setDocuments(prev => ({ ...prev, [docType]: null }));
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Validate all documents uploaded
        // const allUploaded = Object.values(uploadStatus).every(Boolean);
        // if (!allUploaded) {
        //     setError('Please upload all required documents');
        //     return;
        // }

        // Validate form data
        if (!formData.businessRegisteredName || !formData.taxId ||
            !formData.phoneNumber || !formData.businessAddress) {
            setError('Please fill in all business information');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await kycApi.submit(formData);
            router.push('/kyc/status');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Rejection Notice */}
            {kycStatus?.status === 'REJECTED' && kycStatus.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <h3 className="font-medium text-red-800">
                                Your previous submission was rejected
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                                {kycStatus.rejectionReason}
                            </p>
                            <p className="mt-2 text-sm text-red-600">
                                Please correct the issues and resubmit.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Steps */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    {['Documents', 'Business Info', 'Review'].map((label, idx) => (
                        <div key={label} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > idx + 1 ? 'bg-emerald-500 text-white' :
                                step === idx + 1 ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' :
                                    'bg-gray-100 text-gray-400'
                                }`}>
                                {step > idx + 1 ? '✓' : idx + 1}
                            </div>
                            <span className={`ml-2 text-sm ${step === idx + 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                {label}
                            </span>
                            {idx < 2 && <div className="w-12 h-0.5 bg-gray-200 mx-4" />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Documents */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Upload Required Documents</h2>
                        <p className="text-sm text-gray-500">
                            Please upload clear images or PDFs of the following documents (Optional).
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <DocumentUpload
                                label="Tax Document / Certificate"
                                docType="taxDocument"
                                file={documents.taxDocument}
                                isUploaded={uploadStatus.taxDocument}
                                onUpload={(f) => handleFileUpload('taxDocument', f)}
                            />
                            <DocumentUpload
                                label="Registration Document"
                                docType="registrationDoc"
                                file={documents.registrationDoc}
                                isUploaded={uploadStatus.registrationDoc}
                                onUpload={(f) => handleFileUpload('registrationDoc', f)}
                            />
                            <DocumentUpload
                                label="Business License"
                                docType="businessLicense"
                                file={documents.businessLicense}
                                isUploaded={uploadStatus.businessLicense}
                                onUpload={(f) => handleFileUpload('businessLicense', f)}
                            />
                            <DocumentUpload
                                label="ID Proof (Owner)"
                                docType="idProof"
                                file={documents.idProof}
                                isUploaded={uploadStatus.idProof}
                                onUpload={(f) => handleFileUpload('idProof', f)}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Business Info */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                        <p className="text-sm text-gray-500">
                            Provide your official business details.
                        </p>

                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Registered Business Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.businessRegisteredName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, businessRegisteredName: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-500"
                                    placeholder="Your registered business name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tax ID / Registration Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.taxId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-500"
                                    placeholder="Tax ID or registration number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-500"
                                    placeholder="+1 (234) 567-8900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Address
                                </label>
                                <textarea
                                    value={formData.businessAddress}
                                    onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-500"
                                    placeholder="Full business address"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!formData.businessRegisteredName || !formData.taxId || !formData.phoneNumber || !formData.businessAddress}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Review & Submit
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
                        <p className="text-sm text-gray-500">
                            Please review your information before submitting.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Business Name</span>
                                <span className="font-medium">{formData.businessRegisteredName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tax ID</span>
                                <span className="font-medium">{formData.taxId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium">{formData.phoneNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Address</span>
                                <span className="font-medium text-right max-w-[60%]">{formData.businessAddress}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between">
                                <span className="text-gray-500">Documents</span>
                                <span className="text-emerald-600 font-medium">4/4 Uploaded ✓</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit for Review'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Document upload component
 */
function DocumentUpload({
    label,
    docType,
    file,
    isUploaded,
    onUpload,
}: {
    label: string;
    docType: string;
    file: File | null;
    isUploaded: boolean;
    onUpload: (file: File) => void;
}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onUpload(selectedFile);
        }
    };

    return (
        <label className={`relative block p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isUploaded ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'
            }`}>
            <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                    {isUploaded ? '✓' : '📄'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                    <p className="text-xs text-gray-500 truncate">
                        {file?.name || (isUploaded ? 'Uploaded' : 'Click to upload')}
                    </p>
                </div>
            </div>
        </label>
    );
}
