'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AdminPanelPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  // Active Admin Tab: 'orders' | 'menu' | 'overview'
  const [activeTab, setActiveTab] = useState('orders');

  // Menu State
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingDish, setSubmittingDish] = useState(false);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Fast Food',
    price: '',
    status: 'Available',
    image: '🍔',
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [autoRefreshOrders, setAutoRefreshOrders] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Transient Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const emojiOptions = ['🍔', '🍕', '🍝', '🍢', '🧋', '🍰', '🍚', '🍹', '🌮', '🥗', '☕', '🍲', '🍨', '🍗'];

  // 1. Fetch Menu Items from PostgreSQL API
  const fetchMenu = useCallback(async () => {
    try {
      setMenuLoading(true);
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed to load menu');
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Admin menu fetch error:', err.message);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  // 2. Fetch Live Orders from PostgreSQL API
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to load live orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Admin orders fetch error:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (isAdmin) {
      fetchMenu();
      fetchOrders();
    }
  }, [isAdmin, fetchMenu, fetchOrders]);

  // Live polling for orders when tab is active
  useEffect(() => {
    if (!isAdmin || !autoRefreshOrders) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAdmin, autoRefreshOrders, fetchOrders]);

  // Handle Add New Dish
  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!dishForm.name.trim() || !dishForm.price) {
      alert('Please provide a dish name and price');
      return;
    }

    setSubmittingDish(true);
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dishForm.name.trim(),
          category: dishForm.category,
          price: parseFloat(dishForm.price),
          status: dishForm.status,
          image: dishForm.image,
        }),
      });

      if (!res.ok) throw new Error('Failed to add dish');
      const newDish = await res.json();
      setMenuItems((prev) => [...prev, newDish]);
      setShowAddModal(false);
      setDishForm({ name: '', category: 'Fast Food', price: '', status: 'Available', image: '🍔' });
      showToast(`"${newDish.name}" added to menu!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingDish(false);
    }
  };

  // Toggle Dish Status ('Available' vs 'Out of Stock')
  const handleToggleDishStatus = async (item) => {
    const nextStatus = item.status === 'Available' ? 'Out of Stock' : 'Available';

    // Optimistic update
    setMenuItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus, sold_out: nextStatus === 'Out of Stock' } : i))
    );

    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to update dish status');
      showToast(
        `"${item.name}" is now marked as ${nextStatus === 'Available' ? 'AVAILABLE (Order Now) ✅' : 'OUT OF STOCK 🚫'}`,
        nextStatus === 'Available' ? 'success' : 'warning'
      );
    } catch (err) {
      alert(err.message);
      fetchMenu();
    }
  };

  // Delete Dish
  const handleDeleteDish = async (id, name) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the database?`)) return;

    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete dish');
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      showToast(`"${name}" removed from menu.`, 'error');
    } catch (err) {
      alert(err.message);
    }
  };

  // Update Order Status ('Preparing' | 'Done' | 'Delivered')
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.order_id === orderId || o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update order status');
      showToast(`Order #${orderId} marked as ${newStatus}!`);
      await fetchOrders();
    } catch (err) {
      alert(err.message);
      await fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Auth loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Not Admin Protection Card
  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-auto px-4 py-12 text-center">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-purple-100 text-purple-700 text-3xl rounded-full flex items-center justify-center mx-auto">
              🛡️
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Admin Control Panel</h2>
              <p className="text-slate-500 text-xs mt-2">
                This portal is reserved for administrators to manage menu availability and live kitchen orders.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn('google', { callbackUrl: '/admin' })}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2"
              >
                <span>Sign In with Admin Google Account</span>
              </button>
              <Link
                href="/login"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-2xl transition text-xs"
              >
                View Sign-In Options
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      <Navbar />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'error'
              ? 'bg-red-900 text-red-100 border border-red-700'
              : toast.type === 'warning'
              ? 'bg-amber-900 text-amber-100 border border-amber-700'
              : 'bg-slate-900 text-white border border-slate-700'
          }`}
        >
          <span>{toast.type === 'error' ? '🗑️' : toast.type === 'warning' ? '🚫' : '✨'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-purple-500/30">
                Staff &amp; Manager Portal
              </span>
              <span className="text-xs text-slate-400">PostgreSQL Backend Sync</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-1 flex items-center gap-2">
              <span>🛡️</span> DineDesk Admin Panel
            </h1>
          </div>

          {/* Tab Switcher Buttons */}
          <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>👨‍🍳 Live Kitchen Orders</span>
              <span className="bg-slate-900/60 px-2 py-0.5 rounded-full text-[10px]">
                {orders.filter((o) => o.status === 'Received' || o.status === 'Preparing').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'menu'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>🍔 Menu Management</span>
              <span className="bg-slate-900/60 px-2 py-0.5 rounded-full text-[10px]">
                {menuItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              📊 Stats
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: LIVE ORDERS / KITCHEN VIEW */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>👨‍🍳</span> Live Kitchen Queue
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click <strong>&quot;Preparing&quot;</strong> when cooking starts, and <strong>&quot;Done&quot;</strong> when food is ready.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoRefreshOrders(!autoRefreshOrders)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                    autoRefreshOrders
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {autoRefreshOrders ? '🟢 5s Live Polling ON' : '⏸️ Polling Paused'}
                </button>
                <button
                  onClick={fetchOrders}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <p className="text-xs font-semibold">Loading orders from PostgreSQL...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <span className="text-4xl">🛎️</span>
                <p className="text-sm font-bold text-slate-700">No active kitchen orders right now.</p>
                <Link
                  href="/menu"
                  className="inline-block bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow"
                >
                  Go to Menu to Place a Test Order
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((ord) => {
                  const itemsList = Array.isArray(ord.items)
                    ? ord.items
                    : typeof ord.items === 'string'
                    ? JSON.parse(ord.items)
                    : [];

                  const displayOrderId = ord.order_id || `ORD-${ord.id}`;
                  const isUpdating = updatingOrderId === displayOrderId || updatingOrderId === ord.id;

                  return (
                    <div
                      key={ord.id}
                      className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition duration-200 ${
                        ord.status === 'Received'
                          ? 'border-yellow-400 bg-yellow-50/20'
                          : ord.status === 'Preparing'
                          ? 'border-blue-400 bg-blue-50/20'
                          : ord.status === 'Done'
                          ? 'border-emerald-400 bg-emerald-50/20'
                          : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <div>
                        {/* Order Card Header */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-orange-600 uppercase">
                              Order Ticket
                            </span>
                            <h3 className="text-2xl font-black text-slate-900">{displayOrderId}</h3>
                          </div>
                          <span
                            className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                              ord.status === 'Received'
                                ? 'bg-yellow-100 text-yellow-800 animate-pulse'
                                : ord.status === 'Preparing'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'Done'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>

                        {/* Customer & Time */}
                        <div className="flex justify-between text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span>
                            Customer: <strong className="text-slate-800">{ord.customer_name}</strong>
                          </span>
                          <span>
                            {ord.created_at
                              ? new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Recent'}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-2 mb-6">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Dishes to prepare:
                          </p>
                          <ul className="space-y-1.5">
                            {itemsList.map((item, idx) => (
                              <li
                                key={idx}
                                className="flex justify-between items-center text-xs font-semibold text-slate-800 bg-slate-50 p-2 rounded-xl"
                              >
                                <span>{item.name}</span>
                                <span className="bg-orange-100 text-orange-700 font-mono font-black px-2 py-0.5 rounded-md">
                                  x{item.qty || 1}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Status Action Buttons for Kitchen Staff */}
                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Total:</span>
                          <span className="font-black text-slate-900 text-sm">
                            ₹{Number(ord.total_amount).toFixed(2)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(displayOrderId, 'Preparing')}
                            disabled={isUpdating}
                            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                              ord.status === 'Preparing'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            <span>👨‍🍳</span> Preparing
                          </button>

                          <button
                            onClick={() => handleUpdateOrderStatus(displayOrderId, 'Done')}
                            disabled={isUpdating}
                            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                              ord.status === 'Done'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            <span>🚀</span> Done
                          </button>

                          <button
                            onClick={() => handleUpdateOrderStatus(displayOrderId, 'Delivered')}
                            disabled={isUpdating}
                            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                              ord.status === 'Delivered'
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span>✓</span> Delivered
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>🍔</span> Restaurant Menu Items
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toggle dishes between <strong>Order Now (Available)</strong> and <strong>Out of Stock</strong> in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchMenu}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <span>+</span> Add New Dish
                </button>
              </div>
            </div>

            {menuLoading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <p className="text-xs font-semibold">Loading menu items from PostgreSQL...</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <span className="text-4xl">🍽️</span>
                <p className="text-sm font-bold text-slate-700">No dishes found in database</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Add Your First Dish
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase font-extrabold tracking-wider border-b border-slate-200">
                      <th className="py-3.5 px-6">Dish Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Availability Switch</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {menuItems.map((dish) => {
                      const isAvailable = dish.status === 'Available' || dish.status === 'Available/Order Now';

                      return (
                        <tr key={dish.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl bg-slate-100 p-2 rounded-2xl border border-slate-200">
                                {dish.image || '🍽️'}
                              </span>
                              <div>
                                <span className="block font-black text-base">{dish.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">ID #{dish.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                              {dish.category}
                            </span>
                          </td>

                          <td className="py-4 px-4 font-black text-slate-900">
                            ₹{Number(dish.price).toFixed(2)}
                          </td>

                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleToggleDishStatus(dish)}
                              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition shadow-sm ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                              }`}
                            >
                              <span>{isAvailable ? '✅ Order Now' : '🚫 Out of Stock'}</span>
                              <span className="text-[10px] opacity-75 underline">Toggle</span>
                            </button>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleDeleteDish(dish.id, dish.name)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
                            >
                              Remove 🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OVERVIEW & STATS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 text-2xl flex items-center justify-center">
                🍔
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Total Dishes</p>
                <p className="text-2xl font-black text-slate-900">{menuItems.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 text-2xl flex items-center justify-center">
                ✅
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Available / Order Now</p>
                <p className="text-2xl font-black text-slate-900">
                  {menuItems.filter((i) => i.status === 'Available' || !i.sold_out).length}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 text-2xl flex items-center justify-center">
                🚫
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Out of Stock</p>
                <p className="text-2xl font-black text-slate-900">
                  {menuItems.filter((i) => i.status === 'Out of Stock' || i.sold_out).length}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 text-2xl flex items-center justify-center">
                🛍️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Live Orders</p>
                <p className="text-2xl font-black text-slate-900">{orders.length}</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add New Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Add New Dish</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Garlic Butter Naan"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Fast Food">Fast Food</option>
                    <option value="Italian">Italian</option>
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="199.00"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={dishForm.status}
                  onChange={(e) => setDishForm({ ...dishForm, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Available">Available (Order Now)</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Emoji Icon</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {emojiOptions.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setDishForm({ ...dishForm, image: e })}
                      className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center transition ${
                        dishForm.image === e ? 'bg-orange-600 text-white shadow' : 'bg-white hover:bg-slate-200'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDish}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {submittingDish ? 'Saving...' : 'Save to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}