'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatNaira } from '@/lib/format';
import { useCart } from '@/lib/cart';
import {
  X,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Droplets,
  AlertCircle,
  Package,
} from 'lucide-react';

interface ProductDetailPopupProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailPopup: React.FC<ProductDetailPopupProps> = ({
  product,
  onClose,
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = !product.inStock || product.stockQuantity <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
      window.dispatchEvent(new CustomEvent('open_cart'));
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:text-gray-950 hover:bg-white shadow-md transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          {/* Main Product Image */}
          <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-stone-100">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-cover object-center"
                referrerPolicy="no-referrer"
                unoptimized={product.imageUrl.startsWith('data:')}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100/90 gap-2 p-6 text-center">
                <Package className="w-12 h-12 text-stone-300 stroke-[1.5]" />
                <span className="text-xs font-bold tracking-wider text-stone-400 uppercase">MD Skincare Haven</span>
              </div>
            )}

            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 text-xs font-black uppercase tracking-wider bg-emerald-800 text-white rounded-lg shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {product.category}
              </span>
              {product.volume && (
                <span className="text-xs text-gray-500 font-medium">
                  {product.volume}
                </span>
              )}
            </div>

            <h2 className="font-serif text-lg sm:text-2xl font-bold text-gray-950 leading-tight">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-xl sm:text-2xl font-bold text-emerald-950">
                {formatNaira(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatNaira(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Stock state */}
          <div className="flex items-center gap-2 text-xs">
            {isOutOfStock ? (
              <span className="text-red-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Currently Out of Stock
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> In Stock ({product.stockQuantity} available)
              </span>
            )}
            {product.skinType && (
              <span className="text-gray-500">• Ideal for: {product.skinType}</span>
            )}
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
            {product.description}
          </div>

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Key Benefits
              </h4>
              <ul className="text-xs text-gray-600 space-y-1 pl-1">
                {product.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How to use */}
          {product.howToUse && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-emerald-600" /> How to Use
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.howToUse}
              </p>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Full Ingredients
              </h4>
              <p className="text-[11px] text-gray-500 leading-normal italic">
                {product.ingredients}
              </p>
            </div>
          )}
        </div>

        {/* Footer sticky bar with Quantity and Add Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex items-center gap-3">
          {/* Quantity selector */}
          <div className="flex items-center border border-gray-200 rounded-2xl p-1 bg-stone-50">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="p-1.5 text-gray-600 hover:text-gray-950 disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 99, q + 1))}
              disabled={quantity >= (product.stockQuantity || 99) || isOutOfStock}
              className="p-1.5 text-gray-600 hover:text-gray-950 disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Action button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-98'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Bag!</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag • {formatNaira(product.price * quantity)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
