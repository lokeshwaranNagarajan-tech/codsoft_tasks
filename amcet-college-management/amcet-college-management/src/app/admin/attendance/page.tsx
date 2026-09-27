'use client';

import { useState, useEffect } from 'react';
import { FileCheck2, Calendar, Filter, UserCheck, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminAttendancePage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semFilter, setSemFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.departments) setDepartments(data.departments);
    } catch {
      console.error('Error loading departments');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (deptFilter !== 'ALL') params.append('departmentId', deptFilter);
      if (semFilter !== 'ALL') params.append('semester', semFilter);
      if (sectionFilter !== 'ALL') params.append('section', sectionFilter);
      if (dateFilter) params.append('date', dateFilter);

      const res = await fetch(`/api/attendance?${params}`);
      const data = await res.json();
      if (data.attendances) setAttendances(data.attendances);
    } catch {
      toast.error('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [deptFilter, semFilter, sectionFilter, dateFilter]);

  const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
  const absentCount = attendances.filter((a) => a.status === 'ABSENT').length;
  const leaveCount = attendances.filter((a) => a.status === 'LEAVE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Institutional Attendance Monitoring</h1>
        <p className="text-xs text-slate-400">View daily class attendance records across departments</p>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total Logged</span>
          <p className="text-2xl font-black text-slate-100 mt-1">{attendances.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-emerald-400 font-medium">Present</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{presentCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-red-400 font-medium">Absent</span>
          <p className="text-2xl font-black text-red-400 mt-1">{absentCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-amber-400 font-medium">On Leave</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{leaveCount}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s.toString()}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="ALL">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Reg No / Dept</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading attendance entries...
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No attendance records found for selected filters.
                  </td>
                </tr>
              ) : (
                attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-100">{att.student?.user?.name}</td>
                    <td className="p-4">
                      <span className="font-mono text-slate-400 block">{att.student?.registerNo}</span>
                      <span className="text-[10px] font-bold text-amber-400">{att.student?.department?.code}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-blue-400 block">{att.subject?.code}</span>
                      <span className="text-[10px] text-slate-400">{att.subject?.name}</span>
                    </td>
                    <td className="p-4 text-slate-300">{formatDate(att.date)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
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
                    <td className="p-4 text-slate-400 text-[11px]">
                      {att.faculty?.user?.name || 'System / Admin'}
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
