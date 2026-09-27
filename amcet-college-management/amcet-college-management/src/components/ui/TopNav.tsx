'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, LogOut, User as UserIcon, Menu, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface TopNavProps {
  user: {
    collegeId: string;
    name: string;
    role: string;
  };
  onMenuToggle?: () => void;
}

export default function TopNav({ user, onMenuToggle }: TopNavProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Academic Calendar Updated', time: '10m ago' },
    { id: 2, title: 'CIA1 Marks Submission Open', time: '1h ago' },
    { id: 3, title: 'Attendance Report Ready', time: '3h ago' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 flex items-center justify-between">
      {/* Left section: Mobile menu + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, faculty, subjects, register numbers..."
            className="w-full bg-slate-950/80 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Right section: Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 relative transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Notifications</span>
                <span className="text-[10px] text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full font-medium">
                  {notifications.length} New
                </span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-800/50 transition cursor-pointer">
                    <p className="text-xs text-slate-200 font-medium">{n.title}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800 transition text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white uppercase ring-2 ring-blue-500/30">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">{user?.collegeId}</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-200">{user?.name}</p>
                <p className="text-[10px] text-slate-400">{user?.collegeId}</p>
                <span className="mt-1 inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/50 uppercase">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
