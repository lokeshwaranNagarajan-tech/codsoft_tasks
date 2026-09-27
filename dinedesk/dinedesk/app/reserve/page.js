'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ReservePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '2',
    date: '',
    time: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservationResult, setReservationResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.date || !formData.time) {
      alert('Please fill in all required fields (Name, Phone, Date, Time)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim(),
          guests: parseInt(formData.guests, 10),
          date: formData.date,
          time: formData.time,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Reservation failed');
      }

      const booked = await res.json();
      setReservationResult(booked);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
            Table Reservations
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Book Your Table in Advance
          </h1>
          <p className="text-slate-500 text-sm">
            Skip the waiting line. Guarantee your table for family dining, business lunches, or date nights.
          </p>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          
          {reservationResult ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-8 rounded-3xl text-center space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 text-3xl rounded-full flex items-center justify-center mx-auto shadow-inner">
                🥂
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                  Reservation Confirmed!
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Table Booked Successfully
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  We look forward to hosting you at DineDesk.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 text-left text-xs space-y-2.5 shadow-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Booking ID:</span>
                  <span className="font-mono font-bold text-orange-600">#{reservationResult.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guest Name:</span>
                  <span className="font-bold text-slate-900">{reservationResult.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800">{reservationResult.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Party Size:</span>
                  <span className="font-bold text-orange-600">{reservationResult.guests} Guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-bold text-slate-900">
                    {reservationResult.date} at {reservationResult.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {reservationResult.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/menu"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition text-sm"
                >
                  Explore Menu & Pre-Order Dishes 🍔
                </Link>
                <button
                  onClick={() => {
                    setReservationResult(null);
                    setFormData({ name: '', email: '', phone: '', guests: '2', date: '', time: '' });
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-2xl transition text-xs"
                >
                  Book Another Table
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
                Reservation Details
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Guests</label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="6">6 Guests</option>
                    <option value="8">8+ Party</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-600/20 text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Confirming Table...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Table Reservation</span>
                    <span>🥂</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}