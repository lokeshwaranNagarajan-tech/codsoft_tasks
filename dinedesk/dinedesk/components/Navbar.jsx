'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar({ cartCount = 0 }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  const navLinks = [
    { href: '/menu', label: 'Menu' },
    { href: '/reserve', label: 'Reserve Table' },
    { href: '/track', label: 'Track Order' },
    { href: '/kitchen', label: 'Kitchen View' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl transform group-hover:scale-110 transition duration-200">🍽️</span>
            <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition">
              Dine<span className="text-orange-600">Desk</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Admin Link if role === 'admin' */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                <span>🛡️</span> Admin Panel
              </Link>
            )}
          </div>

          {/* Right Action Area: Cart & Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {cartCount > 0 && (
              <Link
                href="/menu"
                className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm"
              >
                <span>🛒 Cart</span>
                <span className="bg-orange-600 text-white rounded-full px-2 py-0.5 text-[10px]">
                  {cartCount}
                </span>
              </Link>
            )}

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
            ) : session?.user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs overflow-hidden border border-orange-200">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                    ) : (
                      (session.user.name || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                      {session.user.name || session.user.email}
                    </p>
                    <span className={`text-[10px] font-semibold leading-tight ${isAdmin ? 'text-purple-600' : 'text-slate-500'}`}>
                      {isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                  title="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {cartCount > 0 && (
              <Link
                href="/menu"
                className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold"
              >
                🛒 {cartCount}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-purple-700 bg-purple-50"
            >
              🛡️ Admin Panel
            </Link>
          )}
          <div className="pt-3 border-t border-slate-100">
            {session?.user ? (
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">{session.user.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs font-bold text-red-600 px-3 py-1.5 rounded-lg bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
