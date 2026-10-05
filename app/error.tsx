'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-800 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
        !
      </div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Something went wrong</h1>
      <p className="text-stone-600 mb-6 max-w-md">
        An error occurred while loading this page. Please try refreshing.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        Try Again
      </button>
    </div>
  );
}
