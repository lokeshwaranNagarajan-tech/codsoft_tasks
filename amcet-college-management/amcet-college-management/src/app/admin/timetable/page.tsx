'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, BookOpen, GraduationCap } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function MasterTimetablePage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('4');
  const [section, setSection] = useState('A');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [day, setDay] = useState('MONDAY');
  const [period, setPeriod] = useState('1');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTimetable = async () => {
    if (!departmentId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        departmentId,
        semester,
        section,
      });
      const res = await fetch(`/api/timetable?${params}`);
      const data = await res.json();
      if (data.slots) setSlots(data.slots);
    } catch {
      toast.error('Failed to load timetable slots');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [dRes, sRes, fRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/subjects'),
        fetch('/api/faculty'),
      ]);
      const dData = await dRes.json();
      const sData = await sRes.json();
      const fData = await fRes.json();

      if (dData.departments) {
        setDepartments(dData.departments);
        if (dData.departments.length > 0) {
          setDepartmentId(dData.departments[0].id);
        }
      }
      if (sData.subjects) setSubjects(sData.subjects);
      if (fData.faculty) setFacultyList(fData.faculty);
    } catch {
      console.error('Failed to fetch timetable metadata');
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [departmentId, semester, section]);

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !selectedSubjectId || !selectedFacultyId) {
      toast.error('Department, Subject, and Faculty are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId,
          semester,
          section,
          day,
          period,
          subjectId: selectedSubjectId,
          facultyId: selectedFacultyId,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to update timetable slot');
        setIsSubmitting(false);
        return;
      }

      toast.success('Timetable slot updated!');
      setIsModalOpen(false);
      fetchTimetable();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const getSlot = (d: string, p: number) => {
    return slots.find((s) => s.day === d && s.period === p);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Master Class Timetable Builder</h1>
          <p className="text-xs text-slate-400">Design weekly period schedules per department and section</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Timetable Slot</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="bg-slate-950 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="bg-slate-950 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s.toString()}>
              Semester {s}
            </option>
          ))}
        </select>

        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="bg-slate-950 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
        >
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>
      </div>

      {/* Timetable Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3 border-r border-slate-800 w-28 uppercase tracking-wider text-center">Day</th>
                {periods.map((p) => (
                  <th key={p} className="p-3 border-r border-slate-800 text-center min-w-[120px]">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {days.map((d) => (
                <tr key={d}>
                  <td className="p-3 font-extrabold text-amber-400 bg-slate-950/60 border-r border-slate-800 text-center uppercase tracking-wider text-[11px]">
                    {d}
                  </td>
                  {periods.map((p) => {
                    const slot = getSlot(d, p);
                    return (
                      <td key={p} className="p-2 border-r border-slate-800 align-top hover:bg-slate-800/40 transition">
                        {slot ? (
                          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                            <span className="font-bold text-blue-400 block text-xs">{slot.subject?.code}</span>
                            <span className="text-[10px] text-slate-300 font-medium block truncate">{slot.subject?.name}</span>
                            <span className="text-[9px] text-slate-500 block">{slot.faculty?.user?.name}</span>
                          </div>
                        ) : (
                          <div className="h-14 flex items-center justify-center text-[10px] text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                            Free Slot
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Timetable Period">
        <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Day of Week</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                {periods.map((p) => (
                  <option key={p} value={p.toString()}>
                    Period {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name} (Sem {sub.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Select Faculty</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="">Select Faculty</option>
              {facultyList.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.user.name} ({fac.department?.code})
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
              {isSubmitting ? 'Saving...' : 'Save Period Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
