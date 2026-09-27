'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AdminMenuPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Add Dish Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Fast Food',
    price: '',
    status: 'Available',
    image: '🍔',
  });

  const emojiOptions = ['🍔', '🍕', '🍝', '🍢', '🧋', '🍰', '🍚', '🍹', '🌮', '🥗', '☕', '🍲', '🍨', '🍗'];

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Menu from PostgreSQL API
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed to load menu');
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Admin menu fetch error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchMenu();
    }
  }, [isAdmin, fetchMenu]);

  // Add Dish handler
  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert('Please provide a valid dish name and price');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          price: parseFloat(formData.price),
          status: formData.status,
          image: formData.image,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add dish');
      }

      const newDish = await res.json();
      setMenuItems((prev) => [...prev, newDish]);
      setShowAddModal(false);
      setFormData({ name: '', category: 'Fast Food', price: '', status: 'Available', image: '🍔' });
      showNotification(`"${newDish.name}" added to menu successfully!`);
    } catch (err) {
      alert(`Error adding dish: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Dish Status ('Available' vs 'Out of Stock')
  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Available' ? 'Out of Stock' : 'Available';

    // Optimistic UI update
    setMenuItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus, sold_out: nextStatus === 'Out of Stock' } : i))
    );

    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        fetchMenu();
        throw new Error('Failed to update status');
      }

      showNotification(
        `"${item.name}" is now ${nextStatus === 'Available' ? 'AVAILABLE (Order Now) ✅' : 'OUT OF STOCK 🚫'}`,
        nextStatus === 'Available' ? 'success' : 'warning'
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Dish handler
  const handleDeleteDish = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the database?`)) return;

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete dish');
      }

      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      showNotification(`"${name}" deleted from database.`, 'error');
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // If Auth loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // If Not Admin Access Protection
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
              <h2 className="text-2xl font-black text-slate-900">Admin Access Required</h2>
              <p className="text-slate-500 text-xs mt-2">
                This page is restricted to the administrator account (
                <span className="font-mono text-orange-600">
                  {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'lokeshwaranlokeshwaran2006@gmail.com'}
                </span>
                ).
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn('google', { callbackUrl: '/admin/menu' })}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2"
              >
                <span>Sign In with Admin Google Account</span>
              </button>
              <Link
                href="/login"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-2xl transition text-xs"
              >
                Go to Login Options
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
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

      {/* Page Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-purple-500/30">
                Admin Control Room
              </span>
              <span className="text-xs text-slate-400">Menu Status &amp; Dish Management</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-1">Manage Restaurant Menu</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
            >
              ← Back to Admin Panel
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <span>+</span> Add New Dish
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Dishes in Database ({menuItems.length})
              </h2>
              <p className="text-slate-500 text-xs">
                Toggle availability between <strong>Order Now</strong> and <strong>Out of Stock</strong>.
              </p>
            </div>
            <button
              onClick={fetchMenu}
              className="text-xs font-semibold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm transition"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
              <p className="text-xs font-medium">Fetching items from PostgreSQL...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 text-red-700 space-y-2">
              <p className="font-bold text-sm">Database fetch error: {error}</p>
              <button
                onClick={fetchMenu}
                className="mt-2 bg-red-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <span className="text-4xl">🍽️</span>
              <p className="text-sm font-bold text-slate-700">No dishes present in database</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow"
              >
                Add Your First Dish
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 text-xs uppercase font-extrabold tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-6">Dish Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price (₹)</th>
                    <th className="py-3.5 px-4">Status / Switch</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {menuItems.map((item) => {
                    const isAvailable = item.status === 'Available' || item.status === 'Available/Order Now';

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition ${
                          !isAvailable ? 'bg-slate-50/50' : ''
                        }`}
                      >
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-slate-100 p-2 rounded-xl border border-slate-200">
                              {item.image || '🍽️'}
                            </span>
                            <div>
                              <span className="block font-black">{item.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">ID #{item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-black text-slate-900">
                          ₹{Number(item.price).toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition shadow-sm ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                            }`}
                          >
                            <span>{isAvailable ? '✅ Order Now' : '🚫 Out of Stock'}</span>
                            <span className="text-[10px] underline ml-1">Toggle</span>
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteDish(item.id, item.name)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
                          >
                            Delete 🗑️
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
                  placeholder="e.g. Paneer Butter Masala"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Available">Available (Order Now)</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Icon Emoji</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {emojiOptions.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: e })}
                      className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center transition ${
                        formData.image === e ? 'bg-orange-600 text-white shadow' : 'bg-white hover:bg-slate-200'
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
                  disabled={submitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Saving...' : 'Save to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
