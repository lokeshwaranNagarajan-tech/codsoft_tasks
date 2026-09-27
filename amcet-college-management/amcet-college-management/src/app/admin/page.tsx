'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Building2,
  CreditCard,
  FileCheck2,
  Award,
  ArrowUpRight,
  UserPlus,
  BookOpen,
  CalendarDays,
  FileText,
  Activity,
  Clock,
} from 'lucide-react';
import DeptStudentsChart from '@/components/charts/DeptStudentsChart';
import AttendanceChart from '@/components/charts/AttendanceChart';
import FeeChart from '@/components/charts/FeeChart';
import ExamResultsChart from '@/components/charts/ExamResultsChart';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const deptStrength = data?.deptStrength || [];
  const feeSummary = data?.feeSummary || [];
  const attendanceSummary = data?.attendanceSummary || [];
  const examSummary = data?.examSummary || [];

  const totalPendingFees = feeSummary.reduce((acc: number, curr: any) => acc + (curr.pending || 0), 0);

  const cards = [
    {
      title: 'Total Students',
      value: data?.totalStudents || 0,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    {
      title: 'Total Faculty',
      value: data?.totalFaculty || 0,
      icon: GraduationCap,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Departments',
      value: deptStrength.length || 7,
      icon: Building2,
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-purple-400',
      border: 'border-purple-500/20',
    },
    {
      title: 'Pending Fees',
      value: formatCurrency(totalPendingFees),
      icon: CreditCard,
      color: 'from-amber-600 to-orange-600',
      textColor: 'text-amber-400',
      border: 'border-amber-500/20',
    },
    {
      title: 'Attendance Today',
      value: '94.2%',
      icon: FileCheck2,
      color: 'from-cyan-600 to-blue-600',
      textColor: 'text-cyan-400',
      border: 'border-cyan-500/20',
    },
    {
      title: 'Exams Scheduled',
      value: examSummary.length || 3,
      icon: Award,
      color: 'from-rose-600 to-red-600',
      textColor: 'text-rose-400',
      border: 'border-rose-500/20',
    },
  ];

  const recentActivities = [
    { id: 1, title: 'CIA1 Examination marks published for CSE Dept', time: '20 mins ago', type: 'exam' },
    { id: 2, title: 'Class Advisor allocated for II Year ECE-A', time: '1 hour ago', type: 'advisor' },
    { id: 3, title: 'New Faculty Prof. K. Anand assigned Operating Systems', time: '2 hours ago', type: 'subject' },
    { id: 4, title: 'Tuition Fee Payment recorded for Register No 513223104001', time: '3 hours ago', type: 'fee' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 p-6 rounded-3xl border border-blue-900/40">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AMCET Executive ERP Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Annai Mira College of Engineering and Technology &bull; Live Academic Metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Full Reports</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-slate-900/90 rounded-2xl p-5 border ${card.border} shadow-xl relative overflow-hidden flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xl font-black text-white tracking-tight">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Department Strength */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Department-wise Student Strength</h3>
              <p className="text-[11px] text-slate-400">Total enrolled students per engineering stream</p>
            </div>
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <DeptStudentsChart data={deptStrength} />
        </div>

        {/* Chart 2: Attendance Percentage */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Department Attendance Percentage</h3>
              <p className="text-[11px] text-slate-400">Institutional daily attendance tracking</p>
            </div>
            <FileCheck2 className="w-5 h-5 text-emerald-500" />
          </div>
          <AttendanceChart data={attendanceSummary} />
        </div>

        {/* Chart 3: Fee Collection */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Fee Collection vs Pending Balance</h3>
              <p className="text-[11px] text-slate-400">Financial overview per department</p>
            </div>
            <CreditCard className="w-5 h-5 text-amber-500" />
          </div>
          <FeeChart data={feeSummary} />
        </div>

        {/* Chart 4: Exam Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Exam Results & Pass Rates</h3>
              <p className="text-[11px] text-slate-400">Average marks and pass percentages across internal exams</p>
            </div>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <ExamResultsChart data={examSummary} />
        </div>
      </div>

      {/* Quick Actions & Recent Activities Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-100">Quick Operations</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/students"
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition flex flex-col items-center text-center group"
            >
              <UserPlus className="w-5 h-5 text-blue-400 mb-1 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-slate-200">Add Student</span>
            </Link>

            <Link
              href="/admin/faculty"
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition flex flex-col items-center text-center group"
            >
              <GraduationCap className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-slate-200">Add Faculty</span>
            </Link>

            <Link
              href="/admin/fees"
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl hover:border-amber-500/50 transition flex flex-col items-center text-center group"
            >
              <CreditCard className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-slate-200">Record Fee</span>
            </Link>

            <Link
              href="/admin/timetable"
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl hover:border-purple-500/50 transition flex flex-col items-center text-center group"
            >
              <Clock className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-slate-200">Timetable</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-100">Recent ERP Activity</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Realtime updates</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-slate-300">{act.title}</span>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}