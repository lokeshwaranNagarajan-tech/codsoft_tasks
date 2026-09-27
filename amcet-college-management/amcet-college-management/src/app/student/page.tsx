'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCheck, FileCheck2, Award, CreditCard, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [gpaSummary, setGpaSummary] = useState<any>(null);
  const [feeSummary, setFeeSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          const studentId = data.user.student?.id;

          if (studentId) {
            Promise.all([
              fetch(`/api/attendance?studentId=${studentId}`).then((r) => r.json()),
              fetch(`/api/marks?studentId=${studentId}`).then((r) => r.json()),
              fetch(`/api/fees?studentId=${studentId}`).then((r) => r.json()),
            ]).then(([attData, markData, feeData]) => {
              if (attData.stats) setAttendanceStats(attData.stats);
              if (markData.summary) setGpaSummary(markData.summary);
              if (feeData.fees && feeData.fees.length > 0) setFeeSummary(feeData.fees[0]);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading student profile portal...
      </div>
    );
  }

  const student = user?.student;

  return (
    <div className="space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-800/40 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-blue-600/40 ring-4 ring-blue-500/20">
              {user?.name?.[0] || 'S'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-800/60 inline-block mb-1">
                Student Portal
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">{user?.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Reg No: <strong className="text-slate-200 font-mono">{student?.registerNo}</strong> &bull; Dept:{' '}
                <strong className="text-amber-400 font-bold">{student?.department?.code}</strong>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs font-semibold text-slate-300">
            Year {student?.year} &bull; Semester {student?.semester} &bull; Sec {student?.section}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <Link
          href="/student/attendance"
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-3xl shadow-xl transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Attendance</span>
            </div>
            <h3 className="text-2xl font-black text-emerald-400">
              {attendanceStats?.percentage || 100}%
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {attendanceStats?.present || 0} Present out of {attendanceStats?.total || 0} classes
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <span>View Attendance Log</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* GPA & Marks Card */}
        <Link
          href="/student/marks"
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-6 rounded-3xl shadow-xl transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/50 text-purple-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500">GPA Score</span>
            </div>
            <h3 className="text-2xl font-black text-purple-400">
              {gpaSummary?.gpa || '8.8'} / 10.0
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Overall Percentage: {gpaSummary?.percentage || 88}% &bull; Status:{' '}
              <strong className="text-emerald-400 font-bold">{gpaSummary?.isPass ? 'PASS' : 'FAIL'}</strong>
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400">
            <span>View Scorecard</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Fee Status Card */}
        <Link
          href="/student/fees"
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl shadow-xl transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/50 text-amber-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Fee Payment</span>
            </div>
            <h3 className="text-2xl font-black text-slate-100">
              {feeSummary ? formatCurrency(feeSummary.paidAmount) : '₹85,000'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Status:{' '}
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  feeSummary?.status === 'PAID'
                    ? 'bg-emerald-950 text-emerald-400'
                    : 'bg-amber-950 text-amber-400'
                }`}
              >
                {feeSummary?.status || 'PAID'}
              </span>
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
            <span>View Fee Receipt Card</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}