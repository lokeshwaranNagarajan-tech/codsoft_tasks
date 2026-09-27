'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Store,
} from 'lucide-react';
import { useMarket } from '@/context/MarketContext';
import { Order } from '@/types/market';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, cartSummary, placeOrder, setActiveTrackingOrder, setIsTrackingModalOpen } = useMarket();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Form State
  const [shipping, setShipping] = useState({
    fullName: 'Lokesh Sharma',
    email: 'lokesh.engineer@markethub.com',
    phone: '+1 (555) 782-9012',
    addressLine1: '742 Market Street, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'upi' | 'cod' | 'escrow'>('credit_card');
  const [cardDetails, setCardDetails] = useState({
    number: '•••• •••• •••• 4242',
    exp: '12/28',
    cvv: '982',
  });

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step < 3) setStep((step + 1) as any);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((step - 1) as any);
  };

  const handleFinalizeOrder = async () => {
    setIsSubmitting(true);
    try {
      const order = await placeOrder(shipping, paymentMethod);
      setCreatedOrder(order);
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {step === 4 ? 'Order Confirmed!' : 'Secure MarketHub Checkout'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 1 && 'Step 1 of 3: Shipping & Delivery Address'}
                {step === 2 && 'Step 2 of 3: Payment & Escrow Protection'}
                {step === 3 && 'Step 3 of 3: Final Review & Multi-Vendor Placement'}
                {step === 4 && 'Your order is placed and ready for tracking'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps Progress Indicator (if not completed) */}
        {step < 4 && (
          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/70 py-2.5 px-6 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1</span>
              <span>Shipping</span>
            </div>
            <div className={`flex items-center gap-1.5 justify-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2</span>
              <span>Payment</span>
            </div>
            <div className={`flex items-center gap-1.5 justify-end ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>3</span>
              <span>Review</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Shipping Address */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={shipping.fullName}
                    onChange={e => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={shipping.email}
                    onChange={e => setShipping({ ...shipping, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={shipping.phone}
                    onChange={e => setShipping({ ...shipping, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={shipping.addressLine1}
                    onChange={e => setShipping({ ...shipping, addressLine1: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={e => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={shipping.state}
                    onChange={e => setShipping({ ...shipping, state: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={shipping.postalCode}
                    onChange={e => setShipping({ ...shipping, postalCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition ${
                    paymentMethod === 'credit_card'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1 text-indigo-600" />
                  <span className="text-xs font-bold">Credit / Debit</span>
                  <span className="text-[10px] text-slate-400">Visa, MC, Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition ${
                    paymentMethod === 'upi'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  <Sparkles className="h-5 w-5 mb-1 text-sky-500" />
                  <span className="text-xs font-bold">Instant UPI / QR</span>
                  <span className="text-[10px] text-slate-400">Google Pay, PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition ${
                    paymentMethod === 'cod'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  <Truck className="h-5 w-5 mb-1 text-amber-500" />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                  <span className="text-[10px] text-slate-400">Pay at doorstep</span>
                </button>
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardDetails.exp}
                        onChange={e => setCardDetails({ ...cardDetails, exp: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardDetails.cvv}
                        onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Escrow badge */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">MarketHub Escrow Safeguard:</span>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Sellers do not receive funds until your delivery arrives and passes your satisfaction inspection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Order Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Items from {new Set(cart.map(c => c.product.vendor.name)).size} Vendors
                </h4>
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.product.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Sold by {item.product.vendor.name} • Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950 space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Deliver to:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {shipping.fullName}, {shipping.city}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Payment:</span>
                  <span className="font-semibold capitalize text-slate-900 dark:text-white">
                    {paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900 dark:border-slate-800 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ${cartSummary.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && createdOrder && (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Payment & Order Verified!
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Order ID:{' '}
                <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  {createdOrder.id}
                </strong>
              </p>

              <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Carrier:</span>
                  <span className="font-bold">{createdOrder.tracking.carrier}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Tracking Code:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {createdOrder.tracking.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-bold text-emerald-600">
                    {createdOrder.tracking.estimatedDelivery}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={() => {
                    onClose();
                    setActiveTrackingOrder(createdOrder);
                    setIsTrackingModalOpen(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700"
                >
                  <Truck className="h-4 w-4" />
                  <span>Track This Order Live</span>
                </button>
                <button
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation (Steps 1, 2, 3) */}
        {step < 4 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 p-4 px-6 dark:border-slate-800 dark:bg-slate-950">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalizeOrder}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                <span>{isSubmitting ? 'Securing Order...' : `Pay $${cartSummary.total.toFixed(2)}`}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
