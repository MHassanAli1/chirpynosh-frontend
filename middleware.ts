import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth routes that should redirect to dashboard if already logged in
 */
const AUTH_ROUTES = ['/login', '/signup'];

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = ['/dashboard', '/kyc', '/admin-dash'];

/**
 * API URL for server-side auth verification
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Helper to build cookie header from request
 */
function buildCookieHeader(request: NextRequest): string {
    return request.cookies.getAll()
        .map(c => `${c.name}=${c.value}`)
        .join('; ');
}

/**
 * Basic user info from auth response
 */
interface AuthUser {
    id: string;
    email: string;
    role: string;
}

/**
 * Try to verify user with /me endpoint, with automatic token refresh
 */
async function verifyUser(request: NextRequest): Promise<{ user: AuthUser; newCookies?: string[] } | null> {
    const cookieHeader = buildCookieHeader(request);
    
    // First, try /auth/me with current tokens
    try {
        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
        });

        if (meResponse.ok) {
            const data = await meResponse.json();
            if (data.success && data.data) {
                return { user: data.data };
            }
        }
    } catch {
        // /me failed, try to refresh
    }

    // If /me failed, try to refresh the token
    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
        return null;
    }

    try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            if (data.success && data.data) {
                // Get new cookies from response
                const setCookies = refreshResponse.headers.getSetCookie();
                return { user: data.data, newCookies: setCookies };
            }
        }
    } catch {
        // Refresh also failed
    }

    return null;
}

/**
 * Middleware to handle authentication routing
 * - Redirects authenticated users away from login/signup
 * - Redirects unauthenticated users to login from protected routes
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // Static files
    ) {
        return NextResponse.next();
    }

    // Get tokens from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    const hasTokens = !!(accessToken || refreshToken);

    // Check if current route is an auth route (login/signup)
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
    
    // Check if current route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    // If user has tokens and is on auth route, verify and redirect to dashboard
    if (isAuthRoute && hasTokens) {
        const result = await verifyUser(request);
        
        if (result?.user) {
            // User is authenticated, redirect to appropriate dashboard
            const dashboardPath = getDashboardPath(result.user.role);
            const response = NextResponse.redirect(new URL(dashboardPath, request.url));
            
            // Forward any new cookies from token refresh
            if (result.newCookies) {
                result.newCookies.forEach(cookie => {
                    response.headers.append('Set-Cookie', cookie);
                });
            }
            
            return response;
        }
        
        // If verification failed, clear invalid tokens and allow access to auth page
        if (hasTokens && !result) {
            const response = NextResponse.next();
            // Clear stale tokens
            response.cookies.delete('accessToken');
            response.cookies.delete({ name: 'refreshToken', path: '/api/auth' });
            return response;
        }
    }

    // For protected routes, verify authentication
    if (isProtectedRoute) {
        if (!hasTokens) {
            // No tokens at all, redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        
        // Has tokens, verify they're valid
        const result = await verifyUser(request);
        
        if (!result?.user) {
            // Invalid tokens, clear them and redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('accessToken');
            response.cookies.delete({ name: 'refreshToken', path: '/api/auth' });
            return response;
        }
        
        // Valid user, continue with any new cookies
        const response = NextResponse.next();
        if (result.newCookies) {
            result.newCookies.forEach(cookie => {
                response.headers.append('Set-Cookie', cookie);
            });
        }
        return response;
    }

    return NextResponse.next();
}

/**
 * Get dashboard path based on user role
 */
function getDashboardPath(role: string): string {
    switch (role) {
        case 'SIMPLE_RECIPIENT':
            return '/dashboard/recipient';
        case 'NGO_RECIPIENT':
            return '/dashboard/ngo-recipient';
        case 'FOOD_SUPPLIER':
            return '/dashboard/food-supplier';
        case 'ADMIN':
            return '/admin-dash';
        default:
            return '/dashboard';
    }
}

/**
 * Configure which routes use this middleware
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
};
