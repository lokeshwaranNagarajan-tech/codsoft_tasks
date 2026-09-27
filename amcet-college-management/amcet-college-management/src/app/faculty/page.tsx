'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, FileCheck2, Award, Clock, GraduationCap, ArrowRight } from 'lucide-react';

export default function FacultyOverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (data.user.faculty?.id) {
            fetch(`/api/timetable?facultyId=${data.user.faculty.id}`)
              .then((r) => r.json())
              .then((tData) => {
                if (tData.slots) setTimetable(tData.slots);
              });
          }
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading faculty portal...
      </div>
    );
  }

  const faculty = user?.faculty;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/40 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800/60 inline-block mb-2">
            Faculty Dashboard
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {faculty?.designation} &bull; {faculty?.department?.name} ({faculty?.department?.code})
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/faculty/attendance"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Mark Attendance</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/faculty/attendance"
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-3xl shadow-xl transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Take Class Attendance</h3>
          <p className="text-xs text-slate-400 mt-1">Select class roster, mark Present/Absent/Leave status, and submit</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <span>Open Register</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/faculty/marks"
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-3xl shadow-xl transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/50 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Enter Exam Marks</h3>
          <p className="text-xs text-slate-400 mt-1">Submit CIA1, CIA2, Model and Semester scores for assigned subjects</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-400">
            <span>Enter Scores</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/faculty/subjects"
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-6 rounded-3xl shadow-xl transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/50 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Assigned Subjects</h3>
          <p className="text-xs text-slate-400 mt-1">View list of subjects and course curriculum assigned to you</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400">
            <span>View Subjects</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Timetable Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">My Teaching Schedule</h3>
        </div>

        {timetable.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No active timetable slots allocated to you yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timetable.map((slot) => (
              <div key={slot.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {slot.day} &bull; Period {slot.period}
                </span>
                <strong className="text-sm font-extrabold text-blue-400 block mt-1">{slot.subject?.code}</strong>
                <p className="text-xs text-slate-300 font-medium">{slot.subject?.name}</p>
                <span className="text-[10px] text-slate-500 block mt-2">
                  {slot.department?.code} &bull; Sem {slot.semester} Sec {slot.section}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}