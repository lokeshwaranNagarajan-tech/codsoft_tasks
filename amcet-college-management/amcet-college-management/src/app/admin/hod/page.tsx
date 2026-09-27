'use client';

import { useState, useEffect } from 'react';
import { Building2, UserCheck, ShieldCheck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HODAllocationPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedHODs, setSelectedHODs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingDeptId, setSavingDeptId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, facRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/faculty'),
      ]);
      const deptData = await deptRes.json();
      const facData = await facRes.json();

      if (deptData.departments) {
        setDepartments(deptData.departments);
        const hodMap: Record<string, string> = {};
        deptData.departments.forEach((d: any) => {
          const hodFac = d.faculties?.find((f: any) => f.isHOD);
          if (hodFac) hodMap[d.id] = hodFac.id;
        });
        setSelectedHODs(hodMap);
      }
      if (facData.faculty) {
        setFacultyList(facData.faculty);
      }
    } catch {
      toast.error('Failed to load HOD data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignHOD = async (departmentId: string) => {
    const facultyId = selectedHODs[departmentId];
    if (!facultyId) {
      toast.error('Please select a faculty member to designate as HOD');
      return;
    }

    setSavingDeptId(departmentId);
    try {
      const res = await fetch('/api/hod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId, facultyId }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to assign HOD');
        return;
      }

      toast.success('HOD allocated successfully! Previous HOD updated automatically.');
      fetchData();
    } catch {
      toast.error('An error occurred during assignment');
    } finally {
      setSavingDeptId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">HOD Department Allocation</h1>
        <p className="text-xs text-slate-400">
          Designate Head of Department (HOD) for each academic branch. Each department is strictly limited to one active HOD.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-900 rounded-3xl border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const currentHOD = dept.faculties?.find((f: any) => f.isHOD);
            const deptFaculty = facultyList.filter((f) => f.departmentId === dept.id);

            return (
              <div
                key={dept.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Department Title */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-800/50 text-amber-400 flex items-center justify-center font-black text-sm">
                        {dept.code}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{dept.name}</h3>
                        <span className="text-[10px] text-slate-500">{dept._count?.faculties || 0} Faculty Members</span>
                      </div>
                    </div>
                  </div>

                  {/* Current HOD Badge */}
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Current HOD</span>
                    {currentHOD ? (
                      <div className="flex items-center gap-2 text-slate-200 text-xs font-bold">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>{currentHOD.user?.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-400 font-medium">No HOD currently assigned</span>
                    )}
                  </div>

                  {/* Faculty Selection Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select New HOD</label>
                    <select
                      value={selectedHODs[dept.id] || ''}
                      onChange={(e) =>
                        setSelectedHODs({ ...selectedHODs, [dept.id]: e.target.value })
                      }
                      className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Choose Faculty Member</option>
                      {deptFaculty.map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.user.name} ({fac.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assign Button */}
                <button
                  onClick={() => handleAssignHOD(dept.id)}
                  disabled={savingDeptId === dept.id}
                  className="mt-6 w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{savingDeptId === dept.id ? 'Updating HOD...' : 'Assign HOD'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
