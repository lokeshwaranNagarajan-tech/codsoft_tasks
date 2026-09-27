'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function FeeManagementPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalCollected: 0, totalPending: 0, totalExpected: 0 });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [totalFee, setTotalFee] = useState('85000');
  const [paidAmount, setPaidAmount] = useState('85000');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Card Modal
  const [viewReceipt, setViewReceipt] = useState<any | null>(null);

  const fetchFeeData = async () => {
    setLoading(true);
    try {
      const [feeRes, stuRes] = await Promise.all([
        fetch('/api/fees'),
        fetch('/api/students?limit=100'),
      ]);
      const feeData = await feeRes.json();
      const stuData = await stuRes.json();

      if (feeData.fees) setFees(feeData.fees);
      if (feeData.summary) setSummary(feeData.summary);
      if (stuData.students) setStudents(stuData.students);
    } catch {
      toast.error('Failed to load fee records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  const handleRecordFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !totalFee || paidAmount === '') {
      toast.error('Please select student and enter fee amounts');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          totalFee,
          paidAmount,
          paymentDate,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to record fee');
        setIsSubmitting(false);
        return;
      }

      toast.success('Fee payment recorded successfully!');
      setIsModalOpen(false);
      fetchFeeData();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Tuition & Fee Collection</h1>
          <p className="text-xs text-slate-400">Record payments, manage pending balances, and generate fee receipts</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-600/20 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Fee Payment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400">Total Expected Fee</span>
          <p className="text-2xl font-black text-slate-100 mt-1">{formatCurrency(summary.totalExpected)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-emerald-400">Total Fee Collected</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(summary.totalCollected)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-red-400">Pending Fee Balance</span>
          <p className="text-2xl font-black text-red-400 mt-1">{formatCurrency(summary.totalPending)}</p>
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
                <th className="p-4">Total Fee</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Pending</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment Date</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading fee ledgers...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No fee records logged yet.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-100">{fee.student?.user?.name}</td>
                    <td className="p-4">
                      <span className="font-mono text-slate-400 block">{fee.student?.registerNo}</span>
                      <span className="text-[10px] font-bold text-amber-400">{fee.student?.department?.code}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{formatCurrency(fee.totalFee)}</td>
                    <td className="p-4 font-bold text-emerald-400">{formatCurrency(fee.paidAmount)}</td>
                    <td className="p-4 font-bold text-red-400">{formatCurrency(fee.pendingAmount)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          fee.status === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                            : fee.status === 'PARTIAL'
                            ? 'bg-amber-950 text-amber-400 border-amber-800/60'
                            : 'bg-red-950 text-red-400 border-red-800/60'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(fee.paymentDate)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setViewReceipt(fee)}
                        className="p-1.5 text-blue-400 hover:bg-blue-950 rounded-lg transition"
                        title="View Receipt Card"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Fee Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Fee Payment">
        <form onSubmit={handleRecordFee} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="">Select Student</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.user.name} ({st.registerNo} - {st.department?.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Total Academic Fee (₹)</label>
            <input
              type="number"
              value={totalFee}
              onChange={(e) => setTotalFee(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Paid Amount (₹)</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Save Fee Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Card Modal */}
      <Modal isOpen={!!viewReceipt} onClose={() => setViewReceipt(null)} title="Official Fee Receipt Card">
        {viewReceipt && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="text-center border-b border-slate-800 pb-4">
              <h2 className="font-extrabold text-sm text-blue-400 uppercase tracking-wide">
                Annai Mira College of Engineering & Technology
              </h2>
              <p className="text-[10px] text-slate-400">Official ERP Fee Payment Voucher</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <strong className="text-slate-100">{viewReceipt.student?.user?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Register Number:</span>
                <strong className="font-mono text-slate-200">{viewReceipt.student?.registerNo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <strong className="text-amber-400">{viewReceipt.student?.department?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Date:</span>
                <span className="text-slate-300">{formatDate(viewReceipt.paymentDate)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Fee:</span>
                <strong className="text-slate-100">{formatCurrency(viewReceipt.totalFee)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paid Amount:</span>
                <strong className="text-emerald-400">{formatCurrency(viewReceipt.paidAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pending Balance:</span>
                <strong className="text-red-400">{formatCurrency(viewReceipt.pendingAmount)}</strong>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400">Status:</span>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-bold">
                  {viewReceipt.status}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl"
              >
                Print Voucher Card
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
