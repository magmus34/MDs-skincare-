'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart';
import { formatNaira } from '@/lib/format';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';

interface CartPopupProps {
  onProceedToCheckout: () => void;
}

export const CartPopup: React.FC<CartPopupProps> = ({
  onProceedToCheckout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalCount, subtotal, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open_cart', handleOpen);
    return () => window.removeEventListener('open_cart', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-800" />
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Your Shopping Bag
            </h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
              {totalCount}
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-stone-100 transition"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Your bag is empty</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Discover our gentle botanical formulas and add your favorites to checkout.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition"
              >
                Browse Skincare
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/50"
              >
                {/* Thumb */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0 flex items-center justify-center">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized={product.imageUrl.startsWith('data:')}
                    />
                  ) : (
                    <Package className="w-6 h-6 text-stone-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-gray-500">{product.category}</p>
                  <p className="text-xs font-bold text-emerald-900 mt-0.5">
                    {formatNaira(product.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-0.5">
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    className="p-1 text-gray-500 hover:text-gray-900"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    disabled={quantity >= (product.stockQuantity || 99)}
                    className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(product.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-gray-100 space-y-3">
            <div className="bg-emerald-50 rounded-xl p-2.5 text-[11px] text-emerald-900 flex items-center gap-2 border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Direct Bank Transfer • No cards required • Instant WhatsApp confirmation</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-bold text-lg text-emerald-950">
                {formatNaira(subtotal)}
              </span>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
