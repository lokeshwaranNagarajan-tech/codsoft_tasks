'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Plus, ShieldCheck, UserCheck } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function ClassAdvisorsPage() {
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [year, setYear] = useState('1');
  const [section, setSection] = useState('A');
  const [facultyId, setFacultyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [advRes, deptRes, facRes] = await Promise.all([
        fetch('/api/advisors'),
        fetch('/api/departments'),
        fetch('/api/faculty'),
      ]);
      const advData = await advRes.json();
      const deptData = await deptRes.json();
      const facData = await facRes.json();

      if (advData.advisors) setAdvisors(advData.advisors);
      if (deptData.departments) setDepartments(deptData.departments);
      if (facData.faculty) setFacultyList(facData.faculty);
    } catch {
      toast.error('Failed to load class advisors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !facultyId) {
      toast.error('Please select both department and faculty member');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/advisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId, year: parseInt(year), section, facultyId }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to assign class advisor');
        setIsSubmitting(false);
        return;
      }

      toast.success('Class Advisor assigned successfully!');
      setIsModalOpen(false);
      fetchData();
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
          <h1 className="text-xl font-black text-white tracking-tight">Class Advisor Allocations</h1>
          <p className="text-xs text-slate-400">
            Assign dedicated class advisors for each academic year and section. Rule: Strictly 1 advisor per class.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Class Advisor</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Department</th>
                <th className="p-4">Year & Section</th>
                <th className="p-4">Assigned Class Advisor</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Faculty ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading advisor mappings...
                  </td>
                </tr>
              ) : advisors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No class advisors currently assigned.
                  </td>
                </tr>
              ) : (
                advisors.map((adv) => (
                  <tr key={adv.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-amber-400">{adv.department?.code}</td>
                    <td className="p-4 font-semibold text-slate-200">
                      Year {adv.year} &bull; Section {adv.section}
                    </td>
                    <td className="p-4 font-semibold text-slate-100 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-400" />
                      <span>{adv.faculty?.user?.name}</span>
                    </td>
                    <td className="p-4 text-slate-400">{adv.faculty?.designation}</td>
                    <td className="p-4 font-mono text-emerald-400">{adv.faculty?.user?.collegeId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Class Advisor">
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Select Faculty Advisor</label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Faculty Member</option>
              {facultyList.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.user.name} ({fac.department?.code || 'Faculty'})
                </option>
              ))}
            </select>
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
              {isSubmitting ? 'Saving...' : 'Assign Advisor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
