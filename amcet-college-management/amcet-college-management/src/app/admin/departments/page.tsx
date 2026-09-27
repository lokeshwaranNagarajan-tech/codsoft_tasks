'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Users, GraduationCap, BookOpen } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.departments) setDepartments(data.departments);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error('Department name and code are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to create department');
        setIsSubmitting(false);
        return;
      }

      toast.success('Department created successfully!');
      setIsModalOpen(false);
      setName('');
      setCode('');
      fetchDepartments();
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
          <h1 className="text-xl font-black text-white tracking-tight">Academic Departments</h1>
          <p className="text-xs text-slate-400">Configure engineering departments and degree programs</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-3xl border border-slate-800 animate-pulse" />
          ))
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/50 text-blue-400 flex items-center justify-center font-black text-base shadow-inner">
                    {dept.code}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                    Active Dept
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100">{dept.name}</h3>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block font-medium">Students</span>
                  <span className="text-xs font-black text-blue-400">{dept._count?.students || 0}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block font-medium">Faculty</span>
                  <span className="text-xs font-black text-emerald-400">{dept._count?.faculties || 0}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block font-medium">Subjects</span>
                  <span className="text-xs font-black text-purple-400">{dept._count?.subjects || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Dialog */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Department">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Department Code</label>
            <input
              type="text"
              placeholder="e.g. AI&DS, CS, MECH"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Department Name</label>
            <input
              type="text"
              placeholder="e.g. Computer Science and Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
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
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
