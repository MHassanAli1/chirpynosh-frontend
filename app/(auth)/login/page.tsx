import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

/**
 * Login Page
 * Email/password and Google OAuth login
 */
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
