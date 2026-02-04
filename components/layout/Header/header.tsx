'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileIcon from './ProfileIcon';

/**
 * Navigation link item type
 */
interface NavLink {
    label: string;
    href: string;
}

/**
 * User type for auth state
 */
interface User {
    id: string;
    name: string | null;
    avatar: string | null;
    role: 'simple_recipient' | 'ngo_recipient' | 'food_supplier' | 'admin';
}

/**
 * Header component props
 */
interface HeaderProps {
    user?: User | null;
    onLogout?: () => void;
}

/**
 * Navigation links configuration
 */
const NAV_LINKS: NavLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Donation Hub', href: '/hub' },
    { label: 'Partners', href: '/partners' },
    { label: 'Near to Expiry', href: '/near-expiry' },
    { label: 'Recipes', href: '/recipes' },
];

/**
 * ChirpyNosh Modern Header Component
 * Features:
 * - Glassmorphism design
 * - Gradient brand text
 * - Sticky with smooth animations
 * - Auth-aware profile/buttons
 * - Mobile responsive
 */
export default function Header({ user, onLogout }: HeaderProps) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check if user can add listings
    const canAddListing = !user || user.role === 'food_supplier';

    // Check if active link
    const isActiveLink = (href: string) => pathname === href;

    // Get role-specific menu item based on user role
    const getRoleMenuItem = () => {
        if (!user) return null;
        switch (user.role) {
            case 'food_supplier':
                return { label: 'My Listings', href: '/dashboard/food-supplier/listings' };
            case 'ngo_recipient':
                return { label: 'My Claims', href: '/dashboard/ngo-recipient/claims' };
            case 'simple_recipient':
                return { label: 'My Claims', href: '/dashboard/recipient/claims' };
            default:
                return null;
        }
    };

    // Get profile link based on user role
    const getProfileLink = () => {
        if (!user) return '/profile';
        switch (user.role) {
            case 'food_supplier':
                return '/dashboard/food-supplier/profile';
            case 'ngo_recipient':
                return '/dashboard/ngo-recipient/profile';
            case 'simple_recipient':
                return '/dashboard/recipient/profile';
            default:
                return '/profile';
        }
    };

    const roleMenuItem = getRoleMenuItem();
    const profileLink = getProfileLink();

    return (
        <header
            className={`
        fixed top-0 left-0 right-0 z-30
        transition-all duration-500 ease-out
        ${isScrolled
                    ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/30'
                    : 'bg-white/70 backdrop-blur-lg border-b border-white/20'
                }
      `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-18">

                    {/* Brand Section */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                    >
                        {/* Logo with hover animation */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                            <Image
                                src="/logo.png"
                                alt="ChirpyNosh Logo"
                                width={44}
                                height={44}
                                className="rounded-full relative z-10 transition-transform duration-300 group-hover:scale-110"
                                priority
                            />
                        </div>

                        {/* Brand Name & Tagline */}
                        <div className="flex flex-col">
                            <span
                                className="text-xl font-bold bg-gradient-to-r from-[#ffde59] via-[#ff914d] to-[#10b981] bg-clip-text text-transparent
                           animate-gradient-x bg-[length:200%_auto]"
                                style={{
                                    animation: 'gradient-shift 3s ease infinite',
                                }}
                            >
                                ChirpyNosh
                            </span>
                            <span className="text-xs text-[#48392e] font-medium -mt-0.5 tracking-wide">
                                Food rescue network
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`
                  relative px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-300 ease-out
                  ${isActiveLink(link.href)
                                        ? 'bg-[#ecfdf5] text-emerald-600'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                                    }
                `}
                            >
                                {/* Active indicator dot */}
                                {isActiveLink(link.href) && (
                                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                                )}
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-3">

                        {/* Notification Bell */}
                        <button
                            className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100/60
                         transition-all duration-200 group"
                            aria-label="Notifications"
                        >
                            <svg
                                className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                            {/* Notification badge */}
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                        </button>

                        {/* Add Listing Button - Show if logged out OR food_supplier */}
                        {canAddListing && (
                            <Link
                                href="/add-listing"
                                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full
                           bg-white border border-gray-200 text-gray-700 text-sm font-medium
                           shadow-sm hover:shadow-md hover:border-gray-300
                           transition-all duration-300 hover:-translate-y-0.5
                           group"
                            >
                                <svg
                                    className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Listing</span>
                            </Link>
                        )}

                        {/* Auth Section */}
                        {user ? (
                            /* Logged In - Profile Avatar with Dropdown */
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`
                    relative flex items-center gap-2 p-1 pr-3 rounded-full
                    border transition-all duration-300
                    ${isProfileOpen
                                            ? 'bg-emerald-50 border-emerald-200 shadow-md'
                                            : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                                        }
                  `}
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden ring-2 ring-white">
                                            {user.avatar ? (
                                                <Image
                                                    src={user.avatar}
                                                    alt={user.name || 'User'}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white text-sm font-semibold">
                                                    {(user.name || 'U').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {/* Online indicator */}
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                                    </div>

                                    {/* Chevron */}
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                <div
                                    className={`
                    absolute right-0 top-full mt-2 w-56 py-2
                    bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10
                    border border-gray-100
                    transition-all duration-300 origin-top-right
                    ${isProfileOpen
                                            ? 'opacity-100 scale-100 translate-y-0'
                                            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                                        }
                  `}
                                >
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <Link
                                            href={profileLink}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profile
                                        </Link>

                                        {roleMenuItem && (
                                            <Link
                                                href={roleMenuItem.href}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                {roleMenuItem.label}
                                            </Link>
                                        )}
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-100 pt-1">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                onLogout?.();
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Logged Out - Profile Icon Button */
                            <ProfileIcon />
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100
                         transition-colors duration-200"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div
                    className={`
            lg:hidden overflow-hidden transition-all duration-300 ease-out
            ${isMobileMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}
          `}
                >
                    <nav className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                  px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActiveLink(link.href)
                                        ? 'bg-[#ecfdf5] text-emerald-600'
                                        : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                                    }
                `}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Mobile Add Listing */}
                        {canAddListing && (
                            <Link
                                href="/add-listing"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 mt-2
                           bg-gray-100 rounded-xl text-sm font-medium text-gray-700
                           hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Listing
                            </Link>
                        )}

                        {/* Mobile Sign Up Button */}
                        {!user && (
                            <Link
                                href="/signup"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 mt-2
                           bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl
                           text-white text-sm font-semibold
                           shadow-lg shadow-emerald-500/20"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="8" r="4" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 21a8.38 8.38 0 0 1 2-5.5A6.5 6.5 0 0 1 12 13a6.5 6.5 0 0 1 4.5 2.5 8.38 8.38 0 0 1 2 5.5" />
                                </svg>
                                Sign Up
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
