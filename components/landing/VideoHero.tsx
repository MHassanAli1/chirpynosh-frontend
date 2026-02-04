'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import AnimatedButton from './AnimatedButton';

/**
 * VideoHero Component
 * 
 * Full-screen cinematic hero with:
 * - Looping background video (muted, optimized)
 * - Dark gradient overlay for readability
 * - GSAP-powered staggered entrance animations
 * - Respects prefers-reduced-motion
 * 
 * Animation Timeline:
 * 0.0s → Overlay fades in
 * 0.3s → Title slides up
 * 0.5s → Subtitle slides up
 * 0.7s → Buttons slide up (staggered)
 */

interface VideoHeroProps {
    /** Video source URL */
    videoSrc?: string;
    /** Poster image for video loading state */
    posterSrc?: string;
    /** Main headline */
    title?: string;
    /** Supporting text */
    subtitle?: string;
    /** Primary CTA button text */
    primaryCta?: string;
    /** Primary CTA link */
    primaryHref?: string;
    /** Secondary CTA button text */
    secondaryCta?: string;
    /** Secondary CTA link */
    secondaryHref?: string;
}

export default function VideoHero({
    videoSrc = '/videos/hero-bg.mp4',
    posterSrc = '/images/hero-poster.jpg',
    title = 'Rescue Food. Feed Communities.',
    subtitle = 'Connect surplus food with those who need it most. Together, we can eliminate food waste and end hunger.',
    primaryCta = 'Start Donating',
    primaryHref = '/signup',
    secondaryCta = 'Explore Food Hub',
    secondaryHref = '/hub',
}: VideoHeroProps) {
    const containerRef = useRef<HTMLElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        // Skip animations if user prefers reduced motion
        if (prefersReducedMotion()) {
            // Just show everything immediately
            if (overlayRef.current) overlayRef.current.style.opacity = '1';
            if (titleRef.current) titleRef.current.style.opacity = '1';
            if (subtitleRef.current) subtitleRef.current.style.opacity = '1';
            if (buttonsRef.current) buttonsRef.current.style.opacity = '1';
            return;
        }

        // Set initial states (hidden)
        gsap.set([overlayRef.current, titleRef.current, subtitleRef.current, buttonsRef.current], {
            opacity: 0,
        });
        gsap.set(titleRef.current, { y: 60 });
        gsap.set(subtitleRef.current, { y: 40 });
        gsap.set(buttonsRef.current?.children || [], { y: 30 });

        // Create animation timeline
        const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            delay: 0.2, // Small delay for page load
        });

        tl
            // Overlay fade in
            .to(overlayRef.current, {
                opacity: 1,
                duration: 0.6,
            })
            // Title entrance
            .to(titleRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.8,
            }, '-=0.3')
            // Subtitle entrance
            .to(subtitleRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.7,
            }, '-=0.5')
            // Buttons entrance (staggered)
            .to(buttonsRef.current?.children || [], {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
            }, '-=0.4');

        // Cleanup
        return () => {
            tl.kill();
        };
    }, []);

    // Handle video load
    const handleVideoLoad = () => {
        setVideoLoaded(true);
    };

    // Handle video error - fallback to poster
    const handleVideoError = () => {
        setVideoError(true);
    };

    return (
        <section
            ref={containerRef}
            className="relative w-full h-screen min-h-[600px] overflow-hidden"
        >
            {/* Background Video */}
            {!videoError && (
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={posterSrc}
                    onLoadedData={handleVideoLoad}
                    onError={handleVideoError}
                    className={`
                        absolute inset-0 w-full h-full object-cover
                        transition-opacity duration-1000
                        ${videoLoaded ? 'opacity-100' : 'opacity-0'}
                    `}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            )}

            {/* Fallback background (poster or gradient) */}
            <div
                className={`
                    absolute inset-0
                    bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900
                    ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'}
                    transition-opacity duration-1000
                `}
                style={{
                    backgroundImage: posterSrc && !videoError ? `url(${posterSrc})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Gradient Overlay for text readability */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
                style={{ opacity: 0 }}
            />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 sm:px-8 lg:px-12">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Main Title */}
                    <h1
                        ref={titleRef}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
                        style={{ opacity: 0 }}
                    >
                        {title.split('. ').map((part, index, arr) => (
                            <span key={index}>
                                {part}
                                {index < arr.length - 1 && (
                                    <>
                                        .
                                        <br className="hidden sm:block" />
                                        <span className="sm:hidden"> </span>
                                    </>
                                )}
                            </span>
                        ))}
                    </h1>

                    {/* Subtitle */}
                    <p
                        ref={subtitleRef}
                        className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed"
                        style={{ opacity: 0 }}
                    >
                        {subtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div
                        ref={buttonsRef}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
                        style={{ opacity: 0 }}
                    >
                        <AnimatedButton
                            href={primaryHref}
                            variant="primary"
                            size="lg"
                        >
                            <span>{primaryCta}</span>
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </AnimatedButton>

                        <AnimatedButton
                            href={secondaryHref}
                            variant="secondary"
                            size="lg"
                        >
                            <span>{secondaryCta}</span>
                        </AnimatedButton>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="flex flex-col items-center gap-2 text-white/60">
                        <span className="text-sm font-medium tracking-wider uppercase">Scroll</span>
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Bottom gradient fade (for smooth transition to next section) */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </section>
    );
}
