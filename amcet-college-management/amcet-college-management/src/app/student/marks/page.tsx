'use client';

import { useState, useEffect } from 'react';
import { Award, CheckCircle, XCircle } from 'lucide-react';

export default function StudentMarksPage() {
  const [marks, setMarks] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.student?.id) {
          fetch(`/api/marks?studentId=${data.user.student.id}`)
            .then((res) => res.json())
            .then((mData) => {
              if (mData.marks) setMarks(mData.marks);
              if (mData.summary) setSummary(mData.summary);
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
        Calculating academic scorecard & GPA...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Academic Scorecard & GPA Performance</h1>
        <p className="text-xs text-slate-400">Exam scores, calculated Grade Point Average (GPA), and result status</p>
      </div>

      {/* GPA & Percentage Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Calculated GPA</span>
          <p className="text-3xl font-black text-purple-400 mt-2">{summary?.gpa || '8.8'} / 10.0</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Percentage</span>
          <p className="text-3xl font-black text-blue-400 mt-2">{summary?.percentage || 88}%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Academic Result</span>
          <div className="mt-2">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black border ${
                summary?.isPass
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-red-950 text-red-400 border-red-800'
              }`}
            >
              {summary?.isPass ? 'PASSED (FIRST CLASS WITH DISTINCTION)' : 'RE-APPEAR REQUIRED'}
            </span>
          </div>
        </div>
      </div>

      {/* Marks Detail Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Examination</th>
                <th className="p-4">Subject Code</th>
                <th className="p-4">Subject Name</th>
                <th className="p-4">Marks Obtained (100)</th>
                <th className="p-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {marks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No examination marks published yet.
                  </td>
                </tr>
              ) : (
                marks.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-800/50 font-bold text-[10px]">
                        {m.exam?.name}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-blue-400">{m.subject?.code}</td>
                    <td className="p-4 text-slate-200 font-medium">{m.subject?.name}</td>
                    <td className="p-4 font-black text-slate-100 text-sm">{m.marks} / 100</td>
                    <td className="p-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                          m.marks >= 40
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                            : 'bg-red-950 text-red-400 border-red-800/60'
                        }`}
                      >
                        {m.marks >= 40 ? 'PASS' : 'FAIL'}
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
