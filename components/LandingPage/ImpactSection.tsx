'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { prefersReducedMotion } from '@/lib/gsap';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Impact stat configuration
 */
interface ImpactStat {
    id: string;
    value: number;
    suffix: string;
    label: string;
    description: string;
    icon: React.ReactNode;
}

/**
 * Stats data
 */
const IMPACT_STATS: ImpactStat[] = [
    {
        id: 'co2',
        value: 12847,
        suffix: 'kg',
        label: 'CO₂ Emissions Avoided',
        description: 'Kilograms of carbon dioxide emissions prevented through food rescue',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        id: 'food',
        value: 54320,
        suffix: 'lbs',
        label: 'Food Rescued',
        description: 'Pounds of surplus food diverted from landfills to communities',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.704 2.704 0 003 15.546V12a9 9 0 0118 0v3.546z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v.01M8 4v.01M16 4v.01" />
            </svg>
        ),
    },
    {
        id: 'meals',
        value: 28750,
        suffix: '+',
        label: 'Meals Shared',
        description: 'Nutritious meals provided to families and individuals in need',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
    },
];

/**
 * ImpactSection Component
 * 
 * Main WOW section with 3D leaf model and animated stats.
 * Features:
 * - Scroll-scrubbed 3D leaf rotation
 * - Idle float animation when scroll stops
 * - Count-up stats animation
 * - Pinned for 200vh scroll storytelling
 * - GPU-accelerated transforms only
 * - prefers-reduced-motion support
 */
