'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';

// Colors for transition (defined outside component to avoid dependency issues)
const COLOR_START = new THREE.Color(0xf59e0b); // Amber/orange
const COLOR_END = new THREE.Color(0x22c55e);   // Fresh green

export interface Leaf3DHandle {
    getLeaf: () => THREE.Object3D | null;
    getScene: () => THREE.Scene | null;
    getCamera: () => THREE.PerspectiveCamera | null;
    getRenderer: () => THREE.WebGLRenderer | null;
    setScrollProgress: (progress: number) => void;
    triggerGlow: () => void;
}

interface Leaf3DProps {
    onLoad?: () => void;
    className?: string;
    reducedMotion?: boolean;
}

/**
 * Scroll-Driven 3D Leaf Animation
 * 
 * Apple/Stripe-quality scroll animation:
 * - Y-axis rotation only (2 full rotations = 720°)
 * - Lerp interpolation for buttery smooth motion
 * - Color transition: orange → green based on scroll
 * - Gentle floating sway (sine wave)
 * - Stops exactly where scroll stops
 * - Ultra-lightweight: 60fps on low-end devices
 */
const Leaf3D = forwardRef<Leaf3DHandle, Leaf3DProps>(({ onLoad, className = '', reducedMotion = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const leafGroupRef = useRef<THREE.Group | null>(null);
    const materialRef = useRef<THREE.MeshLambertMaterial | null>(null);
    const frameRef = useRef<number>(0);
    
    // Animation state
    const scrollProgressRef = useRef(0); // Target from scroll (0-1)
    const currentProgressRef = useRef(0); // Interpolated current value
    const currentXTiltRef = useRef(0); // Interpolated X-axis parallax tilt
    const timeRef = useRef(0);
    const glowRef = useRef(0);

    useImperativeHandle(ref, () => ({
        getLeaf: () => leafGroupRef.current,
        getScene: () => sceneRef.current,
        getCamera: () => cameraRef.current,
        getRenderer: () => rendererRef.current,
        setScrollProgress: (progress: number) => {
            scrollProgressRef.current = Math.max(0, Math.min(1, progress));
        },
        triggerGlow: () => {
            glowRef.current = 1;
        },
    }));

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (!container) return;

        const w = container.clientWidth || 400;
        const h = container.clientHeight || 400;

        // Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera (pulled back for breathing room — prevents clipping on float/glow)
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.z = 5;
        cameraRef.current = camera;

        // Renderer (ultra-optimized for low-end devices)
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false, // Disable for performance
            powerPreference: 'low-power',
        });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        rendererRef.current = renderer;

        // Simple lighting (no shadows, no post-processing)
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);

        const light = new THREE.DirectionalLight(0xffffff, 0.9);
        light.position.set(3, 4, 5);
        scene.add(light);

        // Create leaf shape (low-poly)
        const shape = new THREE.Shape();
        shape.moveTo(0, -1.5);
        shape.bezierCurveTo(0.4, -1.2, 1.0, -0.5, 1.1, 0.2);
        shape.bezierCurveTo(1.1, 0.9, 0.7, 1.5, 0, 1.8);
        shape.bezierCurveTo(-0.7, 1.5, -1.1, 0.9, -1.1, 0.2);
        shape.bezierCurveTo(-1.0, -0.5, -0.4, -1.2, 0, -1.5);

        // Ultra-low-poly geometry
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 0.08,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 1,
            curveSegments: 8, // Very low for performance
        });

        // Apply subtle curvature
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const curvatureWidth = x * x * 0.1;
            const curvatureLength = Math.sin((y + 1.5) / 3.3 * Math.PI) * 0.06;
            positions.setZ(i, z + curvatureWidth + curvatureLength);
        }
        geometry.computeVertexNormals();

        // Lightweight material (starts orange, transitions to green)
        const material = new THREE.MeshLambertMaterial({
            color: reducedMotion ? COLOR_END : COLOR_START,
            side: THREE.DoubleSide,
        });
        materialRef.current = material;

        const leafMesh = new THREE.Mesh(geometry, material);
        const group = new THREE.Group();
        group.add(leafMesh);
        group.scale.setScalar(0.7);
        scene.add(group);
        leafGroupRef.current = group;

        requestAnimationFrame(() => onLoad?.());

        // Resize handler
        const handleResize = () => {
            const nw = container.clientWidth || 400;
            const nh = container.clientHeight || 400;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        };
        window.addEventListener('resize', handleResize);

        // Animation constants
        const LERP_FACTOR = 0.1; // Smooth interpolation (0.08-0.12 range)
        const TWO_ROTATIONS = Math.PI * 4; // 720 degrees = 4π radians
        const FLOAT_AMPLITUDE = 0.03; // Subtle vertical float
        const FLOAT_SPEED = 0.8; // Gentle float speed
        const BASE_X_TILT = 0.2; // Base tilt for visibility (~11.5°)
        const PARALLAX_X_RANGE = 0.07; // ±4° parallax tilt range

        // Animation loop
        let isRunning = true;
        const animate = () => {
            if (!isRunning) return;
            
            const dt = 0.016;
            timeRef.current += dt;
            
            const group = leafGroupRef.current;
            const material = materialRef.current;
            
            if (group && material) {
                if (reducedMotion) {
                    // Static leaf for reduced motion
                    group.rotation.y = 0;
                    group.position.y = 0;
                } else {
                    // ═══════════════════════════════════════════════════
                    // LERP INTERPOLATION (buttery smooth, no jitter)
                    // Current eases toward target, stops exactly where scroll stops
                    // ═══════════════════════════════════════════════════
                    
                    const diff = scrollProgressRef.current - currentProgressRef.current;
                    currentProgressRef.current += diff * LERP_FACTOR;
                    
                    // Clamp tiny differences to prevent micro-jitter
                    if (Math.abs(diff) < 0.0001) {
                        currentProgressRef.current = scrollProgressRef.current;
                    }
                    
                    // ═══════════════════════════════════════════════════
                    // Y-AXIS ROTATION (2 full rotations = 720°)
                    // ═══════════════════════════════════════════════════
                    
                    group.rotation.y = currentProgressRef.current * TWO_ROTATIONS;
                    
                    // ═══════════════════════════════════════════════════
                    // PARALLAX X-AXIS TILT (scroll-linked, ±4°)
                    // Sine curve peaks at 50% scroll, returns at edges
                    // ═══════════════════════════════════════════════════
                    
                    const targetXTilt = Math.sin(currentProgressRef.current * Math.PI) * PARALLAX_X_RANGE;
                    const xDiff = targetXTilt - currentXTiltRef.current;
                    currentXTiltRef.current += xDiff * LERP_FACTOR;
                    if (Math.abs(xDiff) < 0.0001) currentXTiltRef.current = targetXTilt;
                    
                    group.rotation.x = BASE_X_TILT + currentXTiltRef.current;
                    
                    // ═══════════════════════════════════════════════════
                    // GENTLE FLOATING SWAY (sine wave, always active)
                    // ═══════════════════════════════════════════════════
                    
                    const floatY = Math.sin(timeRef.current * FLOAT_SPEED) * FLOAT_AMPLITUDE;
                    group.position.y = floatY;
                    
                    // ═══════════════════════════════════════════════════
                    // COLOR TRANSITION (orange → green based on scroll)
                    // ═══════════════════════════════════════════════════
                    
                    const colorProgress = currentProgressRef.current;
                    material.color.lerpColors(COLOR_START, COLOR_END, colorProgress);
                    
                    // ═══════════════════════════════════════════════════
                    // GLOW EFFECT (subtle scale pulse on stat trigger)
                    // ═══════════════════════════════════════════════════
                    
                    if (glowRef.current > 0.01) {
                        const glowScale = 0.7 + glowRef.current * 0.06;
                        group.scale.setScalar(glowScale);
                        glowRef.current *= 0.9;
                    } else {
                        group.scale.setScalar(0.7);
                        glowRef.current = 0;
                    }
                }
            }
            
            renderer.render(scene, camera);
            frameRef.current = requestAnimationFrame(animate);
        };
        
        frameRef.current = requestAnimationFrame(animate);

        return () => {
            isRunning = false;
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameRef.current);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, [onLoad, reducedMotion]);

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full ${className}`}
            style={{ touchAction: 'none' }}
        />
    );
});

Leaf3D.displayName = 'Leaf3D';
export default Leaf3D;
