'use client';

import { useState, useEffect } from 'react';
import { Award, Plus, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('CIA1');
  const [semester, setSemester] = useState('4');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exams');
      const data = await res.json();
      if (data.exams) setExams(data.exams);
    } catch {
      toast.error('Failed to load exams list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, semester, academicYear }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to create exam');
        setIsSubmitting(false);
        return;
      }

      toast.success('Exam created successfully!');
      setIsModalOpen(false);
      fetchExams();
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
          <h1 className="text-xl font-black text-white tracking-tight">Examination Schedule & Controller</h1>
          <p className="text-xs text-slate-400">Configure CIA tests, Model exams, and Semester evaluations</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Exam</span>
        </button>
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-3xl border border-slate-800 animate-pulse" />
          ))
        ) : exams.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No examinations currently configured.
          </div>
        ) : (
          exams.map((ex) => (
            <div
              key={ex.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-purple-950 text-purple-400 border border-purple-800/60 rounded-full font-bold text-xs">
                    {ex.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{ex.academicYear}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mt-2">Semester {ex.semester} Examination</h3>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Marks Entered:</span>
                <strong className="text-emerald-400 font-bold">{ex._count?.marks || 0} Records</strong>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Dialog */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Exam">
        <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Exam Type</label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="CIA1">CIA 1 (Continuous Internal Assessment 1)</option>
              <option value="CIA2">CIA 2 (Continuous Internal Assessment 2)</option>
              <option value="Model">Model Examination</option>
              <option value="Semester">Semester End Examination</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Target Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
