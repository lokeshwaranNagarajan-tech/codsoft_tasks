'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-4xl shadow-inner">
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name} className="w-full h-full rounded-full object-cover" />
            ) : '👤'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Signed In Successfully</h2>
            <p className="text-slate-500 text-sm mt-1">{session.user.email}</p>
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
              session.user.role === 'admin' 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              {session.user.role === 'admin' ? '🛡️ Administrator Access' : '🍽️ Customer Account'}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {session.user.role === 'admin' ? (
              <Link
                href="/admin"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-2xl shadow-lg transition text-center"
              >
                Go to Admin Dashboard ⚙️
              </Link>
            ) : (
              <Link
                href="/menu"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-2xl shadow-lg transition text-center"
              >
                Explore Menu & Order 🍔
              </Link>
            )}
            <Link
              href="/"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-2xl transition text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role) => {
    setLoading(true);
    const email = role === 'admin' ? 'lokeshwaranlokeshwaran2006@gmail.com' : 'customer@dinedesk.com';
    const name = role === 'admin' ? 'Lokeshwaran (Admin)' : 'Valued Customer';
    await signIn('credentials', {
      email,
      name,
      role,
      callbackUrl: role === 'admin' ? '/admin' : '/menu',
    });
  };

  const handleCustomEmailSignIn = async (e) => {
    e.preventDefault();
    if (!customEmail) return;
    setLoading(true);
    await signIn('credentials', {
      email: customEmail,
      name: customEmail.split('@')[0],
      callbackUrl: '/',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block text-3xl font-black text-orange-600 tracking-tight">
            DineDesk 🍽️
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to your account</h2>
          <p className="text-slate-500 text-xs">
            One-tap authentication for customers and restaurant managers
          </p>
        </div>

        {/* Primary Google Login */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold py-3.5 px-4 rounded-2xl shadow-sm hover:shadow-md transition duration-200 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs uppercase font-bold text-slate-400">
            Or Quick Access
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Instant Role Testing Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDemoSignIn('admin')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl transition group text-center"
          >
            <span className="text-xl mb-1">🛡️</span>
            <span className="text-xs font-bold text-purple-900 group-hover:text-purple-950">
              Admin Login
            </span>
            <span className="text-[10px] text-purple-600">Designated Email</span>
          </button>

          <button
            onClick={() => handleDemoSignIn('customer')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-2xl transition group text-center"
          >
            <span className="text-xl mb-1">🍽️</span>
            <span className="text-xs font-bold text-orange-900 group-hover:text-orange-950">
              Customer Login
            </span>
            <span className="text-[10px] text-orange-600">Standard User</span>
          </button>
        </div>

        {/* Custom Email Entry */}
        <form onSubmit={handleCustomEmailSignIn} className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-600">
            Sign in with specific email:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="e.g. your-email@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={loading || !customEmail}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition"
            >
              Sign In
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Tip: Emails matching <span className="font-mono text-orange-600">lokeshwaranlokeshwaran2006@gmail.com</span> receive Admin roles automatically.
          </p>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-orange-600 transition">
            ← Return to DineDesk Home
          </Link>
        </div>
      </div>
    </div>
  );
}
