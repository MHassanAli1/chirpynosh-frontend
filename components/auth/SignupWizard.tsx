'use client';

import { useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSignupWizard } from '@/hooks/auth/useSignupWizard';
import RoleSelection from './RoleSelection';
import OrganizationDetails from './OrganizationDetails';
import AuthMethodSelection from './AuthMethodSelection';
import EmailSignupForm from './EmailSignupForm';
import OtpVerification from './OtpVerification';

/**
 * Signup Wizard Component
 * Multi-step registration with glassmorphism card design and Google OAuth
 */
export default function SignupWizard() {
    const {
        state,
        step,
        isLoading,
        error,
        successMessage,
        needsOrganization,
        selectRole,
        submitOrganization,
        selectAuthMethod,
        submitEmailSignup,
        handleGoogleSignup,
        verifyOtp,
        resendOtp,
        updateField,
        goBack,
    } = useSignupWizard();

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const popupRef = useRef<Window | null>(null);

    // Handle message from OAuth popup
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.credential) {
                handleGoogleSignup(event.data.credential);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleGoogleSignup]);

    /**
     * Open Google OAuth popup with full-screen experience
     */
    const triggerGoogleSignup = useCallback(() => {
        if (!googleClientId) {
            console.error('Google Client ID not configured');
            return;
        }

        // Close any existing popup
        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
        }

        // Calculate centered popup position
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        // Build Google OAuth URL for popup
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const scope = 'openid email profile';
        const responseType = 'id_token';
        const nonce = Math.random().toString(36).substring(2);

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', googleClientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', responseType);
        authUrl.searchParams.set('scope', scope);
        authUrl.searchParams.set('nonce', nonce);
        authUrl.searchParams.set('prompt', 'select_account');

        // Open popup
        popupRef.current = window.open(
            authUrl.toString(),
            'google-auth-popup',
            `width=${width},height=${height},left=${left},top=${top},popup=yes`
        );

        // Focus popup
        popupRef.current?.focus();
    }, [googleClientId]);

    // Calculate progress
    const getProgress = () => {
        const steps = needsOrganization
            ? ['role', 'organization', 'auth-method', 'email-form', 'otp-verification']
            : ['role', 'auth-method', 'email-form', 'otp-verification'];
        const currentIndex = steps.indexOf(step);
        return Math.max(0, currentIndex) / (steps.length - 1);
    };

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Glass Card Container */}
            <div className="relative overflow-hidden
                           bg-white/60 backdrop-blur-3xl rounded-3xl 
                           shadow-2xl shadow-emerald-500/10
                           border border-white/60
                           p-8 sm:p-10">

                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-emerald-50/30 pointer-events-none" />

                {/* Content Container */}
                <div className="relative z-10">
                    {/* Logo & Brand */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 
                                           rounded-full blur-lg opacity-40 group-hover:opacity-60 
                                           transition-opacity duration-500" />
                            <Image
                                src="/logo.png"
                                alt="ChirpyNosh"
                                width={48}
                                height={48}
                                className="rounded-full relative z-10 
                                          group-hover:scale-110 transition-transform duration-300"
                                priority
                            />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-[#ffde59] via-[#ff914d] to-[#10b981] 
                                        bg-clip-text text-transparent bg-[length:200%_auto]
                                        hover:bg-right transition-all duration-1000"
                            style={{ backgroundSize: '200% auto' }}>
                            ChirpyNosh
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 
                                       rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.max(10, getProgress() * 100)}%` }}
                        />
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[360px]">
                        {step === 'role' && (
                            <RoleSelection onSelect={selectRole} />
                        )}

                        {step === 'organization' && (
                            <OrganizationDetails
                                value={state.organizationName}
                                onChange={(value) => updateField('organizationName', value)}
                                onSubmit={submitOrganization}
                                onBack={goBack}
                                error={error}
                            />
                        )}

                        {step === 'auth-method' && (
                            <AuthMethodSelection
                                onSelect={selectAuthMethod}
                                onGoogleClick={triggerGoogleSignup}
                                onBack={goBack}
                                isLoading={isLoading}
                            />
                        )}

                        {step === 'email-form' && (
                            <EmailSignupForm
                                name={state.name}
                                email={state.email}
                                password={state.password}
                                onNameChange={(value) => updateField('name', value)}
                                onEmailChange={(value) => updateField('email', value)}
                                onPasswordChange={(value) => updateField('password', value)}
                                onSubmit={submitEmailSignup}
                                onBack={goBack}
                                isLoading={isLoading}
                                error={error}
                            />
                        )}

                        {step === 'otp-verification' && (
                            <OtpVerification
                                email={state.email}
                                onVerify={verifyOtp}
                                onResend={resendOtp}
                                onBack={goBack}
                                isLoading={isLoading}
                                error={error}
                                successMessage={successMessage}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-gray-600 animate-in fade-in"
                style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 
                               hover:underline underline-offset-4 transition-colors"
                >
                    Log in
                </Link>
            </p>
        </div>
    );
}
