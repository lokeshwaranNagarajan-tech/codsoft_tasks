'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-100/80 border border-orange-200 text-orange-700 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
              Next-Gen Restaurant Platform & Dining Engine
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
              Savor Exceptional Food,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                Ordered in Seconds.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
              Explore our dynamic digital menu, reserve your favorite table in advance, 
              track preparation progress in real-time, and manage kitchen queues seamlessly.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition duration-200 text-base group"
              >
                <span>Explore Digital Menu</span>
                <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
              <Link
                href="/reserve"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 font-bold px-8 py-4 rounded-2xl border border-slate-300 shadow-sm transition duration-200 text-base"
              >
                <span>Book a Table</span>
                <span>📅</span>
              </Link>
            </div>

            {/* Admin Banner if Admin is logged in */}
            {isAdmin && (
              <div className="mt-8 inline-block bg-purple-50 border border-purple-200 rounded-2xl px-6 py-3">
                <p className="text-xs sm:text-sm font-semibold text-purple-900">
                    🛡️ Logged in as Administrator (<span className="font-mono">{session?.user?.email}</span>).{' '}
                  <Link href="/admin/menu" className="text-purple-700 underline font-bold hover:text-purple-950">
                    Manage Menu & Dishes →
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">
              Everything in One Place
            </h2>
            <p className="text-3xl font-extrabold text-slate-900">
              Crafted for Customers, Built for Kitchens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1: Digital Menu */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition">
                🍔
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Digital Menu & Cart</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                PostgreSQL-backed menu items categorized with live stock alerts and one-tap checkout.
              </p>
              <Link href="/menu" className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1">
                Browse Dishes →
              </Link>
            </div>

            {/* Feature 2: Table Reservations */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition">
                🥂
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Table Booking</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Reserve tables effortlessly with instant confirmation stored safely in our database.
              </p>
              <Link href="/reserve" className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1">
                Book a Spot →
              </Link>
            </div>

            {/* Feature 3: Live Order Tracking */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition">
                ⏱️
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Live Order Tracking</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Check whether your food is Pending, in the Kitchen, or Ready for pickup with your Order ID.
              </p>
              <Link href="/track" className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                Track Food →
              </Link>
            </div>

            {/* Feature 4: Kitchen Dashboard */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition">
                👨‍🍳
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Kitchen Dashboard</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Real-time queue for chefs and kitchen staff to mark status updates seamlessly.
              </p>
              <Link href="/kitchen" className="text-xs font-bold text-slate-900 hover:text-orange-600 inline-flex items-center gap-1">
                Open Kitchen View →
              </Link>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍽️</span>
            <span className="font-bold text-slate-800">DineDesk Platform</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/menu" className="hover:text-orange-600">Menu</Link>
            <Link href="/reserve" className="hover:text-orange-600">Reservations</Link>
            <Link href="/track" className="hover:text-orange-600">Tracking</Link>
            <Link href="/admin" className="hover:text-orange-600">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}