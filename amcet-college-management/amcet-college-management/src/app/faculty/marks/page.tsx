'use client';

import { useState, useEffect } from 'react';
import { Award, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FacultyMarksPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Selection
  const [examId, setExamId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  // Marks map: studentId -> marks (number)
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/exams')
      .then((r) => r.json())
      .then((eData) => {
        if (eData.exams) {
          setExams(eData.exams);
          if (eData.exams.length > 0) setExamId(eData.exams[0].id);
        }
      });

    fetch('/api/subjects')
      .then((r) => r.json())
      .then((sData) => {
        if (sData.subjects) {
          setSubjects(sData.subjects);
          if (sData.subjects.length > 0) setSubjectId(sData.subjects[0].id);
        }
      });
  }, []);

  const fetchStudentsAndMarks = async () => {
    if (!subjectId || !examId) return;
    setLoading(true);
    try {
      const selectedSubject = subjects.find((s) => s.id === subjectId);
      const deptId = selectedSubject?.departmentId;

      const stuRes = await fetch(`/api/students${deptId ? `?departmentId=${deptId}` : ''}`);
      const stuData = await stuRes.json();

      const marksRes = await fetch(`/api/marks?examId=${examId}&subjectId=${subjectId}`);
      const marksData = await marksRes.json();

      const map: Record<string, number> = {};
      if (stuData.students) {
        setStudents(stuData.students);
        stuData.students.forEach((st: any) => {
          map[st.id] = 0;
        });
      }

      if (marksData.marks) {
        marksData.marks.forEach((m: any) => {
          map[m.studentId] = m.marks;
        });
      }

      setMarksMap(map);
    } catch {
      toast.error('Failed to load marks roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndMarks();
  }, [examId, subjectId]);

  const handleScoreChange = (studentId: string, val: string) => {
    const score = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: score,
    }));
  };

  const handleSaveMarks = async () => {
    if (!examId || !subjectId || students.length === 0) {
      toast.error('Exam and Subject are required');
      return;
    }

    setIsSaving(true);
    try {
      const records = Object.entries(marksMap).map(([studentId, marks]) => ({
        studentId,
        marks,
      }));

      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          subjectId,
          records,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to save marks');
        setIsSaving(false);
        return;
      }

      toast.success('Exam marks updated successfully!');
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
          <h1 className="text-xl font-black text-white tracking-tight">Exam Evaluation & Marks Entry</h1>
          <p className="text-xs text-slate-400">Enter student marks for CIA internal tests and semester examinations</p>
        </div>

        <button
          onClick={handleSaveMarks}
          disabled={isSaving || students.length === 0}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Submitting Marks...' : 'Save Exam Marks'}</span>
        </button>
      </div>

      {/* Selector Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Select Examination</label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} (Sem {e.semester} - {e.academicYear})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Select Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name} (Sem {sub.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">College ID</th>
                <th className="p-4">Register No</th>
                <th className="p-4">Marks (Out of 100)</th>
                <th className="p-4">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading student marks entry list...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No students registered for this subject stream.
                  </td>
                </tr>
              ) : (
                students.map((st) => {
                  const score = marksMap[st.id] || 0;
                  const isPass = score >= 40;
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-slate-100">{st.user.name}</td>
                      <td className="p-4 font-mono text-blue-400">{st.user.collegeId}</td>
                      <td className="p-4 font-mono text-slate-400">{st.registerNo}</td>
                      <td className="p-4 w-44">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={score}
                          onChange={(e) => handleScoreChange(st.id, e.target.value)}
                          className="w-full bg-slate-950 text-slate-100 p-2 rounded-xl border border-slate-800 font-extrabold focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                            isPass
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                              : 'bg-red-950 text-red-400 border-red-800/60'
                          }`}
                        >
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
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
