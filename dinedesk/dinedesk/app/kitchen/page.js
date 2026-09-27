'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Active'); // Active, Received, Preparing, Done, Delivered, All
  const [updatingId, setUpdatingId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Fetch orders from PostgreSQL API
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch kitchen orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Kitchen orders fetch error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and 5-second polling interval for real-time kitchen queue
  useEffect(() => {
    fetchOrders();

    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders, autoRefresh]);

  // Update Status handler ('Preparing' | 'Done' | 'Delivered' | 'Received')
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.order_id === orderId || o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // Fallback to general route
        await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: newStatus }),
        });
      }

      await fetchOrders();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
      await fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders according to active status tab
  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'Active') {
      return order.status === 'Received' || order.status === 'Preparing' || order.status === 'Pending';
    }
    if (filterStatus === 'All') return true;
    return order.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Navbar />

      {/* Dark Kitchen Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-orange-500/30">
                Live Kitchen Display System (KDS)
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`}></span>
                {autoRefresh ? 'Live Polling Active (5s)' : 'Polling Paused'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <span>👨‍🍳</span> Kitchen Order Queue
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition ${
                autoRefresh
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {autoRefresh ? '🟢 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
            </button>

            <button
              onClick={fetchOrders}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>🔄</span> Refresh Now
            </button>
          </div>
        </div>

        {/* Filter Status Tabs */}
        <div className="max-w-7xl mx-auto mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-800/80">
          {['Active', 'Received', 'Preparing', 'Done', 'Delivered', 'All'].map((st) => {
            const count = orders.filter((o) =>
              st === 'Active'
                ? o.status === 'Received' || o.status === 'Preparing' || o.status === 'Pending'
                : st === 'All'
                ? true
                : o.status === st
            ).length;

            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  filterStatus === st
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{st}</span>
                <span className="bg-slate-900/60 px-2 py-0.5 rounded-full text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kitchen Queue Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-xs font-semibold">Connecting to Kitchen Queue Database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-800 text-red-300 p-8 rounded-3xl text-center space-y-3">
            <span className="text-3xl">⚠️</span>
            <p className="font-bold">Failed to load kitchen queue</p>
            <p className="text-xs">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-700"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-slate-900/60 p-16 rounded-3xl border border-slate-800 text-center space-y-3 max-w-lg mx-auto">
            <span className="text-5xl">🛎️</span>
            <h3 className="text-xl font-bold text-slate-200">No {filterStatus} Orders</h3>
            <p className="text-xs text-slate-400">
              The kitchen queue is currently clear for this category. New customer orders will pop up here live!
            </p>
            <Link
              href="/menu"
              className="inline-block bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow mt-2 hover:bg-orange-500"
            >
              Go to Menu to Place Test Order
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const itemsList = Array.isArray(order.items)
                ? order.items
                : typeof order.items === 'string'
                ? JSON.parse(order.items)
                : [];

              const displayOrderId = order.order_id || `ORD-${order.id}`;
              const isUpdating = updatingId === displayOrderId || updatingId === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between shadow-xl transition duration-200 ${
                    order.status === 'Received' || order.status === 'Pending'
                      ? 'border-yellow-500/50 shadow-yellow-500/5'
                      : order.status === 'Preparing'
                      ? 'border-blue-500/50 shadow-blue-500/5'
                      : order.status === 'Done' || order.status === 'Ready'
                      ? 'border-emerald-500/50 shadow-emerald-500/5'
                      : 'border-slate-800 opacity-60'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-orange-400 tracking-wider uppercase">
                          Order Ticket
                        </span>
                        <h3 className="text-2xl font-black text-white">{displayOrderId}</h3>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                            order.status === 'Received' || order.status === 'Pending'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse'
                              : order.status === 'Preparing'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                              : order.status === 'Done' || order.status === 'Ready'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-1 font-medium">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Just now'}
                        </span>
                      </div>
                    </div>

                    {/* Customer Tag */}
                    <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 mb-4 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Customer:</span>
                      <span className="font-bold text-orange-300 truncate max-w-[150px]">
                        {order.customer_name || 'Guest'}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Dishes to Prepare:
                      </p>
                      <ul className="space-y-1.5">
                        {itemsList.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl text-xs font-semibold text-slate-200 border border-slate-800"
                          >
                            <span>{item.name}</span>
                            <span className="bg-orange-600/30 border border-orange-500/40 text-orange-400 px-2 py-0.5 rounded-lg text-xs font-mono font-black">
                              x{item.qty || 1}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Total & Action Buttons: Click 'Preparing' and 'Done' */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Ticket Value:</span>
                      <span className="font-black text-white text-sm">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Click 'Preparing' */}
                      <button
                        onClick={() => handleUpdateStatus(displayOrderId, 'Preparing')}
                        disabled={isUpdating}
                        className={`py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                          order.status === 'Preparing'
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                            : 'bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30'
                        }`}
                      >
                        <span>👨‍🍳</span>
                        <span>Preparing</span>
                      </button>

                      {/* Click 'Done' */}
                      <button
                        onClick={() => handleUpdateStatus(displayOrderId, 'Done')}
                        disabled={isUpdating}
                        className={`py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                          order.status === 'Done'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                            : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30'
                        }`}
                      >
                        <span>🚀</span>
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}