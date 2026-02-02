'use client';

import { AuthMethod } from '@/hooks/auth/useSignupWizard';

interface AuthMethodSelectionProps {
    onSelect: (method: AuthMethod) => void;
    onGoogleClick: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

/**
 * Step 3: Auth Method Selection
 * Premium Google and Email buttons with glassmorphism
 */
export default function AuthMethodSelection({
    onSelect,
    onGoogleClick,
    onBack,
    isLoading = false,
}: AuthMethodSelectionProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Create Account
                </h2>
                <p className="mt-2 text-gray-500">Choose how you want to sign up</p>
            </div>

            <div className="space-y-3">
                {/* Google Button - Premium Glass */}
                <button
                    onClick={onGoogleClick}
                    disabled={isLoading}
                    className="group w-full p-4 rounded-xl flex items-center justify-center gap-3
                               bg-white/70 backdrop-blur-2xl
                               border border-white/60 hover:border-white/80
                               shadow-lg shadow-black/5
                               hover:shadow-2xl hover:shadow-black/10
                               hover:bg-white/90
                               hover:scale-[1.02] active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-300
                               animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}
                >
                    {/* Google Icon with subtle hover animation */}
                    <div className="relative">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        Continue with Google
                    </span>
                </button>

                {/* Divider with animated line */}
                <div className="relative py-5">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200/60" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 bg-[#ecfdf5] text-sm text-gray-400 font-medium">
                            or
                        </span>
                    </div>
                </div>

                {/* Email Button - Gradient */}
                <button
                    onClick={() => onSelect('email')}
                    disabled={isLoading}
                    className="group w-full p-4 rounded-xl flex items-center justify-center gap-3
                               bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600
                               bg-[length:200%_auto]
                               hover:bg-right
                               text-white font-semibold
                               shadow-lg shadow-emerald-500/30
                               hover:shadow-2xl hover:shadow-emerald-500/40
                               hover:scale-[1.02] active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-500
                               animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Continue with Email</span>
                </button>
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="w-full py-3 text-center text-gray-500 hover:text-gray-700 
                           font-medium transition-colors duration-200
                           hover:underline underline-offset-4"
            >
                ← Back
            </button>
        </div>
    );
}
