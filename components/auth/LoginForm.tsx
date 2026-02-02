'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/auth.api';
import { useAuthStore } from '@/stores/authStore';

/**
 * Login Form Component
 * Email/password login with Google OAuth popup
 */
export default function LoginForm() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const popupRef = useRef<Window | null>(null);

    // Handle message from OAuth popup
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.credential) {
                await handleGoogleLogin(event.data.credential);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleGoogleLogin = useCallback(async (googleToken: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // For login, role doesn't matter - backend will use existing user's role
            const { user } = await authApi.googleAuth({
                googleToken,
                role: 'SIMPLE_RECIPIENT', // Default role, ignored for existing users
            });
            setUser(user);
            router.push('/');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Google login failed';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [setUser, router]);

    /**
     * Open Google OAuth popup with full-screen experience
     */
    const triggerGoogleLogin = useCallback(() => {
        if (!googleClientId) {
            setError('Google login not configured');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password) {
            setError('Please enter your email and password');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { user } = await authApi.login({
                email: email.trim().toLowerCase(),
                password,
            });
            setUser(user);
            router.push('/');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
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

                <div className="relative z-10">
                    {/* Logo & Brand */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="relative group">
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
                                        bg-clip-text text-transparent bg-[length:200%_auto]"
                            style={{ backgroundSize: '200% auto' }}>
                            ChirpyNosh
                        </span>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-gray-500">Sign in to your account</p>
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={triggerGoogleLogin}
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
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            Continue with Google
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="relative py-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200/60" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-white/60 backdrop-blur text-sm text-gray-400">or</span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="animate-in fade-in slide-in-from-bottom-2"
                            style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}>
                            <div className={`relative overflow-hidden rounded-xl
                                           bg-white/60 backdrop-blur-2xl
                                           border-2 transition-all duration-300
                                           ${focusedField === 'email'
                                    ? 'border-emerald-400 shadow-lg shadow-emerald-500/20'
                                    : 'border-white/50 shadow-md shadow-black/5'
                                }`}>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder=" "
                                    disabled={isLoading}
                                    autoComplete="email"
                                    className="w-full px-4 pt-5 pb-2 bg-transparent
                                               text-gray-900 outline-none
                                               disabled:opacity-50"
                                />
                                <label htmlFor="email"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                                                  ${focusedField === 'email' || email
                                            ? 'top-1.5 text-xs font-medium text-emerald-600'
                                            : 'top-1/2 -translate-y-1/2 text-gray-400'}`}>
                                    Email Address
                                </label>
                                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-400
                                                transition-all duration-300 ${focusedField === 'email' ? 'w-full' : 'w-0'}`} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="animate-in fade-in slide-in-from-bottom-2"
                            style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
                            <div className={`relative overflow-hidden rounded-xl
                                           bg-white/60 backdrop-blur-2xl
                                           border-2 transition-all duration-300
                                           ${focusedField === 'password'
                                    ? 'border-emerald-400 shadow-lg shadow-emerald-500/20'
                                    : 'border-white/50 shadow-md shadow-black/5'
                                }`}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder=" "
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    className="w-full px-4 pt-5 pb-2 pr-12 bg-transparent
                                               text-gray-900 outline-none
                                               disabled:opacity-50"
                                />
                                <label htmlFor="password"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                                                  ${focusedField === 'password' || password
                                            ? 'top-1.5 text-xs font-medium text-emerald-600'
                                            : 'top-1/2 -translate-y-1/2 text-gray-400'}`}>
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5
                                               text-gray-400 hover:text-gray-600 
                                               rounded-lg hover:bg-gray-100
                                               transition-all duration-200"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-400
                                                transition-all duration-300 ${focusedField === 'password' ? 'w-full' : 'w-0'}`} />
                            </div>
                            <div className="flex justify-end mt-1.5">
                                <Link href="/forgot-password"
                                    className="text-sm text-emerald-600 hover:text-emerald-700 
                                                hover:underline underline-offset-4 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200
                                           flex items-center gap-2 animate-in fade-in shake duration-200">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2
                                       bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600
                                       bg-[length:200%_auto] hover:bg-right
                                       text-white font-semibold
                                       shadow-lg shadow-emerald-500/30
                                       hover:shadow-2xl hover:shadow-emerald-500/40
                                       hover:scale-[1.02] active:scale-[0.98]
                                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                       transition-all duration-500
                                       animate-in fade-in slide-in-from-bottom-2"
                            style={{ animationDelay: '250ms', animationFillMode: 'backwards' }}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Signup Link */}
            <p className="mt-6 text-center text-gray-600 animate-in fade-in"
                style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
                Don&apos;t have an account?{' '}
                <Link href="/signup"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 
                                hover:underline underline-offset-4 transition-colors">
                    Sign up
                </Link>
            </p>
        </div>
    );
}
