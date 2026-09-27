'use client';

import { useState, useEffect } from 'react';
import { FileCheck2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function StudentAttendancePage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.student?.id) {
          fetch(`/api/attendance?studentId=${data.user.student.id}`)
            .then((res) => res.json())
            .then((aData) => {
              if (aData.attendances) setAttendances(aData.attendances);
              if (aData.stats) setStats(aData.stats);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading attendance history...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">My Class Attendance Record</h1>
        <p className="text-xs text-slate-400">Subject-wise daily attendance logs and aggregate progress percentage</p>
      </div>

      {/* Percentage Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">Overall Attendance Progress</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-black text-emerald-400">{stats?.percentage || 100}%</span>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full text-xs font-bold">
              Eligible for Examinations (&gt; 75%)
            </span>
          </div>
        </div>

        <div className="flex gap-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl text-center">
            <span className="text-slate-500 text-[10px] block">Present</span>
            <strong className="text-emerald-400 text-base">{stats?.present || 0}</strong>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl text-center">
            <span className="text-slate-500 text-[10px] block">Absent</span>
            <strong className="text-red-400 text-base">{stats?.absent || 0}</strong>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl text-center">
            <span className="text-slate-500 text-[10px] block">On Leave</span>
            <strong className="text-amber-400 text-base">{stats?.leave || 0}</strong>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Subject Code</th>
                <th className="p-4">Subject Name</th>
                <th className="p-4">Faculty</th>
                <th className="p-4 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 text-slate-300 font-semibold">{formatDate(att.date)}</td>
                    <td className="p-4 font-mono font-bold text-blue-400">{att.subject?.code}</td>
                    <td className="p-4 text-slate-200">{att.subject?.name}</td>
                    <td className="p-4 text-slate-400">{att.faculty?.user?.name || 'Faculty'}</td>
                    <td className="p-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                          att.status === 'PRESENT'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                            : att.status === 'ABSENT'
                            ? 'bg-red-950 text-red-400 border-red-800/60'
                            : 'bg-amber-950 text-amber-400 border-amber-800/60'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
