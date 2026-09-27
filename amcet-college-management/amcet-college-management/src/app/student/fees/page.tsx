'use client';

import { useState, useEffect } from 'react';
import { CreditCard, FileText, Printer, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StudentFeePage() {
  const [fee, setFee] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (data.user.student?.id) {
            fetch(`/api/fees?studentId=${data.user.student.id}`)
              .then((res) => res.json())
              .then((fData) => {
                if (fData.fees && fData.fees.length > 0) {
                  setFee(fData.fees[0]);
                }
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
        Loading fee ledger status...
      </div>
    );
  }

  const student = user?.student;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Tuition Fee Ledger & Receipt Card</h1>
        <p className="text-xs text-slate-400">View official fee statement and payment voucher</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Academic Fee</span>
          <p className="text-2xl font-black text-slate-100 mt-2">{formatCurrency(fee?.totalFee || 85000)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Amount Paid</span>
          <p className="text-2xl font-black text-emerald-400 mt-2">{formatCurrency(fee?.paidAmount || 85000)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Pending Balance</span>
          <p className="text-2xl font-black text-red-400 mt-2">{formatCurrency(fee?.pendingAmount || 0)}</p>
        </div>
      </div>

      {/* Official Voucher Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl space-y-6">
        <div className="text-center border-b border-slate-800 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl text-white mx-auto mb-2 shadow-lg">
            A
          </div>
          <h2 className="font-extrabold text-base text-white tracking-wide">
            Annai Mira College of Engineering and Technology
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Official Student Tuition Fee Payment Card</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Student Name</span>
            <strong className="text-slate-100 text-sm">{user?.name}</strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Register Number</span>
            <strong className="font-mono text-slate-200 text-sm">{student?.registerNo}</strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Department</span>
            <strong className="text-amber-400">{student?.department?.name}</strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Last Payment Date</span>
            <span className="text-slate-300 font-medium">{formatDate(fee?.paymentDate || new Date())}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Prescribed Fee:</span>
            <strong className="text-slate-100">{formatCurrency(fee?.totalFee || 85000)}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Paid Amount:</span>
            <strong className="text-emerald-400">{formatCurrency(fee?.paidAmount || 85000)}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Pending Amount:</span>
            <strong className="text-red-400">{formatCurrency(fee?.pendingAmount || 0)}</strong>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-400">Ledger Status:</span>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-extrabold uppercase">
              {fee?.status || 'PAID'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
