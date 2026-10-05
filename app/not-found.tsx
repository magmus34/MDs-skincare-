'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
        404
      </div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Page Not Found</h1>
      <p className="text-stone-600 mb-6 max-w-md">
        The skincare product or page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        Return to Shop
      </Link>
    </div>
  );
}
