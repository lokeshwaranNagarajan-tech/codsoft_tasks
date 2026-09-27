'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Calendar, Shield, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  collegeId: z.string().min(1, 'College ID Card Number is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      collegeId: '',
      dob: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome, ${json.user.name}!`);
      router.push(json.redirectUrl);
      router.refresh();
    } catch {
      toast.error('Network error during authentication.');
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (id: string, dob: string) => {
    const idInput = document.getElementById('collegeId') as HTMLInputElement;
    const dobInput = document.getElementById('dob') as HTMLInputElement;
    if (idInput && dobInput) {
      idInput.value = id;
      dobInput.value = dob;
      idInput.dispatchEvent(new Event('input', { bubbles: true }));
      dobInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl z-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-3xl text-white mx-auto shadow-xl shadow-blue-600/30 ring-4 ring-blue-500/20 mb-4">
            A
          </div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight">AMCET ERP Portal</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Annai Mira College of Engineering and Technology
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* College ID Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              College ID Card Number
            </label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="collegeId"
                type="text"
                placeholder="e.g. ADMIN001, FAC001, AMCET23CSE001"
                {...register('collegeId')}
                className="w-full bg-slate-950 text-xs text-slate-100 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-600"
              />
            </div>
            {errors.collegeId && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.collegeId.message}</p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Date of Birth (DOB)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="dob"
                type="date"
                {...register('dob')}
                className="w-full bg-slate-950 text-xs text-slate-100 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            {errors.dob && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.dob.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Box */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setDemoCredentials('ADMIN001', '1990-01-01')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-left hover:border-blue-500/50 transition group"
            >
              <div className="font-bold text-slate-200 group-hover:text-blue-400">Primary Admin</div>
              <div className="text-[10px] text-slate-500">ADMIN001 | 1990-01-01</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('ADMIN002', '1992-05-20')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-left hover:border-blue-500/50 transition group"
            >
              <div className="font-bold text-slate-200 group-hover:text-blue-400">Academic Admin</div>
              <div className="text-[10px] text-slate-500">ADMIN002 | 1992-05-20</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('FAC001', '1988-08-15')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-left hover:border-blue-500/50 transition group"
            >
              <div className="font-bold text-slate-200 group-hover:text-blue-400">Faculty</div>
              <div className="text-[10px] text-slate-500">FAC001 | 1988-08-15</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('AMCET23CSE001', '2005-06-10')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-left hover:border-blue-500/50 transition group"
            >
              <div className="font-bold text-slate-200 group-hover:text-blue-400">Student</div>
              <div className="text-[10px] text-slate-500">AMCET23CSE001 | 2005-06-10</div>
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-500 font-medium">
        &copy; {new Date().getFullYear()} Annai Mira College of Engineering and Technology. All rights reserved.
      </footer>
    </div>
  );
}