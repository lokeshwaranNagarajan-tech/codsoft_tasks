'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function StudentTimetablePage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          const student = data.user.student;
          if (student) {
            const params = new URLSearchParams({
              departmentId: student.departmentId,
              semester: student.semester.toString(),
              section: student.section,
            });
            fetch(`/api/timetable?${params}`)
              .then((res) => res.json())
              .then((tData) => {
                if (tData.slots) setSlots(tData.slots);
                setLoading(false);
              });
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading class timetable schedule...
      </div>
    );
  }

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const getSlot = (d: string, p: number) => {
    return slots.find((s) => s.day === d && s.period === p);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Weekly Class Timetable Schedule</h1>
        <p className="text-xs text-slate-400">Class period schedule for Semester {user?.student?.semester} Section {user?.student?.section}</p>
      </div>

      {/* Timetable Table */}
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
                      <td key={p} className="p-2 border-r border-slate-800 align-top">
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
    </div>
  );
}
