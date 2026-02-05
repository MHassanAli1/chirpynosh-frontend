'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/gsap';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Feature highlight configuration
 */
interface Feature {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
}

/**
 * Features data
 */
const FEATURES: Feature[] = [
    {
        id: 'pickup',
        title: 'Daytime pickup windows',
        description: 'Flexible scheduling that fits partners\' operations. Set convenient time slots that work for your team, ensuring fresh food reaches those who need it without disrupting your workflow.',
        icon: (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        gradient: 'from-amber-400 to-orange-500',
    },
    {
        id: 'trust',
        title: 'Structure & trust',
        description: 'Verified partners, transparent tracking, and accountable distribution. Every donation is logged, every recipient is validated, building a network you can trust completely.',
        icon: (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        gradient: 'from-emerald-400 to-teal-500',
    },
    {
        id: 'smart',
        title: 'Smart prioritization',
        description: 'AI-powered matching ensures food goes where it\'s needed most. Our system considers expiry dates, nutritional needs, and proximity to minimize waste and maximize impact.',
        icon: (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        gradient: 'from-violet-400 to-purple-500',
    },
];

/**
 * FeaturesSection Component
 * 
 * Pinned scroll-through feature highlights.
 * Features:
 * - Pinned section during scroll
 * - One feature visible at a time with crossfade
 * - Progress indicator dots
 * - Smooth transitions with opacity/translateY/scale
 * - prefers-reduced-motion support
 */
export default function FeaturesSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
    const progressRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const reducedMotion = prefersReducedMotion();
        const section = sectionRef.current;
        const container = containerRef.current;
        const features = featuresRef.current.filter(Boolean);

        if (!section || !container || features.length === 0) return;

        if (reducedMotion) {
            // Show all features stacked for reduced motion
            features.forEach((feature) => {
                if (feature) gsap.set(feature, { opacity: 1, y: 0, scale: 1 });
            });
            return;
        }

        const ctx = gsap.context(() => {
            // Set initial states - first visible, others hidden below
            features.forEach((feature, index) => {
                if (feature) {
                    gsap.set(feature, {
                        opacity: index === 0 ? 1 : 0,
                        y: index === 0 ? 0 : 60,
                        scale: index === 0 ? 1 : 0.95,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                    });
                }
            });

            // Create main timeline with pin
            const mainTl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: `+=${100 * FEATURES.length}%`,
                    pin: true,
                    scrub: 0.5,
                    onUpdate: (self) => {
                        const newIndex = Math.min(
                            Math.floor(self.progress * FEATURES.length),
                            FEATURES.length - 1
                        );
                        setActiveIndex(newIndex);
                    },
                },
            });

            // Animate through each feature
            features.forEach((feature, index) => {
                if (!feature || index === features.length - 1) return;

                const nextFeature = features[index + 1];
                if (!nextFeature) return;

                // Fade out current
                mainTl.to(feature, {
                    opacity: 0,
                    y: -40,
                    scale: 0.95,
                    duration: 0.5,
                    ease: 'power2.inOut',
                });

                // Fade in next
                mainTl.to(nextFeature, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: 'power2.inOut',
                }, '<');
            });

        }, section);

        return () => ctx.revert();
    }, []);

    const setFeatureRef = (el: HTMLDivElement | null, index: number) => {
        featuresRef.current[index] = el;
    };

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen w-full bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden"
        >
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -translate-x-1/2" />
                <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl translate-x-1/2" />
            </div>

            {/* Content container */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 lg:px-12 py-20 gap-12">
                
                {/* Left side - Section header */}
                <div className="w-full lg:w-2/5 flex flex-col items-start">
                    <span className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium uppercase tracking-wider mb-4">
                        <span className="w-8 h-px bg-emerald-500" />
                        Why ChirpyNosh
                    </span>
                    <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                        Built for{' '}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            impact
                        </span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-md leading-relaxed">
                        Every feature is designed to make food rescue effortless, reliable, and meaningful.
                    </p>

                    {/* Progress dots */}
                    <div 
                        ref={progressRef}
                        className="flex items-center gap-3 mt-12"
                    >
                        {FEATURES.map((feature, index) => (
                            <div
                                key={feature.id}
                                className={`relative transition-all duration-500 ${
                                    index === activeIndex 
                                        ? 'w-8 h-3 rounded-full' 
                                        : 'w-3 h-3 rounded-full'
                                }`}
                            >
                                <div 
                                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                                        index === activeIndex
                                            ? `bg-gradient-to-r ${feature.gradient}`
                                            : index < activeIndex
                                                ? 'bg-emerald-400'
                                                : 'bg-gray-200'
                                    }`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Feature counter */}
                    <div className="mt-6 text-sm text-gray-400">
                        <span className="text-emerald-600 font-semibold">{String(activeIndex + 1).padStart(2, '0')}</span>
                        <span className="mx-2">/</span>
                        <span>{String(FEATURES.length).padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Right side - Feature cards container */}
                <div
                    ref={containerRef}
                    className="relative w-full lg:w-3/5 h-[400px] lg:h-[500px]"
                >
                    {FEATURES.map((feature, index) => (
                        <div
                            key={feature.id}
                            ref={(el) => setFeatureRef(el, index)}
                            className="w-full"
                        >
                            <div className="relative p-8 lg:p-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                                {/* Gradient accent */}
                                <div className={`absolute top-0 left-8 right-8 h-1 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                                
                                {/* Icon */}
                                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6`}>
                                    {feature.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg">
                                    {feature.description}
                                </p>

                                {/* Decorative element */}
                                <div className="absolute bottom-8 right-8 opacity-10">
                                    <svg className="w-32 h-32 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    See our food listings
                </span>
                <svg className="w-4 h-4 text-emerald-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
}
