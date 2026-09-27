'use client';

import React, { useState } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Search,
  Copy,
  Check,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useMarket } from '@/context/MarketContext';
import { OrderDeliveryStatus } from '@/types/market';

export default function DeliveryTrackingModal() {
  const {
    activeTrackingOrder,
    setActiveTrackingOrder,
    orders,
    isTrackingModalOpen,
    setIsTrackingModalOpen,
    trackOrderById,
  } = useMarket();

  const [searchId, setSearchId] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isTrackingModalOpen) return null;

  const currentOrder = activeTrackingOrder || orders[0];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setErrorMsg('');
    const found = await trackOrderById(searchId.trim());
    if (!found) {
      setErrorMsg(`No shipment found matching "${searchId}". Try sample: MH-ORD-8821`);
    } else {
      setSearchId('');
    }
  };

  const copyTracking = () => {
    if (!currentOrder) return;
    navigator.clipboard.writeText(currentOrder.tracking.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to determine stage status
  const stages: { label: string; status: OrderDeliveryStatus }[] = [
    { label: 'Placed', status: 'placed' },
    { label: 'Confirmed', status: 'confirmed' },
    { label: 'In Transit', status: 'shipped' },
    { label: 'Out for Delivery', status: 'out_for_delivery' },
    { label: 'Delivered', status: 'delivered' },
  ];

  const getStageIndex = (st: OrderDeliveryStatus) => {
    switch (st) {
      case 'placed':
        return 0;
      case 'confirmed':
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIndex = currentOrder ? getStageIndex(currentOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Delivery Tracker
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time carrier GPS checkpoints & vendor consignment status
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTrackingModalOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar & Order Switcher */}
        <div className="border-b border-slate-100 bg-slate-50/80 p-4 px-6 dark:border-slate-800 dark:bg-slate-950">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. MH-ORD-8821 or MH-ORD-8794)..."
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-sky-700"
            >
              Track
            </button>
          </form>

          {errorMsg && (
            <p className="mt-2 text-xs font-semibold text-rose-500">{errorMsg}</p>
          )}

          {/* Quick Select Buttons from Recent Orders */}
          {orders.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[11px] font-semibold text-slate-400">Recent Shipments:</span>
              {orders.slice(0, 4).map(ord => (
                <button
                  key={ord.id}
                  onClick={() => setActiveTrackingOrder(ord)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition ${
                    currentOrder?.id === ord.id
                      ? 'bg-sky-600 font-bold text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {ord.id}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!currentOrder ? (
            <div className="text-center py-12 text-slate-400">
              No orders found. Place an order or search using order ID.
            </div>
          ) : (
            <>
              {/* Top Summary Card */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 dark:border-sky-950 dark:bg-sky-950/20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                      Consignment ID: {currentOrder.id}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Estimated Arrival: {currentOrder.tracking.estimatedDelivery}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Current Hub: <strong>{currentOrder.tracking.currentLocation}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="text-left text-xs">
                      <p className="text-[10px] text-slate-400 font-semibold">{currentOrder.tracking.carrier}</p>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {currentOrder.tracking.trackingNumber}
                      </p>
                    </div>
                    <button
                      onClick={copyTracking}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                      title="Copy tracking number"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Visual Progress Steps Bar */}
                <div className="mt-8 mb-2">
                  <div className="relative flex justify-between">
                    {/* Connecting Bar */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-sky-500 z-0 transition-all duration-500"
                      style={{
                        width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
                      }}
                    />

                    {stages.map((stage, idx) => {
                      const isCompleted = idx <= currentStageIndex;
                      const isCurrent = idx === currentStageIndex;

                      return (
                        <div key={stage.label} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                              isCompleted
                                ? 'border-sky-500 bg-sky-500 text-white'
                                : 'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
                            } ${isCurrent ? 'ring-4 ring-sky-200 dark:ring-sky-950' : ''}`}
                          >
                            {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                          </div>
                          <span
                            className={`mt-2 text-[11px] font-semibold whitespace-nowrap ${
                              isCompleted
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-400'
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Items in this Consignment */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-indigo-500" />
                  <span>Items in This Consignment</span>
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentOrder.items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.productTitle}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Store className="h-3 w-3 text-indigo-400" />
                            <span>Vendor: {item.vendorName}</span>
                            <span>• Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkpoint Timeline */}
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-sky-500" />
                  <span>Chronological Journey & Checkpoints</span>
                </h4>

                <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {currentOrder.tracking.checkpoints.map((cp) => (
                    <div key={cp.id} className="relative">
                      <div
                        className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                          cp.completed
                            ? 'bg-sky-500 text-white ring-2 ring-sky-200 dark:ring-sky-950'
                            : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {cp.completed ? <Check className="h-3 w-3" /> : '•'}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          {cp.title}
                        </h5>
                        <span className="font-mono text-[10px] text-slate-400">
                          {cp.timestamp}
                        </span>
                      </div>

                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{cp.location}</span>
                      </p>

                      {cp.description && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 p-2 rounded-lg dark:bg-slate-800/50">
                          {cp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
