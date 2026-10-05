'use client';

import React from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/lib/cart';

interface TopBarProps {
  brandName: string;
  announcementText?: string;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  brandName,
  announcementText,
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
}) => {
  const { totalCount } = useCart();

  const handleOpenCart = () => {
    window.dispatchEvent(new CustomEvent('open_cart'));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Announcement Ribbon */}
      {announcementText && (
        <div className="bg-emerald-900 text-emerald-100 text-[11px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-1.5">
          <span>{announcementText}</span>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-stone-200/80 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/permanent-banner.svg"
              alt="MD Skincare Haven"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-emerald-950">
            {brandName}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
            Official Store
          </span>
        </div>

        {/* Right actions: Search & Cart */}
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-2 rounded-xl transition ${
              searchOpen
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-gray-600 hover:text-emerald-700 hover:bg-stone-100'
            }`}
            aria-label="Toggle search"
            title="Search products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Icon Button */}
          <button
            onClick={handleOpenCart}
            className="relative p-2 rounded-xl text-gray-700 hover:text-emerald-700 hover:bg-stone-100 transition flex items-center"
            aria-label="Open cart"
            title="View Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-scale-in shadow-xs">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Search Input */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-stone-50 px-4 py-2.5 max-w-5xl mx-auto flex items-center gap-2 animate-fade-in">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search serums, sunscreens, cleansers, skin types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
