'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Product, Category, StoreSettings, Order } from '@/lib/types';
import { TopBar } from '@/components/TopBar';
import { ProductCardGrid } from '@/components/ProductCardGrid';
import { ProductDetailPopup } from '@/components/ProductDetailPopup';
import { CartPopup } from '@/components/CartPopup';
import { CheckoutPopup } from '@/components/CheckoutPopup';
import { BankTransferPopup } from '@/components/BankTransferPopup';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { BrandHeroBanner } from '@/components/BrandHeroBanner';
import { RefreshCw, Sparkles, Filter, Lock } from 'lucide-react';

export default function ShoppingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Popups state (Single Page Shopping Experience)
  const [selectedProductPopup, setSelectedProductPopup] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [completedWhatsAppUrl, setCompletedWhatsAppUrl] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    let active = true;
    async function loadStore() {
      try {
        setLoading(true);
        const t = Date.now();
        const [prodRes, catRes, setRes] = await Promise.all([
          fetch(`/api/products?_t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
          fetch(`/api/categories?_t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
          fetch(`/api/settings?_t=${t}`, { cache: 'no-store' }).then((r) => r.json()),
        ]);

        if (!active) return;
        if (prodRes.success) setProducts(prodRes.products);
        if (catRes.success) setCategories(catRes.categories);
        if (setRes.success) setSettings(setRes.settings);
      } catch (err) {
        console.error('Failed to load store catalog', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStore();

    const handleRevalidate = () => {
      loadStore();
    };
    window.addEventListener('focus', handleRevalidate);
    document.addEventListener('visibilitychange', handleRevalidate);
    window.addEventListener('storage', handleRevalidate);
    window.addEventListener('md_catalog_updated', handleRevalidate);

    return () => {
      active = false;
      window.removeEventListener('focus', handleRevalidate);
      document.removeEventListener('visibilitychange', handleRevalidate);
      window.removeEventListener('storage', handleRevalidate);
      window.removeEventListener('md_catalog_updated', handleRevalidate);
    };
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) =>
          p.categorySlug === selectedCategory ||
          p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return result;
  }, [products, searchQuery, selectedCategory]);

  // Order Success Handler
  const handleOrderSuccess = (order: Order, whatsAppUrl: string) => {
    setIsCheckoutOpen(false);
    setCompletedOrder(order);
    setCompletedWhatsAppUrl(whatsAppUrl);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#047857', '#10b981', '#34d399', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  };

  const storeBrandName = settings?.brandName || 'MD SKINCARE HAVEN';
  const ownerPhone = settings?.ownerWhatsApp || '+2349070938624';
  const bankName = settings?.bankDetails?.bankName || 'OPay Digital Services';
  const bannerData = {
    brandName: settings?.banner?.brandName || (settings as any)?.heroBanner?.brandName || storeBrandName,
    announcementText:
      settings?.banner?.announcementText ||
      (settings as any)?.heroBanner?.badge ||
      '🌿 Pure & Natural Botanical Skincare • Direct Bank Transfer Payment',
    heading:
      settings?.banner?.heading ||
      (settings as any)?.heroBanner?.heading ||
      'Healthy, Radiant Melanin Glow',
    subheading:
      settings?.banner?.subheading ||
      (settings as any)?.heroBanner?.subheading ||
      'Premium clinical-grade skincare products formulated for healthy, clear, and glowing skin.',
    imageUrl:
      settings?.banner?.imageUrl ||
      (settings as any)?.heroBanner?.imageUrl ||
      '/images/banner.jpg',
  };

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900 font-sans selection:bg-emerald-200 flex flex-col justify-between">
      {/* 1. Simple Top Bar */}
      <TopBar
        brandName={storeBrandName}
        announcementText={bannerData?.announcementText}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Main Shopping Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-4">
        {/* Permanent Official Brand Banner */}
        <BrandHeroBanner />

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full font-bold transition shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-stone-100 border border-gray-200'
              }`}
            >
              All ({products.length})
            </button>
            {categories
              .filter((c) => c.slug !== 'all')
              .map((c) => {
                const count = products.filter(
                  (p) =>
                    p.categorySlug === c.slug ||
                    p.category.toLowerCase() === c.name.toLowerCase()
                ).length;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`px-3 py-1.5 rounded-full font-bold transition shrink-0 ${
                      selectedCategory === c.slug
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-stone-100 border border-gray-200'
                    }`}
                  >
                    {c.name} {count > 0 && `(${count})`}
                  </button>
                );
              })}
          </div>
        )}

        {/* 3. Two-Column Product Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin" />
            <p className="text-xs text-gray-500 font-semibold">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 space-y-3">
            <p className="text-sm font-bold text-gray-800">No products found</p>
            <p className="text-xs text-gray-500">
              Try adjusting your search query or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <ProductCardGrid
            products={filteredProducts}
            onSelectOptions={(p) => setSelectedProductPopup(p)}
          />
        )}
      </main>

      {/* Floating WhatsApp Button */}
      <WhatsAppFloatingButton ownerWhatsApp={ownerPhone} brandName={storeBrandName} />

      {/* Popups & Modals (Single Page Shopping Experience) */}

      {/* Product Detail / Options Popup */}
      <ProductDetailPopup
        product={selectedProductPopup}
        onClose={() => setSelectedProductPopup(null)}
      />

      {/* Cart Popup */}
      <CartPopup
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Popup (3 fields: Name, Location, WhatsApp) */}
      <CheckoutPopup
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        bankName={bankName}
      />

      {/* Bank Transfer Details Popup (Order Confirmation) */}
      <BankTransferPopup
        order={completedOrder}
        whatsAppUrl={completedWhatsAppUrl}
        ownerWhatsApp={ownerPhone}
        brandName={storeBrandName}
        onClose={() => setCompletedOrder(null)}
      />

      {/* Simple Clean Footer with Discreet Owner Admin Link */}
      <footer className="mt-8 border-t border-gray-200 bg-white py-6 px-4 text-center text-xs text-gray-500 space-y-2">
        <p className="font-semibold text-gray-700">
          {storeBrandName} • Direct Bank Transfer Shopping
        </p>
        <p className="text-[11px] text-gray-400">
          All orders are paid via verified Bank Transfer. No debit card required.
        </p>

        {/* Discreet Owner Dashboard Link (At the bottom of the footer, subtle and discreet for the owner) */}
        <div className="pt-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-emerald-700 transition group"
            title="Store Owner Portal"
          >
            <Lock className="w-3 h-3 text-stone-300 group-hover:text-emerald-700 transition" />
            <span className="text-stone-400 group-hover:text-emerald-800 transition">Store Management</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
