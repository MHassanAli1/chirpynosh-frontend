'use client';

import { useState, useEffect, useRef } from 'react';

interface OtpVerificationProps {
    email: string;
    onVerify: (otp: string) => void;
    onResend: () => void;
    onBack: () => void;
    isLoading?: boolean;
    error?: string | null;
    successMessage?: string | null;
}

/**
 * OTP Verification Step
 * 6-digit OTP input with auto-focus and cool animations
 */
export default function OtpVerification({
    email,
    onVerify,
    onResend,
    onBack,
    isLoading = false,
    error,
    successMessage,
}: OtpVerificationProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        const fullOtp = newOtp.join('');
        if (fullOtp.length === 6 && !newOtp.includes('')) {
            onVerify(fullOtp);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled or first empty
        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();

        // Auto-submit if complete
        if (pastedData.length === 6) {
            onVerify(pastedData);
        }
    };

    const handleResend = () => {
        if (resendCooldown > 0) return;
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        onResend();
        inputRefs.current[0]?.focus();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full 
                               bg-gradient-to-br from-emerald-500 to-green-400
                               flex items-center justify-center
                               shadow-lg shadow-emerald-500/30
                               animate-in zoom-in duration-500">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Check your email
                </h2>
                <p className="mt-2 text-gray-500">
                    We sent a 6-digit code to
                </p>
                <p className="font-medium text-gray-900">{email}</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200
                               flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-emerald-700">{successMessage}</p>
                </div>
            )}

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={isLoading}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl
                                   bg-white/70 backdrop-blur-xl
                                   border-2 transition-all duration-200
                                   outline-none
                                   ${digit
                                ? 'border-emerald-400 text-gray-900 scale-105 shadow-lg shadow-emerald-500/20'
                                : 'border-gray-200 text-gray-400'
                            }
                                   focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20
                                   focus:scale-110 focus:shadow-xl focus:shadow-emerald-500/20
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   animate-in fade-in zoom-in`}
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                    />
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200
                               flex items-center gap-2 animate-in fade-in shake duration-300">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Resend */}
            <div className="text-center">
                <p className="text-gray-500 text-sm">
                    Didn&apos;t receive the code?{' '}
                    <button
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isLoading}
                        className={`font-medium transition-colors ${resendCooldown > 0 || isLoading
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-emerald-600 hover:text-emerald-700 hover:underline'
                            }`}
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                </p>
            </div>

            {/* Verify Button */}
            <button
                onClick={() => onVerify(otp.join(''))}
                disabled={isLoading || otp.includes('')}
                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2
                           bg-gradient-to-r from-emerald-600 to-green-600
                           hover:from-emerald-500 hover:to-green-500
                           text-white font-semibold
                           shadow-lg shadow-emerald-500/30
                           hover:shadow-xl hover:shadow-emerald-500/40
                           hover:scale-[1.02] active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                           transition-all duration-200"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                    </>
                ) : (
                    'Verify & Continue'
                )}
            </button>

            {/* Back */}
            <button
                onClick={onBack}
                disabled={isLoading}
                className="w-full py-3 text-center text-gray-500 hover:text-gray-700 
                           font-medium transition-colors duration-200
                           disabled:opacity-50"
            >
                ← Back
            </button>
        </div>
    );
}
