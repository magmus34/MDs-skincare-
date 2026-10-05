'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatNaira } from '@/lib/format';
import { useCart } from '@/lib/cart';
import { Plus, Check, Eye, AlertCircle, Package } from 'lucide-react';

interface ProductCardGridProps {
  products: Product[];
  onSelectOptions: (product: Product) => void;
}

export const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  products,
  onSelectOptions,
}) => {
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || product.stockQuantity <= 0) {
      onSelectOptions(product);
      return;
    }

    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
      {products.map((p) => {
        const isOutOfStock = !p.inStock || p.stockQuantity <= 0;
        const discountPercent =
          p.originalPrice && p.originalPrice > p.price
            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
            : 0;

        return (
          <div
            key={p.id}
            onClick={() => onSelectOptions(p)}
            className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            {/* Image & Badges */}
            <div className="relative w-full aspect-square bg-stone-100 overflow-hidden">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  unoptimized={p.imageUrl.startsWith('data:')}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100/90 gap-1.5 p-4 text-center">
                  <Package className="w-8 h-8 text-stone-300 stroke-[1.5]" />
                  <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">MD Skincare</span>
                </div>
              )}

              {/* Top Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                {p.badge && (
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-800 text-white rounded-md shadow-xs">
                    {p.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded-md shadow-xs">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Stock Status Badge */}
              {isOutOfStock ? (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-lg shadow-sm flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                </div>
              ) : p.stockQuantity <= 5 ? (
                <span className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded">
                  Only {p.stockQuantity} left
                </span>
              ) : null}
            </div>

            {/* Product Info */}
            <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[10px] sm:text-[11px] font-medium text-emerald-700 uppercase tracking-wide">
                  {p.category}
                </p>
                <h3 className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition">
                  {p.name}
                </h3>
                {p.volume && (
                  <p className="text-[10px] text-gray-400">{p.volume}</p>
                )}
              </div>

              {/* Price & Add to Cart button */}
              <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-1.5">
                <div>
                  <div className="font-bold text-xs sm:text-base text-gray-950">
                    {formatNaira(p.price)}
                  </div>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <div className="text-[10px] sm:text-xs text-gray-400 line-through">
                      {formatNaira(p.originalPrice)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(p, e)}
                  disabled={isOutOfStock}
                  className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 ${
                    isOutOfStock
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : addedId === p.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-95 shadow-xs'
                  }`}
                  title={isOutOfStock ? 'Out of stock' : 'Quick add to cart'}
                >
                  {addedId === p.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
