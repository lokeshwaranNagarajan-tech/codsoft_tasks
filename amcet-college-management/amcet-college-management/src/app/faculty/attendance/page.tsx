'use client';

import { useState, useEffect } from 'react';
import { FileCheck2, CheckCircle2, XCircle, Clock, Save, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FacultyAttendancePage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Selection state
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('4');
  const [section, setSection] = useState('A');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance Map: studentId -> 'PRESENT' | 'ABSENT' | 'LEAVE'
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE'>>({});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/departments')
      .then((r) => r.json())
      .then((d) => {
        if (d.departments) {
          setDepartments(d.departments);
          if (d.departments.length > 0) setDepartmentId(d.departments[0].id);
        }
      });

    fetch('/api/subjects')
      .then((r) => r.json())
      .then((s) => {
        if (s.subjects) setSubjects(s.subjects);
      });
  }, []);

  const fetchStudentsAndAttendance = async () => {
    if (!departmentId || !subjectId) return;
    setLoading(true);
    try {
      const stuRes = await fetch(`/api/students?departmentId=${departmentId}&year=2&section=${section}`);
      const stuData = await stuRes.json();

      const attRes = await fetch(`/api/attendance?subjectId=${subjectId}&date=${date}`);
      const attData = await attRes.json();

      const map: Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE'> = {};

      if (stuData.students) {
        setStudents(stuData.students);
        stuData.students.forEach((st: any) => {
          map[st.id] = 'PRESENT'; // Default present
        });
      }

      if (attData.attendances) {
        attData.attendances.forEach((att: any) => {
          map[att.studentId] = att.status;
        });
      }

      setAttendanceMap(map);
    } catch {
      toast.error('Failed to load roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [departmentId, semester, section, subjectId, date]);

  const handleStatusToggle = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT' | 'LEAVE') => {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE'> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (!subjectId || !date || students.length === 0) {
      toast.error('Please select Subject, Date, and ensure students are present');
      return;
    }

    setIsSaving(true);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          date,
          records,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to save attendance');
        setIsSaving(false);
        return;
      }

      toast.success('Class attendance saved successfully!');
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Class Attendance Marking</h1>
          <p className="text-xs text-slate-400">Select class, date, subject and submit student attendance register</p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={isSaving || students.length === 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Register...' : 'Save Attendance Register'}</span>
        </button>
      </div>

      {/* Selector Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Department</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s.toString()}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Attendance Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Roster & Quick Batch Buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300">
          Student Roster ({students.length} Students)
        </span>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => handleMarkAll('PRESENT')}
            className="px-3 py-1.5 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-900"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('ABSENT')}
            className="px-3 py-1.5 bg-red-950 border border-red-800 text-red-400 rounded-lg font-semibold hover:bg-red-900"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">College ID</th>
                <th className="p-4">Register No</th>
                <th className="p-4 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Loading student register...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Please select a subject to load the student roster.
                  </td>
                </tr>
              ) : (
                students.map((st) => {
                  const status = attendanceMap[st.id] || 'PRESENT';
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-slate-100">{st.user.name}</td>
                      <td className="p-4 font-mono text-blue-400">{st.user.collegeId}</td>
                      <td className="p-4 font-mono text-slate-400">{st.registerNo}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(st.id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                              status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                : 'bg-slate-950 text-slate-500 border border-slate-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusToggle(st.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                              status === 'ABSENT'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                : 'bg-slate-950 text-slate-500 border border-slate-800'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusToggle(st.id, 'LEAVE')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                              status === 'LEAVE'
                                ? 'bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-600/30'
                                : 'bg-slate-950 text-slate-500 border border-slate-800'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Leave</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
