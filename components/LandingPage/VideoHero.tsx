'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/gsap';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * VideoHero Component
 * Full-screen cinematic hero with video background, scroll-locked effect,
 * and staggered GSAP animations matching ChirpyNosh branding
 */
export default function VideoHero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollIndicatorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const reducedMotion = prefersReducedMotion();
        
        // Show everything immediately if reduced motion is preferred
        if (reducedMotion) {
            gsap.set([badgeRef.current, titleRef.current, descriptionRef.current, buttonsRef.current], {
                opacity: 1,
                y: 0,
            });
            return;
        }

        const ctx = gsap.context(() => {
            // Set initial states (hidden)
            gsap.set([badgeRef.current, titleRef.current, descriptionRef.current, buttonsRef.current], {
                opacity: 0,
                y: 80,
            });
            gsap.set(scrollIndicatorRef.current, { opacity: 0, y: 20 });

            // Create entrance timeline
            const entranceTl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                delay: 0.3,
            });

            entranceTl
                // Badge floats up first
                .to(badgeRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                })
                // Title slides up with slight overlap
                .to(titleRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                }, '-=0.5')
                // Description fades up
                .to(descriptionRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                }, '-=0.6')
                // Buttons appear with stagger
                .to(buttonsRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                }, '-=0.5')
                // Scroll indicator fades in last
                .to(scrollIndicatorRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                }, '-=0.3');

            // Parallax effect on scroll - video zooms slightly
            gsap.to(videoRef.current, {
                scale: 1.1,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            // Content fades out on scroll
            gsap.to(contentRef.current, {
                opacity: 0,
                y: -100,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'center center',
                    end: 'bottom top',
                    scrub: true,
                },
            });

        }, heroRef);

        return () => ctx.revert();
    }, []);

    // Ensure video plays
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.play().catch(() => {
                // Autoplay blocked - that's fine
            });
        }
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative h-screen w-full overflow-hidden"
        >
            {/* Video Container with scale transform origin */}
            <div
                ref={videoContainerRef}
                className="absolute inset-0 overflow-hidden"
            >
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute inset-0 h-full w-full object-cover scale-100 origin-center"
                >
                    <source src="/Hero.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Gradient Overlay - softer for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-emerald-950/20 to-emerald-950/60" />
            
            {/* Extra vignette for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

            {/* Content Layer */}
            <div
                ref={contentRef}
                className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
            >
                <div className="max-w-4xl text-center">
                    {/* Badge */}
                    <div
                        ref={badgeRef}
                        className="mb-6 inline-block"
                    >
                        <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30 backdrop-blur-sm">
                            🌱 Food rescue & redistribution
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1
                        ref={titleRef}
                        className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                    >
                        Predictable pickups.
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
                            Real impact.
                        </span>
                    </h1>

                    {/* Description */}
                    <p
                        ref={descriptionRef}
                        className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl"
                    >
                        ChirpyNosh tackles food waste and hunger by redistributing surplus food 
                        from verified partners to communities who need it most—at little to no cost—
                        while offering affordable access to near-expiry food. Together, we advance{' '}
                        <span className="font-semibold text-emerald-300">SDG 2 (Zero Hunger)</span> and{' '}
                        <span className="font-semibold text-emerald-300">SDG 12 (Responsible Consumption)</span>.
                    </p>

                    {/* CTA Buttons */}
                    <div
                        ref={buttonsRef}
                        className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
                    >
                        {/* Primary CTA */}
                        <Link
                            href="/hub"
                            className="group relative overflow-hidden rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 sm:text-lg"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Go to Donation Hub
                                <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                            {/* Shine effect */}
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        </Link>

                        {/* Secondary CTA */}
                        <Link
                            href="/signup?role=recipient"
                            className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20 hover:-translate-y-0.5 sm:text-lg"
                        >
                            Register as Recipient
                        </Link>

                        {/* Tertiary CTA */}
                        <Link
                            href="/signup?role=supplier"
                            className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20 hover:-translate-y-0.5 sm:text-lg"
                        >
                            Become a Partner
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div
                ref={scrollIndicatorRef}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-xs font-medium uppercase tracking-widest text-white/60">
                    Scroll to explore
                </span>
                <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1">
                    <div className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
                </div>
            </div>
        </section>
    );
}
