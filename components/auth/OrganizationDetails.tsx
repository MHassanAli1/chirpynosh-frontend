'use client';

import { useState, useEffect } from 'react';

interface OrganizationDetailsProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
    error?: string | null;
}

/**
 * Step 2: Organization Details (conditional)
 * Premium glassmorphism input with floating label animation
 */
export default function OrganizationDetails({
    value,
    onChange,
    onSubmit,
    onBack,
    error,
}: OrganizationDetailsProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (value) {
            const timer = setTimeout(() => setIsTyping(false), 500);
            return () => clearTimeout(timer);
        }
    }, [value]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) {
            setLocalError('Organization name is required');
            return;
        }
        if (value.trim().length < 2) {
            setLocalError('Organization name must be at least 2 characters');
            return;
        }
        setLocalError(null);
        onSubmit();
    };

    const hasValue = value.length > 0;
    const showLabel = isFocused || hasValue;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Organization Details
                </h2>
                <p className="mt-2 text-gray-500">Tell us about your organization</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Floating Label Input */}
                <div className="relative">
                    {/* Input Container with glassmorphism */}
                    <div className={`relative overflow-hidden rounded-2xl
                                   bg-white/60 backdrop-blur-2xl
                                   border-2 transition-all duration-300
                                   ${isFocused
                            ? 'border-emerald-400 shadow-lg shadow-emerald-500/20'
                            : localError || error
                                ? 'border-red-300 shadow-lg shadow-red-500/10'
                                : 'border-white/50 shadow-lg shadow-black/5'
                        }`}>
                        <input
                            type="text"
                            id="organizationName"
                            value={value}
                            onChange={(e) => {
                                onChange(e.target.value);
                                setLocalError(null);
                                setIsTyping(true);
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder=" "
                            className="w-full px-4 pt-6 pb-3 bg-transparent
                                       text-gray-900 text-lg
                                       outline-none peer"
                        />

                        {/* Floating Label */}
                        <label
                            htmlFor="organizationName"
                            className={`absolute left-4 transition-all duration-200 pointer-events-none
                                       ${showLabel
                                    ? 'top-2 text-xs font-medium text-emerald-600'
                                    : 'top-1/2 -translate-y-1/2 text-gray-400'
                                }`}
                        >
                            Organization Name
                        </label>

                        {/* Bottom highlight bar */}
                        <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-400
                                        transition-all duration-300
                                        ${isFocused ? 'w-full' : 'w-0'}`} />
                    </div>

                    {/* Error message */}
                    {(localError || error) && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1
                                     animate-in fade-in slide-in-from-top-1 duration-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {localError || error}
                        </p>
                    )}

                    {/* Character count */}
                    {isTyping && value.length > 0 && (
                        <p className="absolute right-4 bottom-3 text-xs text-gray-400 animate-in fade-in duration-200">
                            {value.length}/200
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 px-4 py-3.5 rounded-xl
                                   bg-white/50 backdrop-blur-xl
                                   border border-gray-200 hover:border-gray-300
                                   text-gray-700 font-medium
                                   hover:bg-white/70 hover:scale-[1.02]
                                   active:scale-[0.98]
                                   transition-all duration-200"
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-3.5 rounded-xl
                                   bg-gradient-to-r from-emerald-600 to-green-600
                                   hover:from-emerald-500 hover:to-green-500
                                   text-white font-semibold
                                   shadow-lg shadow-emerald-500/30
                                   hover:shadow-xl hover:shadow-emerald-500/40
                                   hover:scale-[1.02] active:scale-[0.98]
                                   transition-all duration-200"
                    >
                        Continue →
                    </button>
                </div>
            </form>
        </div>
    );
}
