'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  UserCheck,
  CalendarDays,
  FileCheck2,
  Award,
  CreditCard,
  Clock,
  ShieldCheck,
  BarChart3,
  X,
} from 'lucide-react';

interface SidebarProps {
  role: 'PRIMARY_ADMIN' | 'SECONDARY_ADMIN' | 'FACULTY' | 'STUDENT';
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/faculty', label: 'Faculty', icon: GraduationCap },
    { href: '/admin/departments', label: 'Departments', icon: Building2 },
    { href: '/admin/subjects', label: 'Subjects', icon: BookOpen },
    { href: '/admin/hod', label: 'HOD Allocation', icon: UserCheck },
    { href: '/admin/advisors', label: 'Class Advisors', icon: CalendarDays },
    { href: '/admin/attendance', label: 'Attendance', icon: FileCheck2 },
    { href: '/admin/exams', label: 'Exams & Marks', icon: Award },
    { href: '/admin/fees', label: 'Fee Management', icon: CreditCard },
    { href: '/admin/timetable', label: 'Master Timetable', icon: Clock },
    { href: '/admin/reports', label: 'Analytics Reports', icon: BarChart3 },
  ];

  if (role === 'PRIMARY_ADMIN') {
    adminLinks.push({ href: '/admin/admins', label: 'Admins Management', icon: ShieldCheck });
  }

  const facultyLinks = [
    { href: '/faculty', label: 'Overview', icon: LayoutDashboard },
    { href: '/faculty/attendance', label: 'Mark Attendance', icon: FileCheck2 },
    { href: '/faculty/marks', label: 'Enter Marks', icon: Award },
    { href: '/faculty/subjects', label: 'Assigned Subjects', icon: BookOpen },
  ];

  const studentLinks = [
    { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/attendance', label: 'My Attendance', icon: FileCheck2 },
    { href: '/student/marks', label: 'Marks & GPA', icon: Award },
    { href: '/student/fees', label: 'Fee Receipt', icon: CreditCard },
    { href: '/student/timetable', label: 'Class Timetable', icon: Clock },
  ];

  const links =
    role === 'PRIMARY_ADMIN' || role === 'SECONDARY_ADMIN'
      ? adminLinks
      : role === 'FACULTY'
      ? facultyLinks
      : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding Header */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between bg-blue-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-white">AMCET ERP</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">Annai Mira College</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Role Tag */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            {role.replace('_', ' ')} PORTAL
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 font-medium">AMCET College Management v2.0</p>
        </div>
      </aside>
    </>
  );
}