export default function ImpactSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const statsContainerRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const [statValues, setStatValues] = useState<{ [key: string]: number }>({
        co2: 0,
        food: 0,
        meals: 0,
    });
    const [suffixesVisible, setSuffixesVisible] = useState<{ [key: string]: boolean }>({
        co2: false,
        food: false,
        meals: false,
    });
    
    // Three.js refs
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const leafRef = useRef<THREE.Object3D | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const scrollProgressRef = useRef(0);
    const idleTimeRef = useRef(0);
    const [modelLoaded, setModelLoaded] = useState(false);

    /**
     * Create fallback leaf geometry if model fails to load
     */
    const createFallbackLeaf = useCallback((scene: THREE.Scene) => {
        // Create a stylized leaf shape using custom geometry
        const shape = new THREE.Shape();
        
        // Leaf outline
        shape.moveTo(0, -1.5);
        shape.quadraticCurveTo(1.2, -0.5, 1, 0.5);
        shape.quadraticCurveTo(0.8, 1.2, 0, 1.5);
        shape.quadraticCurveTo(-0.8, 1.2, -1, 0.5);
        shape.quadraticCurveTo(-1.2, -0.5, 0, -1.5);

        const extrudeSettings = {
            depth: 0.15,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 3,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4ade80,
            roughness: 0.4,
            metalness: 0.1,
            emissive: 0x166534,
            emissiveIntensity: 0.15,
            side: THREE.DoubleSide,
        });

        const leaf = new THREE.Mesh(geometry, material);
        leaf.rotation.x = -0.3;
        scene.add(leaf);
        leafRef.current = leaf;
        setModelLoaded(true);
    }, []);

    /**
     * Initialize Three.js scene with leaf model
     */
    const initThreeJS = useCallback(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (!container) return;

        // Get actual dimensions - use minimum fallback if container not sized yet
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 400;

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 5);
        cameraRef.current = camera;

        // Renderer setup - GPU optimized
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current = renderer;

        // Soft ambient lighting - no shadows
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // Directional light for depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Rim light for edge glow effect
        const rimLight = new THREE.DirectionalLight(0x84cc16, 0.5);
        rimLight.position.set(-5, 2, -3);
        scene.add(rimLight);

        // Back light for more visibility
        const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
        backLight.position.set(0, -5, -5);
        scene.add(backLight);

        // Load GLTF model with fallback
        const loader = new GLTFLoader();
        loader.load(
            '/leaf.glb',
            (gltf) => {
                const model = gltf.scene;
                
                // Center and scale the model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);
                
                // Scale to fit nicely
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2.5 / maxDim;
                model.scale.multiplyScalar(scale);

                // Apply green-tinted material to all meshes
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0x4ade80,
                            roughness: 0.4,
                            metalness: 0.1,
                            emissive: 0x166534,
                            emissiveIntensity: 0.15,
                        });
                    }
                });

                scene.add(model);
                leafRef.current = model;
                setModelLoaded(true);
            },
            undefined,
            (error) => {
                console.error('Error loading leaf model, using fallback:', error);
                // Use fallback geometry
                createFallbackLeaf(scene);
            }
        );

        // Handle resize with debounce-like behavior
        const handleResize = () => {
            if (!container || !camera || !renderer) return;
            const newWidth = container.clientWidth || 400;
            const newHeight = container.clientHeight || 400;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        // Also resize after a short delay to catch late layout
        setTimeout(handleResize, 100);
        setTimeout(handleResize, 500);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [createFallbackLeaf]);

    /**
     * Animation loop with idle float - always renders when refs are available
     */
    const animate = useCallback(() => {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;

        // Always render if we have the basics, even without leaf
        if (renderer && scene && camera) {
            const leaf = leafRef.current;
            
            if (leaf) {
                // Increment idle time
                idleTimeRef.current += 0.016;

                // Idle float animation - gentle bob
                const floatOffset = Math.sin(idleTimeRef.current * 1.5) * 0.08;
                leaf.position.y = floatOffset;

                // Subtle idle rotation when not scrolling
                const idleRotation = Math.sin(idleTimeRef.current * 0.8) * 0.03;
                leaf.rotation.z = idleRotation;
                
                // Continuous slow rotation for visual interest
                leaf.rotation.y += 0.003;
            }

            renderer.render(scene, camera);
        }

        animationFrameRef.current = requestAnimationFrame(animate);
    }, []);

    /**
     * Setup GSAP animations and ScrollTrigger
     */
    useEffect(() => {
        const reducedMotion = prefersReducedMotion();
        const section = sectionRef.current;
        const statsContainer = statsContainerRef.current;
        const heading = headingRef.current;

        if (!section || !statsContainer || !heading) return;

        // Initialize Three.js
        const cleanup = initThreeJS();
        
        // Start render loop immediately
        animationFrameRef.current = requestAnimationFrame(animate);

        if (reducedMotion) {
            // Show everything immediately for reduced motion
            gsap.set([heading, statsContainer], { opacity: 1, y: 0 });
            setStatValues({ co2: 12847, food: 54320, meals: 28750 });
            setSuffixesVisible({ co2: true, food: true, meals: true });
            return () => {
                cleanup?.();
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }

        const ctx = gsap.context(() => {
            // Initial states
            gsap.set([heading, statsContainer], { opacity: 0, y: 60 });

            // Main pinned scroll animation
            const mainTl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: '+=200%',
                    pin: true,
                    scrub: 1,
                    onUpdate: (self) => {
                        scrollProgressRef.current = self.progress;
                        idleTimeRef.current = 0; // Reset idle on scroll
                        
                        // Rotate leaf based on scroll
                        if (leafRef.current) {
                            leafRef.current.rotation.y = self.progress * Math.PI * 2;
                            leafRef.current.rotation.x = Math.sin(self.progress * Math.PI) * 0.3;
                        }
                    },
                },
            });

            // Heading entrance
            mainTl.to(heading, {
                opacity: 1,
                y: 0,
                duration: 0.15,
                ease: 'power2.out',
            }, 0);

            // Stats container entrance
            mainTl.to(statsContainer, {
                opacity: 1,
                y: 0,
                duration: 0.15,
                ease: 'power2.out',
            }, 0.1);

            // Count-up animations for each stat
            IMPACT_STATS.forEach((stat, index) => {
                const startProgress = 0.2 + index * 0.15;
                const endProgress = startProgress + 0.2;

                mainTl.to({}, {
                    duration: endProgress - startProgress,
                    onUpdate: function() {
                        const progress = this.progress();
                        const currentValue = Math.floor(stat.value * progress);
                        setStatValues(prev => ({ ...prev, [stat.id]: currentValue }));
                        
                        if (progress >= 0.95) {
                            setSuffixesVisible(prev => ({ ...prev, [stat.id]: true }));
                        }
                    },
                }, startProgress);
            });

        }, section);

        return () => {
            ctx.revert();
            cleanup?.();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, [initThreeJS, animate]);

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen w-full bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 overflow-hidden"
        >
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-lime-200/20 rounded-full blur-3xl" />
            </div>

            {/* Content container */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 lg:px-12 py-20 gap-12 lg:gap-20">
                
                {/* 3D Leaf Canvas - Left side */}
                <div className="relative w-full lg:w-1/2 h-[400px] lg:h-[600px] flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full"
                        style={{ touchAction: 'none' }}
                    />
                    
                    {/* Loading indicator */}
                    {!modelLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                    )}
                    
                    {/* Glow effect behind canvas */}
                    <div className="absolute inset-0 -z-10 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 bg-gradient-radial from-emerald-400/20 via-emerald-300/10 to-transparent rounded-full blur-2xl" />
                    </div>
                </div>

                {/* Stats - Right side */}
                <div className="w-full lg:w-1/2 flex flex-col gap-8">
                    {/* Section heading */}
                    <div
                        ref={headingRef}
                        className="mb-4"
                    >
                        <span className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium uppercase tracking-wider mb-4">
                            <span className="w-8 h-px bg-emerald-500" />
                            Our Impact
                        </span>
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                            Making a{' '}
                            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                                real difference
                            </span>
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-xl leading-relaxed">
                            Every donation creates ripples of positive change. Watch the numbers grow as our community works together.
                        </p>
                    </div>

                    {/* Stats cards */}
                    <div
                        ref={statsContainerRef}
                        className="flex flex-col gap-6"
                    >
                        {IMPACT_STATS.map((stat) => (
                            <div
                                key={stat.id}
                                className="group relative p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-emerald-100/50 shadow-lg shadow-emerald-100/20 hover:shadow-xl hover:shadow-emerald-100/30 transition-all duration-500"
                            >
                                {/* Subtle gradient border on hover */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="relative flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                                        {stat.icon}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent tabular-nums">
                                                {statValues[stat.id].toLocaleString()}
                                            </span>
                                            <span
                                                className={`text-2xl font-semibold text-emerald-500 transition-all duration-300 ${
                                                    suffixesVisible[stat.id] 
                                                        ? 'opacity-100 translate-x-0' 
                                                        : 'opacity-0 -translate-x-2'
                                                }`}
                                            >
                                                {stat.suffix}
                                            </span>
                                        </div>
                                        <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                            {stat.label}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                                            {stat.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll progress indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Keep scrolling
                </span>
                <svg className="w-4 h-4 text-emerald-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
}
