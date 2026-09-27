'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function MenuPage() {
  const { data: session } = useSession();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Set default customer name from session if available
  useEffect(() => {
    if (session?.user?.name && !customerName) {
      setCustomerName(session.user.name);
    }
  }, [session, customerName]);

  // Fetch menu from API
  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed to load menu items');
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Menu load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Compute Categories dynamically from items
  const categories = ['All', ...Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean)))];

  // Filtered menu items
  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  // Cart Management
  const addToCart = (item) => {
    const isOutOfStock = item.status === 'Out of Stock' || item.sold_out;
    if (isOutOfStock) return;

    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.id === item.id);
      if (existing) {
        return prevCart.map((ci) => (ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci));
      }
      return [...prevCart, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((ci) => {
          if (ci.id === id) {
            const newQty = ci.qty + delta;
            return newQty > 0 ? { ...ci, qty: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.id !== id));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  // Place Order API call (Generates unique orderId on backend)
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const orderPayload = {
        customer_name: customerName.trim() || 'Guest Customer',
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          price: Number(i.price),
          qty: i.qty,
        })),
        total_amount: totalPrice,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to place order');
      }

      const placedOrder = await res.json();
      setCart([]);
      setOrderSuccess(placedOrder);
    } catch (err) {
      alert(`Order placement failed: ${err.message}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar cartCount={totalCartCount} />

      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Digital Dining Menu
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              Browse &amp; Order Dishes
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Select available dishes, customize your quantities, and order instantly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchMenu}
              className="text-xs font-semibold text-slate-600 hover:text-orange-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <span>🔄</span> Refresh Menu
            </button>
            {session?.user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-xs font-bold bg-purple-100 hover:bg-purple-200 text-purple-700 px-3.5 py-2 rounded-xl transition flex items-center gap-1"
              >
                <span>🛡️</span> Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="max-w-7xl mx-auto mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white shadow-orange-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Menu items + Cart Drawer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dishes Column */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white p-5 rounded-3xl border border-slate-200 animate-pulse space-y-4">
                  <div className="h-28 bg-slate-200 rounded-2xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-10 bg-slate-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-3xl text-center space-y-3">
              <span className="text-3xl">⚠️</span>
              <p className="font-bold">Failed to load menu items</p>
              <p className="text-xs text-red-600">{error}</p>
              <button
                onClick={fetchMenu}
                className="bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-700 shadow"
              >
                Retry
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <span className="text-4xl">🍽️</span>
              <h3 className="text-lg font-bold text-slate-800">No dishes found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items in the &quot;{selectedCategory}&quot; category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredItems.map((item) => {
                const isOutOfStock = item.status === 'Out of Stock' || item.sold_out;

                return (
                  <div
                    key={item.id}
                    className={`bg-white p-6 rounded-3xl border transition duration-200 flex flex-col justify-between ${
                      isOutOfStock
                        ? 'border-slate-200 bg-slate-50/80 opacity-75'
                        : 'border-slate-200 hover:border-orange-300 hover:shadow-lg shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Dish Visual Header */}
                      <div className="relative text-5xl mb-4 text-center bg-slate-100 py-7 rounded-2xl select-none">
                        {item.image || '🍽️'}
                        {isOutOfStock ? (
                          <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                            Available
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center gap-2 mb-2">
                        <span className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-lg">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Price</span>
                        <span className="text-xl font-black text-slate-900">₹{Number(item.price).toFixed(2)}</span>
                      </div>

                      {isOutOfStock ? (
                        <button
                          disabled
                          className="bg-slate-200 text-slate-400 font-bold px-4 py-2.5 rounded-xl text-xs cursor-not-allowed"
                        >
                          Out of Stock 🚫
                        </button>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-orange-600/20 transition duration-150 flex items-center gap-1.5"
                        >
                          <span>+</span> Order Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>🛒</span> Your Cart
              </h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <span className="text-4xl text-slate-300">🛍️</span>
                <p className="text-sm font-semibold text-slate-700">Cart is empty</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click &quot;Order Now&quot; on any available dish to begin your order.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex-1 pr-2">
                        <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">₹{Number(item.price).toFixed(2)} each</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 ml-1 p-1"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Name Input */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name / Table Number:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul / Table 4"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Bill Breakdown */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Taxes &amp; Service</span>
                    <span className="text-green-600 font-bold">Free</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Bill:</span>
                    <span className="text-orange-600">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-600/20 text-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {placingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Order to Kitchen...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order Now</span>
                      <span>👨‍🍳</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Order Success Modal with Unique Order ID */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 text-4xl flex items-center justify-center mx-auto shadow-inner">
              🎉
            </div>
            <div>
              <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Order Received by Kitchen!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Order Placed Successfully
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Save your unique Order ID to track preparation progress.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Unique Order ID:</span>
                <span className="font-mono text-base font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                  {orderSuccess.order_id || `ORD-${orderSuccess.id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-800">{orderSuccess.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-bold text-slate-900">₹{Number(orderSuccess.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Live Status:</span>
                <span className="font-bold text-yellow-800 bg-yellow-100 px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                  {orderSuccess.status || 'Received'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={`/track?id=${orderSuccess.order_id || orderSuccess.id}`}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition text-sm flex items-center justify-center gap-2"
              >
                <span>Track Order Live</span>
                <span>⏱️</span>
              </Link>
              <button
                onClick={() => setOrderSuccess(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-2xl transition text-xs"
              >
                Order More Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}