/**
 * GSAP Registration & Configuration
 * Centralized setup for GSAP plugins
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins (only runs once)
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Default animation settings for consistent feel
export const defaultEase = 'power3.out';
export const defaultDuration = 0.8;

// Stagger timing for grouped elements
export const staggerTiming = {
    fast: 0.08,
    normal: 0.12,
    slow: 0.2,
};

// Animation presets for reuse
export const animationPresets = {
    fadeUp: {
        from: { opacity: 0, y: 60 },
        to: { opacity: 1, y: 0, duration: defaultDuration, ease: defaultEase },
    },
    fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1, duration: defaultDuration, ease: defaultEase },
    },
    slideUp: {
        from: { y: 100, opacity: 0 },
        to: { y: 0, opacity: 1, duration: 1, ease: 'power4.out' },
    },
    scaleIn: {
        from: { scale: 0.9, opacity: 0 },
        to: { scale: 1, opacity: 1, duration: defaultDuration, ease: defaultEase },
    },
};

// Check for reduced motion preference
export const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Export GSAP and ScrollTrigger for use in components
export { gsap, ScrollTrigger };
