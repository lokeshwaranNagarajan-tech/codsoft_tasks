'use client';

import React from 'react';
import {
  X,
  Scale,
  Trash2,
  ShoppingBag,
  Star,
  CheckCircle2,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { useMarket } from '@/context/MarketContext';

export default function CompareDrawer() {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    isCompareOpen,
    setIsCompareOpen,
    addToCart,
  } = useMarket();

  if (!isCompareOpen) return null;

  // Gather all unique specification keys across comparing products
  const allSpecKeys = Array.from(
    new Set(
      compareList.flatMap(p => Object.keys(p.specifications || {}))
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Product Comparison Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing {compareList.length} of 4 products side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={() => setIsCompareOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {compareList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-slate-800 dark:text-indigo-400 mb-4">
              <Scale className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No products selected for comparison
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Browse products and click the scale/compare icon on any item card to see their specifications, pricing, and vendor details side-by-side.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto p-6">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-44 bg-white p-3 font-semibold uppercase tracking-wider text-slate-400 dark:bg-slate-900">
                    Product
                  </th>
                  {compareList.map(product => (
                    <th key={product.id} className="min-w-[240px] max-w-[280px] p-3 align-top">
                      <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700"
                          title="Remove from comparison"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {product.category}
                        </span>
                        <h4 className="mt-1 line-clamp-2 font-bold text-slate-900 dark:text-white">
                          {product.title}
                        </h4>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ${product.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            addToCart(product);
                            setIsCompareOpen(false);
                          }}
                          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow transition hover:bg-indigo-700"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Seller / Vendor Row */}
                <tr>
                  <td className="sticky left-0 bg-white py-3.5 px-3 font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    Seller / Vendor
                  </td>
                  {compareList.map(p => (
                    <td key={p.id} className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <span>{p.vendor.name}</span>
                        {p.vendor.verified && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{p.vendor.rating}</span>
                        <span className="text-slate-400">({p.vendor.location})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Rating & Reviews */}
                <tr>
                  <td className="sticky left-0 bg-white py-3.5 px-3 font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    Product Rating
                  </td>
                  {compareList.map(p => (
                    <td key={p.id} className="py-3.5 px-3">
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating} / 5.0</span>
                        <span className="font-normal text-slate-400">({p.reviewCount} reviews)</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Stock & Availability */}
                <tr>
                  <td className="sticky left-0 bg-white py-3.5 px-3 font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    Availability
                  </td>
                  {compareList.map(p => (
                    <td key={p.id} className="py-3.5 px-3">
                      {p.stock > 0 ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          In Stock ({p.stock} units)
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          Out of Stock
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Shipping info */}
                <tr>
                  <td className="sticky left-0 bg-white py-3.5 px-3 font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    Shipping & Delivery
                  </td>
                  {compareList.map(p => (
                    <td key={p.id} className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <Truck className="h-3.5 w-3.5 text-sky-500" />
                        <span>{p.shipping.freeShipping ? 'Free Delivery' : `$${p.shipping.cost}`}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">ETA: {p.shipping.estimatedDays}</span>
                    </td>
                  ))}
                </tr>

                {/* Dynamic Specifications */}
                {allSpecKeys.map(specKey => (
                  <tr key={specKey}>
                    <td className="sticky left-0 bg-white py-3 px-3 font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      {specKey}
                    </td>
                    {compareList.map(p => (
                      <td key={p.id} className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {p.specifications[specKey] || (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
