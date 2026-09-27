'use client';

import { useState, useEffect } from 'react';
import { Download, Printer, BarChart3, FileSpreadsheet, FileText } from 'lucide-react';
import DeptStudentsChart from '@/components/charts/DeptStudentsChart';
import AttendanceChart from '@/components/charts/AttendanceChart';
import FeeChart from '@/components/charts/FeeChart';
import ExamResultsChart from '@/components/charts/ExamResultsChart';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        setReportData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const downloadCSV = (filename: string, rows: any[]) => {
    if (!rows || rows.length === 0) {
      toast.error('No data available to export');
      return;
    }
    const headers = Object.keys(rows[0]).join(',');
    const body = rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${body}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename}.csv downloaded!`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Generating institutional report analytics...
      </div>
    );
  }

  const deptStrength = reportData?.deptStrength || [];
  const feeSummary = reportData?.feeSummary || [];
  const attendanceSummary = reportData?.attendanceSummary || [];
  const examSummary = reportData?.examSummary || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">AMCET Institutional Reports & Analytics</h1>
          <p className="text-xs text-slate-400">Comprehensive academic strength, fee ledger, and exam result reports</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadCSV('AMCET_Department_Strength_Report', deptStrength)}
            className="px-3.5 py-2 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold hover:bg-emerald-900 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Analytics Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report 1: Student & Department Strength */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">1. Student & Department Strength Report</h3>
              <p className="text-[11px] text-slate-400">Department wise breakdown</p>
            </div>
            <button
              onClick={() => downloadCSV('Student_Strength_Report', deptStrength)}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          <DeptStudentsChart data={deptStrength} />
        </div>

        {/* Report 2: Attendance Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">2. Attendance Report</h3>
              <p className="text-[11px] text-slate-400">Institutional attendance percentages</p>
            </div>
            <button
              onClick={() => downloadCSV('Attendance_Report', attendanceSummary)}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          <AttendanceChart data={attendanceSummary} />
        </div>

        {/* Report 3: Fees Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">3. Fee Ledger & Pending Report</h3>
              <p className="text-[11px] text-slate-400">Collected vs pending fee statistics</p>
            </div>
            <button
              onClick={() => downloadCSV('Fee_Ledger_Report', feeSummary)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          <FeeChart data={feeSummary} />
        </div>

        {/* Report 4: Marks & GPA Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">4. Examination Marks Report</h3>
              <p className="text-[11px] text-slate-400">Average scores and pass rate percentages</p>
            </div>
            <button
              onClick={() => downloadCSV('Exam_Marks_Report', examSummary)}
              className="text-xs text-purple-400 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          <ExamResultsChart data={examSummary} />
        </div>
      </div>
    </div>
  );
}
