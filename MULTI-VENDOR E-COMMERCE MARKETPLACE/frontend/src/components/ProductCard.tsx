'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  ShoppingBag,
  Scale,
  Eye,
  CheckCircle2,
  Truck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Product } from '@/types/market';
import { useMarket } from '@/context/MarketContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart, addToCompare, isComparing } = useMarket();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const comparing = isComparing(product.id);
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-600"
    >
      {/* Top Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discountPercent > 0 && (
          <span className="inline-flex items-center rounded-lg bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-md">
            Save {discountPercent}%
          </span>
        )}
        {product.featured && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            Featured
          </span>
        )}
      </div>

      {/* Floating Action Buttons on Hover (Compare, Quick View) */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <button
          onClick={() => addToCompare(product)}
          className={`flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-md shadow-md transition ${
            comparing
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
              : 'bg-white/90 text-slate-700 hover:bg-white hover:text-indigo-600 dark:bg-slate-800/90 dark:text-slate-300'
          }`}
          title={comparing ? 'Remove from compare' : 'Compare product'}
        >
          <Scale className="h-4 w-4" />
        </button>

        <button
          onClick={() => onQuickView(product)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:text-indigo-600 dark:bg-slate-800/90 dark:text-slate-300"
          title="Quick preview & specs"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Image Container with Fallback */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800/60">
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Thumbnail switcher if multiple images */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-2">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setCurrentImageIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentImageIndex === idx ? 'w-5 bg-indigo-600' : 'w-1.5 bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Vendor Header Capsule */}
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">
              {product.vendor.name}
            </span>
            {product.vendor.verified && (
              <span title="Verified Vendor">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="font-normal text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onQuickView(product)}
          className="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-indigo-600 cursor-pointer dark:text-white"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Key Specification Preview */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
            <span
              key={key}
              className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {key}: <strong className="text-slate-900 dark:text-white">{value}</strong>
            </span>
          ))}
        </div>

        {/* Price & Shipping Info */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-slate-400 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px]">
            {product.shipping.freeShipping ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium dark:text-emerald-400">
                <Truck className="h-3 w-3" />
                Free 2-day delivery
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                +${product.shipping.cost.toFixed(2)} shipping
              </span>
            )}

            {product.stock <= 5 ? (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-500">
                <AlertCircle className="h-3 w-3" /> Only {product.stock} left!
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400">In Stock</span>
            )}
          </div>

          {/* Add to Cart Primary Button */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
