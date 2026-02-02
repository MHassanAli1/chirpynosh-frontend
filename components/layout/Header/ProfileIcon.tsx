'use client';

import Link from 'next/link';

/**
 * ProfileIcon - Apple-style frosted glass profile button
 * Features glassmorphism with light green accent
 */
export default function ProfileIcon() {
    return (
        <Link
            href="/signup"
            className="group relative flex items-center justify-center w-10 h-10 rounded-full
                       bg-[#ecfdf5]/80 backdrop-blur-xl
                       border border-white/40
                       shadow-lg shadow-emerald-500/10
                       hover:shadow-xl hover:shadow-emerald-500/20
                       hover:bg-[#ecfdf5] hover:scale-105
                       active:scale-95
                       transition-all duration-300"
            aria-label="Sign up or Log in"
        >
            {/* Frosted glass inner glow */}
            <div className="absolute inset-[2px] rounded-full 
                            bg-gradient-to-br from-white/60 via-transparent to-transparent
                            pointer-events-none" />

            {/* Subtle ring on hover */}
            <div className="absolute inset-0 rounded-full 
                            ring-2 ring-emerald-400/0 group-hover:ring-emerald-400/30
                            transition-all duration-300" />

            {/* Profile Icon SVG */}
            <svg
                className="w-5 h-5 text-emerald-600 transition-all duration-300 
                           group-hover:text-emerald-700 group-hover:scale-110"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                {/* Head */}
                <circle cx="12" cy="8" r="4" />
                {/* Body */}
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.5 21a8.38 8.38 0 0 1 2-5.5A6.5 6.5 0 0 1 12 13a6.5 6.5 0 0 1 4.5 2.5 8.38 8.38 0 0 1 2 5.5"
                />
            </svg>

            {/* Sparkle accent on hover */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 
                             bg-gradient-to-br from-emerald-400 to-green-500 
                             rounded-full border-2 border-white
                             scale-0 group-hover:scale-100 
                             transition-transform duration-300 delay-75" />
        </Link>
    );
}
