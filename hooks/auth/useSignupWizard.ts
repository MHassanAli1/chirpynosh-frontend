'use client';

import { useState, useCallback } from 'react';
import { authApi, SignupPayload, GoogleAuthPayload } from '@/services/auth.api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

/**
 * User roles available for signup (ADMIN excluded)
 */
export type SignupRole = 'SIMPLE_RECIPIENT' | 'NGO_RECIPIENT' | 'FOOD_SUPPLIER';

/**
 * Auth method selection
 */
export type AuthMethod = 'email' | 'google' | null;

/**
 * Wizard step type
 */
export type WizardStep = 'role' | 'organization' | 'auth-method' | 'email-form' | 'otp-verification';

/**
 * Signup wizard state
 */
export interface SignupState {
    role: SignupRole | null;
    organizationName: string;
    authMethod: AuthMethod;
    name: string;
    email: string;
    password: string;
}

/**
 * Initial wizard state
 */
const initialState: SignupState = {
    role: null,
    organizationName: '',
    authMethod: null,
    name: '',
    email: '',
    password: '',
};

/**
 * Password validation regex
 */
const PASSWORD_REGEX = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
};

/**
 * Custom hook for signup wizard state management
 * Keeps all state local until final submission
 */
export function useSignupWizard() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
    
    const [state, setState] = useState<SignupState>(initialState);
    const [step, setStep] = useState<WizardStep>('role');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    /**
     * Check if organization step is needed
     */
    const needsOrganization = state.role === 'NGO_RECIPIENT' || state.role === 'FOOD_SUPPLIER';

    /**
     * Validate password strength
     */
    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!PASSWORD_REGEX.uppercase.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!PASSWORD_REGEX.lowercase.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!PASSWORD_REGEX.number.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    /**
     * Update state field
     */
    const updateField = useCallback(<K extends keyof SignupState>(
        field: K,
        value: SignupState[K]
    ) => {
        setState((prev) => ({ ...prev, [field]: value }));
        setError(null);
    }, []);

    /**
     * Set role and advance to next step
     */
    const selectRole = useCallback((role: SignupRole) => {
        setState((prev) => ({ ...prev, role }));
        setError(null);
        
        // Go to org step if needed, otherwise auth method
        if (role === 'NGO_RECIPIENT' || role === 'FOOD_SUPPLIER') {
            setStep('organization');
        } else {
            setStep('auth-method');
        }
    }, []);

    /**
     * Complete organization step
     */
    const submitOrganization = useCallback(() => {
        if (!state.organizationName.trim()) {
            setError('Organization name is required');
            return;
        }
        if (state.organizationName.trim().length < 2) {
            setError('Organization name must be at least 2 characters');
            return;
        }
        setStep('auth-method');
    }, [state.organizationName]);

    /**
     * Select auth method
     */
    const selectAuthMethod = useCallback((method: AuthMethod) => {
        setState((prev) => ({ ...prev, authMethod: method }));
        setError(null);
        
        if (method === 'email') {
            setStep('email-form');
        }
        // Google flow is handled separately
    }, []);

    /**
     * Go back to previous step
     */
    const goBack = useCallback(() => {
        switch (step) {
            case 'organization':
                setStep('role');
                break;
            case 'auth-method':
                setStep(needsOrganization ? 'organization' : 'role');
                break;
            case 'email-form':
                setStep('auth-method');
                break;
            case 'otp-verification':
                setStep('email-form');
                break;
        }
        setError(null);
        setSuccessMessage(null);
    }, [step, needsOrganization]);

    /**
     * Handle Google OAuth signup
     */
    const handleGoogleSignup = useCallback(async (googleToken: string) => {
        if (!state.role) {
            setError('Please select a role first');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const payload: GoogleAuthPayload = {
                googleToken,
                role: state.role,
                ...(needsOrganization && { organizationName: state.organizationName.trim() }),
            };

            const { user, isNewUser } = await authApi.googleAuth(payload);
            setUser(user);
            
            // Redirect based on result
            if (isNewUser) {
                router.push('/');
            } else {
                router.push('/');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Google signup failed';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [state.role, state.organizationName, needsOrganization, setUser, router]);

    /**
     * Submit email signup - Sends OTP to email
     */
    const submitEmailSignup = useCallback(async () => {
        // Validate fields
        if (!state.name.trim()) {
            setError('Name is required');
            return;
        }
        if (state.name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }
        if (!state.email.trim()) {
            setError('Email is required');
            return;
        }
        
        // Validate password
        const passwordError = validatePassword(state.password);
        if (passwordError) {
            setError(passwordError);
            return;
        }
        
        if (!state.role) {
            setError('Please select a role');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload: SignupPayload = {
                email: state.email.trim().toLowerCase(),
                password: state.password,
                name: state.name.trim(),
                role: state.role,
                ...(needsOrganization && { organizationName: state.organizationName.trim() }),
            };

            const result = await authApi.signup(payload);
            setSuccessMessage(result.message);
            setStep('otp-verification');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [state, needsOrganization]);

    /**
     * Verify OTP and complete signup
     */
    const verifyOtp = useCallback(async (otp: string) => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await authApi.verifyOtp(state.email.trim().toLowerCase(), otp);
            setUser(result.user);
            router.push('/');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid OTP';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [state.email, setUser, router]);

    /**
     * Resend OTP
     */
    const resendOtp = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authApi.resendOtp(state.email.trim().toLowerCase());
            setSuccessMessage(result.message);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to resend OTP';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [state.email]);

    /**
     * Reset wizard to initial state
     */
    const reset = useCallback(() => {
        setState(initialState);
        setStep('role');
        setError(null);
        setSuccessMessage(null);
    }, []);

    return {
        // State
        state,
        step,
        isLoading,
        error,
        successMessage,
        needsOrganization,
        
        // Actions
        updateField,
        selectRole,
        submitOrganization,
        selectAuthMethod,
        submitEmailSignup,
        handleGoogleSignup,
        verifyOtp,
        resendOtp,
        goBack,
        reset,
    };
}

export default useSignupWizard;
