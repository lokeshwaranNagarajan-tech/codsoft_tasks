'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Scale,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Store,
  MapPin,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Product } from '@/types/market';
import { useMarket } from '@/context/MarketContext';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  const { addToCart, addToCompare, isComparing } = useMarket();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const comparing = isComparing(product.id);
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Section */}
          <div className="flex flex-col bg-slate-50 p-6 dark:bg-slate-950/50">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-inner dark:bg-slate-800">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
              {discountPercent > 0 && (
                <span className="absolute left-3 top-3 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      selectedImage === idx
                        ? 'border-indigo-600 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Escrow Guarantee Box */}
            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>MarketHub Buyer Protection</span>
              </div>
              <p className="mt-1 text-[11px] text-indigo-700 dark:text-indigo-300">
                Payment is held in escrow until you receive and verify the item. 30-day money-back guarantee with hassle-free returns.
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col p-6 sm:p-8">
            {/* Vendor Mini-Card */}
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {product.vendor.name}
                    </span>
                    {product.vendor.verified && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      ★ {product.vendor.rating}
                    </span>
                    <span>• {product.vendor.location}</span>
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                SKU: {product.sku}
              </span>
            </div>

            {/* Product Title */}
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {product.title}
            </h2>

            {/* Rating Bar */}
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                ))}
                <span className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                  {product.rating}
                </span>
              </div>
              <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-slate-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {product.description}
            </p>

            {/* Technical Specifications Matrix */}
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] text-slate-400">{key}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Delivery Info */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-emerald-500" />
                <span>
                  {product.shipping.freeShipping ? 'Free Standard Shipping' : `Shipping: $${product.shipping.cost}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-sky-500" />
                <span>Est. Delivery: {product.shipping.estimatedDays}</span>
              </div>
            </div>

            {/* Quantity Selector and CTA Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(product, qty);
                    onClose();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add {qty} to Cart • ${(product.price * qty).toFixed(2)}</span>
                </button>
              </div>

              <button
                onClick={() => addToCompare(product)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${
                  comparing
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Scale className="h-4 w-4" />
                <span>{comparing ? 'In Compare List (Click to Remove)' : 'Add to Compare'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
