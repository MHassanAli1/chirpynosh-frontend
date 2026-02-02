'use client';

import { useEffect, useState } from 'react';

/**
 * Google OAuth Callback Page
 * Receives the ID token from Google and posts it back to the parent window
 */
export default function GoogleCallbackPage() {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        // Get the hash fragment (contains id_token for implicit flow)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        const error = params.get('error');

        if (error) {
            setStatus('error');
            setMessage(`Authentication failed: ${error}`);
            return;
        }

        if (idToken) {
            // Send token back to parent window
            if (window.opener) {
                window.opener.postMessage(
                    { type: 'GOOGLE_AUTH_SUCCESS', credential: idToken },
                    window.location.origin
                );
                setStatus('success');
                setMessage('Authentication successful! Closing...');

                // Close popup after short delay
                setTimeout(() => {
                    window.close();
                }, 1000);
            } else {
                setStatus('error');
                setMessage('Unable to communicate with parent window');
            }
        } else {
            setStatus('error');
            setMessage('No authentication token received');
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
            <div className="text-center p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl max-w-sm">
                {status === 'processing' && (
                    <>
                        <div className="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-emerald-500 border-t-transparent rounded-full" />
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-12 h-12 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-emerald-600 font-medium">{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-red-600 font-medium">{message}</p>
                        <button
                            onClick={() => window.close()}
                            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
