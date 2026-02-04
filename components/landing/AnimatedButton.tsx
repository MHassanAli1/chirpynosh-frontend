'use client';

import Link from 'next/link';
import { forwardRef } from 'react';

/**
 * Button variants for different visual styles
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AnimatedButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: ButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit';
    external?: boolean;
}

/**
 * AnimatedButton Component
 * 
 * A performant button with CSS-only hover animations.
 * No Framer Motion = no re-renders on hover.
 * 
 * Hover effects:
 * - Subtle scale (1.02)
 * - Shadow lift
 * - Background shift
 */
const AnimatedButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, AnimatedButtonProps>(
    (
        {
            children,
            href,
            onClick,
            variant = 'primary',
            size = 'md',
            className = '',
            disabled = false,
            type = 'button',
            external = false,
        },
        ref
    ) => {
        // Base styles for all buttons
        const baseStyles = `
            relative inline-flex items-center justify-center
            font-semibold tracking-wide
            rounded-full overflow-hidden
            transition-all duration-300 ease-out
            transform-gpu
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        `;

        // Size variants
        const sizeStyles = {
            sm: 'px-5 py-2.5 text-sm gap-2',
            md: 'px-7 py-3.5 text-base gap-2.5',
            lg: 'px-9 py-4 text-lg gap-3',
        };

        // Variant styles with hover states (CSS-only for performance)
        const variantStyles = {
            primary: `
                bg-gradient-to-r from-emerald-500 to-teal-500
                text-white shadow-lg shadow-emerald-500/25
                hover:shadow-xl hover:shadow-emerald-500/30
                hover:scale-[1.02] hover:-translate-y-0.5
                active:scale-[0.98]
                focus-visible:ring-emerald-500
            `,
            secondary: `
                bg-white/10 backdrop-blur-sm
                text-white border-2 border-white/30
                hover:bg-white/20 hover:border-white/50
                hover:scale-[1.02] hover:-translate-y-0.5
                active:scale-[0.98]
                focus-visible:ring-white
            `,
            ghost: `
                bg-transparent text-white
                hover:bg-white/10
                hover:scale-[1.02]
                active:scale-[0.98]
                focus-visible:ring-white
            `,
        };

        const combinedStyles = `
            ${baseStyles}
            ${sizeStyles[size]}
            ${variantStyles[variant]}
            ${className}
        `;

        // Render as Link for internal navigation
        if (href && !external) {
            return (
                <Link
                    href={href}
                    className={combinedStyles}
                    ref={ref as React.Ref<HTMLAnchorElement>}
                >
                    {children}
                </Link>
            );
        }

        // Render as anchor for external links
        if (href && external) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={combinedStyles}
                    ref={ref as React.Ref<HTMLAnchorElement>}
                >
                    {children}
                </a>
            );
        }

        // Render as button
        return (
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={combinedStyles}
                ref={ref as React.Ref<HTMLButtonElement>}
            >
                {children}
            </button>
        );
    }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
