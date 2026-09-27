'use client';

import { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

export default function FacultyAssignedSubjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          fetch('/api/subject-assignments')
            .then((res) => res.json())
            .then((aData) => {
              if (aData.assignments && data.user.faculty?.id) {
                const facAssignments = aData.assignments.filter(
                  (a: any) => a.facultyId === data.user.faculty.id
                );
                setSubjects(facAssignments);
              }
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Assigned Subjects & Curriculum</h1>
        <p className="text-xs text-slate-400">Courses allocated to you for the current academic year</p>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-3xl border border-slate-800 animate-pulse" />
          ))
        ) : subjects.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No subjects currently assigned to your account for this academic year.
          </div>
        ) : (
          subjects.map((asg) => (
            <div
              key={asg.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800/60">
                    {asg.subject?.code}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">{asg.academicYear}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mt-2">{asg.subject?.name}</h3>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Credits: <strong className="text-emerald-400 font-bold">{asg.subject?.credits}</strong></span>
                <span>Semester: <strong className="text-slate-200 font-bold">{asg.subject?.semester}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
