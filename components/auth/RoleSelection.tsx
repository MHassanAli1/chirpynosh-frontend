'use client';

import { SignupRole } from '@/hooks/auth/useSignupWizard';

interface RoleOption {
    role: SignupRole;
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
}

const roleOptions: RoleOption[] = [
    {
        role: 'SIMPLE_RECIPIENT',
        title: 'Individual',
        description: 'I want to receive food donations for personal use',
        gradient: 'from-blue-500 to-cyan-400',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
    },
    {
        role: 'NGO_RECIPIENT',
        title: 'NGO / Charity',
        description: 'We distribute food to communities in need',
        gradient: 'from-orange-500 to-amber-400',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
        ),
    },
    {
        role: 'FOOD_SUPPLIER',
        title: 'Food Supplier',
        description: 'I have surplus food to donate (restaurant, store, farm)',
        gradient: 'from-emerald-500 to-green-400',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
        ),
    },
];

interface RoleSelectionProps {
    onSelect: (role: SignupRole) => void;
}

/**
 * Step 1: Role Selection
 * Premium glassmorphism cards with hover animations
 */
export default function RoleSelection({ onSelect }: RoleSelectionProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Join ChirpyNosh
                </h2>
                <p className="mt-2 text-gray-700 font-medium">How would you like to participate?</p>
            </div>

            <div className="space-y-3">
                {roleOptions.map((option, index) => (
                    <button
                        key={option.role}
                        onClick={() => onSelect(option.role)}
                        className="group w-full p-5 rounded-2xl text-left
                                   bg-white/60 backdrop-blur-2xl
                                   border border-white/50 hover:border-white/80
                                   shadow-lg shadow-black/5
                                   hover:shadow-2xl hover:shadow-black/10
                                   hover:bg-white/80
                                   hover:-translate-y-1 hover:scale-[1.02]
                                   active:scale-[0.98]
                                   transition-all duration-300 ease-out
                                   animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                    >
                        <div className="flex items-center gap-4">
                            {/* Animated Icon Container */}
                            <div className={`relative flex-shrink-0 w-14 h-14 rounded-xl 
                                           bg-gradient-to-br ${option.gradient}
                                           flex items-center justify-center
                                           text-white
                                           shadow-lg group-hover:shadow-xl
                                           group-hover:scale-110
                                           transition-all duration-300`}>
                                {/* Pulse ring */}
                                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${option.gradient} 
                                               opacity-0 group-hover:opacity-50 
                                               animate-ping group-hover:animate-none
                                               transition-opacity duration-300`} />
                                {option.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                    {option.title}
                                </h3>
                                <p className="mt-0.5 text-sm text-gray-700 group-hover:text-gray-800 font-medium transition-colors">
                                    {option.description}
                                </p>
                            </div>

                            {/* Arrow with spring animation */}
                            <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 
                                           -translate-x-3 group-hover:translate-x-0
                                           transition-all duration-300 ease-out">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center
                                               group-hover:bg-gray-200 transition-colors">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
