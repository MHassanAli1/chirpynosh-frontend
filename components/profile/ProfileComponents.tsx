'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ProfileAvatarProps {
    avatar: string | null;
    name: string | null;
    size?: 'sm' | 'md' | 'lg';
    editable?: boolean;
    onUpload?: (file: File) => Promise<void>;
    onDelete?: () => Promise<void>;
    uploading?: boolean;
    colorScheme?: 'emerald' | 'blue' | 'orange';
}

const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-20 h-20 text-xl',
    lg: 'w-24 h-24 text-2xl',
};

const colorSchemes = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    orange: 'from-orange-500 to-amber-600',
};

export function ProfileAvatar({
    avatar,
    name,
    size = 'md',
    editable = false,
    onUpload,
    onDelete,
    uploading = false,
    colorScheme = 'emerald',
}: ProfileAvatarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showMenu, setShowMenu] = useState(false);

    const getInitials = (name: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUpload) {
            await onUpload(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setShowMenu(false);
    }, [onUpload]);

    const handleDelete = useCallback(async () => {
        if (onDelete) {
            await onDelete();
        }
        setShowMenu(false);
    }, [onDelete]);

    return (
        <div className="relative">
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colorSchemes[colorScheme]} flex items-center justify-center text-white font-bold ring-4 ring-white/30 overflow-hidden`}>
                {uploading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                ) : avatar ? (
                    <Image
                        src={avatar}
                        alt={name || 'User'}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    getInitials(name)
                )}
            </div>

            {editable && !uploading && (
                <>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                        📷
                    </button>

                    {showMenu && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[160px] z-10">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <span>📤</span>
                                Upload Photo
                            </button>
                            {avatar && (
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <span>🗑️</span>
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </>
            )}
        </div>
    );
}

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    subtext?: string;
}

export function StatCard({ icon, label, value, subtext }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-gray-700 font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {subtext && <div className="text-xs text-gray-600">{subtext}</div>}
        </div>
    );
}

interface EditableFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    editing: boolean;
    placeholder?: string;
    type?: 'text' | 'email';
    disabled?: boolean;
}

export function EditableField({
    label,
    value,
    onChange,
    editing,
    placeholder,
    type = 'text',
    disabled = false,
}: EditableFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
            {editing && !disabled ? (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                />
            ) : (
                <p className="text-gray-900 font-medium py-2">{value || 'Not set'}</p>
            )}
        </div>
    );
}
