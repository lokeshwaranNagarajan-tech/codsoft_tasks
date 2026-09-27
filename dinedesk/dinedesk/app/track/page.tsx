'use client';

import React, { useState, useEffect, useCallback, Suspense, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface OrderItem {
  id?: number | string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: number | string;
  order_id?: string;
  customer_name: string;
  items: OrderItem[] | string;
  total_amount: number | string;
  status: string;
  created_at?: string;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id') || searchParams.get('orderId');

  const [inputOrderId, setInputOrderId] = useState<string>(urlId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [searchedId, setSearchedId] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  // Fetch single order from PostgreSQL API gracefully
  const fetchOrderDetails = useCallback(async (searchId: string) => {
    if (!searchId) return;
    const cleanId = searchId.trim();
    if (!cleanId) return;

    setLoading(true);
    setNotFound(false);
    setSearchedId(cleanId);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(cleanId)}`);
      
      if (res.status === 404) {
        setOrder(null);
        setNotFound(true);
        return;
      }

      if (!res.ok) {
        // Fallback to query param
        const fallbackRes = await fetch(`/api/orders?orderId=${encodeURIComponent(cleanId)}`);
        if (!fallbackRes.ok) {
          setOrder(null);
          setNotFound(true);
          return;
        }
        const fbData: Order = await fallbackRes.json();
        setOrder(fbData);
        setNotFound(false);
        setLastRefreshed(new Date().toLocaleTimeString());
        return;
      }

      const data: Order = await res.json();
      setOrder(data);
      setNotFound(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      setOrder(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount if an ID was passed in URL query
  useEffect(() => {
    if (urlId) {
      setInputOrderId(urlId);
      fetchOrderDetails(urlId);
    }
  }, [urlId, fetchOrderDetails]);

  // Polling every 5 seconds for live status update if order is active
  useEffect(() => {
    if (!order || order.status === 'Delivered' || order.status === 'Cancelled') return;

    const interval = setInterval(() => {
      const targetId = order.order_id || String(order.id);
      fetchOrderDetails(targetId);
    }, 5000);

    return () => clearInterval(interval);
  }, [order, fetchOrderDetails]);

  const handleTrackSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputOrderId.trim()) {
      fetchOrderDetails(inputOrderId);
    }
  };

  const steps = ['Received', 'Preparing', 'Done', 'Delivered'];

  const getStepIndex = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'received' || s === 'pending') return 0;
    if (s === 'preparing' || s === 'prep') return 1;
    if (s === 'done' || s === 'ready') return 2;
    if (s === 'delivered') return 3;
    return 0;
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  const itemsList: OrderItem[] = order
    ? Array.isArray(order.items)
      ? order.items
      : typeof order.items === 'string'
      ? JSON.parse(order.items)
      : []
    : [];

  const displayOrderId = order?.order_id || (order?.id ? `ORD-${order.id}` : '');

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
            Real-Time Order Tracker
          </span>
          <h1 className="text-3xl font-black text-slate-900">Track Your Food Order</h1>
          <p className="text-slate-500 text-xs">
            Enter your unique Order ID to track preparation (Received → Preparing → Done).
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleTrackSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">🎫</span>
            <input
              type="text"
              required
              value={inputOrderId}
              onChange={(e) => setInputOrderId(e.target.value)}
              placeholder="e.g. ORD-101 or 101"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputOrderId.trim()}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-md text-xs transition"
          >
            {loading ? 'Tracking...' : 'Track Order ⏱️'}
          </button>
        </form>

        {/* Not Found Notice */}
        {notFound && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-2xl text-center space-y-2 text-xs animate-in fade-in duration-150">
            <span className="text-2xl">🔍</span>
            <p className="font-bold text-sm">Order &quot;{searchedId}&quot; was not found</p>
            <p className="text-slate-600">
              Please verify your Order ID or place a new order from our menu.
            </p>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-block bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow hover:bg-orange-700 transition"
              >
                Go to Menu &amp; Order 🍔
              </Link>
            </div>
          </div>
        )}

        {/* Default Idle State */}
        {!order && !notFound && !loading && (
          <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-2xl text-center space-y-2 text-xs text-slate-500">
            <span className="text-3xl block mb-1">🛎️</span>
            <p className="font-bold text-slate-700">Ready to track your food</p>
            <p className="max-w-xs mx-auto">
              Type your Order ID above (e.g. <button type="button" onClick={() => { setInputOrderId('ORD-101'); fetchOrderDetails('ORD-101'); }} className="text-orange-600 font-bold underline">ORD-101</button>) and tap Track Order.
            </p>
          </div>
        )}

        {/* Order Details Display Card */}
        {order && !loading && (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Order Ticket Number
                </span>
                <h2 className="text-2xl font-black text-slate-900">{displayOrderId}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer: <strong>{order.customer_name}</strong>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block text-xs font-black px-3.5 py-1 rounded-full uppercase ${
                    order.status === 'Received' || order.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse'
                      : order.status === 'Preparing'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                      : order.status === 'Done' || order.status === 'Ready'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {order.status}
                </span>
                {lastRefreshed && (
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Live Sync: {lastRefreshed}
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Progress: Received -> Preparing -> Done -> Delivered */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Preparation Progress:
              </p>
              
              <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                {steps.map((stepName, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={stepName}
                      className={`p-2.5 rounded-xl border transition ${
                        isCurrent
                          ? 'bg-orange-600 text-white border-orange-600 shadow-md scale-105 font-black'
                          : isDone
                          ? 'bg-orange-100 text-orange-800 border-orange-200 font-bold'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <span>{idx + 1}. {stepName}</span>
                      {isCurrent && <span className="block text-[8px] mt-0.5">● Current</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <p className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                Order Items Summary:
              </p>
              <div className="space-y-2">
                {itemsList.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-700">
                    <span>{item.name} <strong className="text-slate-900">x{item.qty || 1}</strong></span>
                    <span className="font-semibold text-slate-900">₹{(Number(item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-100 pt-3">
                <span>Total Bill Amount:</span>
                <span className="text-orange-600">₹{Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => fetchOrderDetails(displayOrderId || String(order.id))}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>🔄</span> Refresh Status
              </button>
              <Link
                href="/menu"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs text-center transition"
              >
                Back to Menu
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />
      <Suspense
        fallback={
          <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        }
      >
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
