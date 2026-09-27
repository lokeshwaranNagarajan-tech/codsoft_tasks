'use client';

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  Store,
} from 'lucide-react';
import { useMarket } from '@/context/MarketContext';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export default function CartDrawer({ onOpenCheckout }: CartDrawerProps) {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSummary,
    isCartOpen,
    setIsCartOpen,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  } = useMarket();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyPromoCode(couponInput.trim());
    setIsApplying(false);

    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  // Group items by vendor
  const vendorGroups = cart.reduce((acc, item) => {
    const vId = item.product.vendorId;
    if (!acc[vId]) {
      acc[vId] = {
        vendorName: item.product.vendor.name,
        items: [],
      };
    }
    acc[vId].items.push(item);
    return acc;
  }, {} as Record<string, { vendorName: string; items: typeof cart }>);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Shopping Cart
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {cartSummary.itemCount} item{cartSummary.itemCount !== 1 ? 's' : ''} in cart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-bold text-slate-800 dark:text-slate-200">
                Your cart is empty
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                Explore thousands of items from top verified sellers on MarketHub!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
              >
                Start Discovering
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(vendorGroups).map(([vendorId, group]) => (
                <div key={vendorId} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
                  {/* Vendor badge */}
                  <div className="mb-3 flex items-center gap-1.5 border-b border-slate-200/60 pb-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    <Store className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Package from {group.vendorName}</span>
                  </div>

                  <div className="space-y-3">
                    {group.items.map(item => (
                      <div
                        key={item.product.id}
                        className="flex gap-3 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="h-16 w-16 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="line-clamp-1 text-xs font-bold text-slate-900 dark:text-white">
                              {item.product.title}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-slate-400 hover:text-rose-500"
                              title="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>

                            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="flex h-6 w-6 items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="flex h-6 w-6 items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Promo Code Input */}
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  <Tag className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Promo Code</span>
                </div>

                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      <span>{appliedPromo.code} ({appliedPromo.discountPercent}% OFF)</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-emerald-700 hover:text-emerald-900 underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. AUDIO25, FALLAURA"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs uppercase placeholder:normal-case focus:border-indigo-500 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-600 disabled:opacity-50 dark:bg-slate-800"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="mt-1.5 text-[11px] font-semibold text-rose-500">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="mt-1.5 text-[11px] font-semibold text-emerald-600">{couponSuccess}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span>${cartSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Multi-Vendor Shipping</span>
                <span>{cartSummary.shipping === 0 ? 'FREE' : `$${cartSummary.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Sales Tax (8%)</span>
                <span>${cartSummary.tax.toFixed(2)}</span>
              </div>
              {cartSummary.discount > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>-${cartSummary.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900 dark:border-slate-800 dark:text-white">
                <span>Order Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  ${cartSummary.total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onOpenCheckout();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Escrow Payment Protection Included</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
