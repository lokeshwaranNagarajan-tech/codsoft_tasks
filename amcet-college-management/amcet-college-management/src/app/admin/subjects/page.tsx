'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, UserPlus, GraduationCap, CheckCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semFilter, setSemFilter] = useState('ALL');

  // Modals
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [assigningSubject, setAssigningSubject] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State - Create Subject
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('3');
  const [semester, setSemester] = useState('1');
  const [departmentId, setDepartmentId] = useState('');

  // Form State - Assign Faculty
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        departmentId: deptFilter,
        semester: semFilter,
      });
      const res = await fetch(`/api/subjects?${params}`);
      const data = await res.json();
      if (data.subjects) setSubjects(data.subjects);
    } catch {
      toast.error('Failed to load subject catalog');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [deptRes, facRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/faculty'),
      ]);
      const dData = await deptRes.json();
      const fData = await facRes.json();

      if (dData.departments) setDepartments(dData.departments);
      if (fData.faculty) setFacultyList(fData.faculty);
    } catch {
      console.error('Failed metadata fetch');
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [deptFilter, semFilter]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !departmentId) {
      toast.error('Code, Name, and Department are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, credits, semester, departmentId }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to create subject');
        setIsSubmitting(false);
        return;
      }

      toast.success('Subject created!');
      setIsAddSubjectOpen(false);
      setCode('');
      setName('');
      fetchSubjects();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSubject || !selectedFacultyId) {
      toast.error('Please select a faculty member');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subject-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: assigningSubject.id,
          facultyId: selectedFacultyId,
          academicYear,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to assign faculty');
        setIsSubmitting(false);
        return;
      }

      toast.success('Faculty member assigned to subject!');
      setAssigningSubject(null);
      setSelectedFacultyId('');
      fetchSubjects();
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
          <h1 className="text-xl font-black text-white tracking-tight">Subject Catalog & Allocation</h1>
          <p className="text-xs text-slate-400">Manage curriculum courses and faculty handling assignments</p>
        </div>

        <button
          onClick={() => setIsAddSubjectOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Subject Code</th>
                <th className="p-4">Subject Name</th>
                <th className="p-4">Credits</th>
                <th className="p-4">Semester</th>
                <th className="p-4">Department</th>
                <th className="p-4">Assigned Faculty</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading course catalog...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No subjects found.
                  </td>
                </tr>
              ) : (
                subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold text-blue-400">{sub.code}</td>
                    <td className="p-4 font-semibold text-slate-100">{sub.name}</td>
                    <td className="p-4 font-bold text-emerald-400">{sub.credits}</td>
                    <td className="p-4 text-slate-300">Semester {sub.semester}</td>
                    <td className="p-4 font-bold text-amber-400">{sub.department?.code}</td>
                    <td className="p-4">
                      {sub.faculties && sub.faculties.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {sub.faculties.map((f: any) => (
                            <span key={f.id} className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                              {f.faculty?.user?.name} ({f.academicYear})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setAssigningSubject(sub)}
                        className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 font-semibold rounded-lg transition text-[11px] inline-flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign Faculty</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Create Subject */}
      <Modal isOpen={isAddSubjectOpen} onClose={() => setIsAddSubjectOpen(false)} title="Create New Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Subject Code</label>
            <input
              type="text"
              placeholder="e.g. CS8451"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none uppercase font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Operating Systems"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Credits</label>
              <select
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((c) => (
                  <option key={c} value={c}>
                    {c} Credits
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddSubjectOpen(false)}
              className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal - Assign Faculty to Subject */}
      <Modal
        isOpen={!!assigningSubject}
        onClose={() => setAssigningSubject(null)}
        title={`Assign Faculty to ${assigningSubject?.code} (${assigningSubject?.name})`}
      >
        <form onSubmit={handleAssignFaculty} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Select Faculty Member</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="">Choose Faculty</option>
              {facultyList.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.user.name} ({fac.department?.code})
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
              onClick={() => setAssigningSubject(null)}
              className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
