'use client';

import { useState, useEffect } from 'react';

interface EmailSignupFormProps {
    name: string;
    email: string;
    password: string;
    onNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
    isLoading?: boolean;
    error?: string | null;
}

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    bgColor: string;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'text-red-500', bgColor: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'text-emerald-500', bgColor: 'bg-emerald-500' };
    return { score, label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-600' };
};

/**
 * Email Signup Form
 * Premium inputs with password strength meter
 */
export default function EmailSignupForm({
    name,
    email,
    password,
    onNameChange,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    onBack,
    isLoading = false,
    error,
}: EmailSignupFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

    useEffect(() => {
        if (password) {
            setPasswordStrength(checkPasswordStrength(password));
        } else {
            setPasswordStrength(null);
        }
    }, [password]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    const InputField = ({
        id,
        label,
        type,
        value,
        onChange,
        placeholder,
        showToggle = false,
        autoComplete,
    }: {
        id: string;
        label: string;
        type: string;
        value: string;
        onChange: (value: string) => void;
        placeholder: string;
        showToggle?: boolean;
        autoComplete?: string;
    }) => {
        const isFocused = focusedField === id;
        const hasValue = value.length > 0;

        return (
            <div className="relative">
                <div className={`relative overflow-hidden rounded-xl
                               bg-white/60 backdrop-blur-2xl
                               border-2 transition-all duration-300
                               ${isFocused
                        ? 'border-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'border-white/50 shadow-md shadow-black/5'
                    }`}>
                    <input
                        type={type}
                        id={id}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setFocusedField(id)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={isFocused || hasValue ? placeholder : ' '}
                        disabled={isLoading}
                        autoComplete={autoComplete}
                        className="w-full px-4 pt-5 pb-2 bg-transparent
                                   text-gray-900 
                                   outline-none peer
                                   disabled:opacity-50"
                    />

                    {/* Floating Label */}
                    <label
                        htmlFor={id}
                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                                   ${isFocused || hasValue
                                ? 'top-1.5 text-xs font-medium text-emerald-600'
                                : 'top-1/2 -translate-y-1/2 text-gray-400'
                            }`}
                    >
                        {label}
                    </label>

                    {/* Password Toggle */}
                    {showToggle && (
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
                    )}

                    {/* Focus line */}
                    <div className={`absolute bottom-0 left-0 h-0.5 
                                    bg-gradient-to-r from-emerald-500 to-green-400
                                    transition-all duration-300
                                    ${isFocused ? 'w-full' : 'w-0'}`} />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Create Account
                </h2>
                <p className="mt-1 text-gray-500">Enter your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
                    <InputField
                        id="name"
                        label="Full Name"
                        type="text"
                        value={name}
                        onChange={onNameChange}
                        placeholder="John Doe"
                        autoComplete="name"
                    />
                </div>

                {/* Email Field */}
                <div className="animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}>
                    <InputField
                        id="email"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={onEmailChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                </div>

                {/* Password Field */}
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
                    <InputField
                        id="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={onPasswordChange}
                        placeholder="At least 8 characters"
                        showToggle={true}
                        autoComplete="new-password"
                    />

                    {/* Password Strength Meter */}
                    {password && passwordStrength && (
                        <div className="space-y-1.5 animate-in fade-in duration-200">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.score
                                                ? passwordStrength.bgColor
                                                : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className={passwordStrength.color}>{passwordStrength.label}</span>
                                <span className="text-gray-400">
                                    {password.length >= 8 ? '✓' : '○'} 8+ chars,
                                    {/[A-Z]/.test(password) ? ' ✓' : ' ○'} uppercase,
                                    {/[0-9]/.test(password) ? ' ✓' : ' ○'} number
                                </span>
                            </div>
                        </div>
                    )}
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

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3.5 rounded-xl
                                   bg-white/50 backdrop-blur-xl
                                   border border-gray-200 hover:border-gray-300
                                   text-gray-700 font-medium
                                   hover:bg-white/70 hover:scale-[1.02]
                                   active:scale-[0.98]
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   transition-all duration-200"
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-3.5 rounded-xl flex items-center justify-center gap-2
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
                                Creating...
                            </>
                        ) : (
                            'Continue →'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
