'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Trash2, Edit, GraduationCap, Award } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { formatDate, formatISOToDateInput } from '@/lib/utils';

const facultySchema = z.object({
  collegeId: z.string().min(1, 'Faculty ID is required'),
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
  designation: z.string().min(1, 'Designation is required'),
  departmentId: z.string().min(1, 'Department is required'),
  isHOD: z.boolean().optional(),
});

type FacultyForm = z.infer<typeof facultySchema>;

export default function FacultyManagementPage() {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FacultyForm>({
    resolver: zodResolver(facultySchema),
  });

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        departmentId: deptFilter,
      });
      const res = await fetch(`/api/faculty?${params}`);
      const data = await res.json();
      if (data.faculty) setFacultyList(data.faculty);
    } catch {
      toast.error('Failed to load faculty directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.departments) setDepartments(data.departments);
    } catch {
      console.error('Failed to load departments');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [search, deptFilter]);

  const handleCreate = async (data: FacultyForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to add faculty');
        setIsSubmitting(false);
        return;
      }

      toast.success('Faculty member added successfully!');
      setIsAddModalOpen(false);
      reset();
      fetchFaculty();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: FacultyForm) => {
    if (!editingFaculty) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/faculty/${editingFaculty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to update faculty');
        setIsSubmitting(false);
        return;
      }

      toast.success('Faculty details updated!');
      setEditingFaculty(null);
      reset();
      fetchFaculty();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaculty) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/faculty/${deletingFaculty.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || 'Failed to delete faculty');
        setIsSubmitting(false);
        return;
      }
      toast.success('Faculty member removed');
      setDeletingFaculty(null);
      fetchFaculty();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (fac: any) => {
    setEditingFaculty(fac);
    setValue('collegeId', fac.user.collegeId);
    setValue('name', fac.user.name);
    setValue('dob', formatISOToDateInput(fac.user.dob));
    setValue('designation', fac.designation);
    setValue('departmentId', fac.departmentId);
    setValue('isHOD', fac.isHOD);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Faculty Directory & Staff</h1>
          <p className="text-xs text-slate-400">Manage professors, assistant professors, and department staff</p>
        </div>

        <button
          onClick={() => {
            reset();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Faculty</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search faculty name, ID, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-slate-950 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none w-full md:w-auto"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Faculty ID</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Department</th>
                <th className="p-4">DOB</th>
                <th className="p-4">HOD Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading faculty roster...
                  </td>
                </tr>
              ) : facultyList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No faculty members found matching search filters.
                  </td>
                </tr>
              ) : (
                facultyList.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-100">{fac.user.name}</td>
                    <td className="p-4 font-mono text-emerald-400 font-medium">{fac.user.collegeId}</td>
                    <td className="p-4 text-slate-300">{fac.designation}</td>
                    <td className="p-4 font-semibold text-amber-400">{fac.department.code}</td>
                    <td className="p-4 text-slate-400">{formatDate(fac.user.dob)}</td>
                    <td className="p-4">
                      {fac.isHOD ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800/60 text-amber-400 text-[10px] font-bold">
                          Head of Department (HOD)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Faculty</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(fac)}
                        className="p-1.5 text-blue-400 hover:bg-blue-950 rounded-lg transition"
                        title="Edit Faculty"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingFaculty(fac)}
                        className="p-1.5 text-red-400 hover:bg-red-950 rounded-lg transition"
                        title="Delete Faculty"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingFaculty}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingFaculty(null);
        }}
        title={editingFaculty ? 'Edit Faculty Member' : 'Register New Faculty'}
      >
        <form
          onSubmit={handleSubmit(editingFaculty ? handleUpdate : handleCreate)}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-medium text-slate-300 mb-1">Faculty ID Card Number</label>
            <input
              type="text"
              placeholder="e.g. FAC004"
              {...register('collegeId')}
              disabled={!!editingFaculty}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            {errors.collegeId && <p className="text-red-400 mt-1">{errors.collegeId.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Prof. Name"
              {...register('name')}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            />
            {errors.name && <p className="text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Date of Birth</label>
            <input
              type="date"
              {...register('dob')}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            />
            {errors.dob && <p className="text-red-400 mt-1">{errors.dob.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Designation</label>
            <input
              type="text"
              placeholder="e.g. Assistant Professor, Associate Professor"
              {...register('designation')}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            />
            {errors.designation && <p className="text-red-400 mt-1">{errors.designation.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Department</label>
            <select
              {...register('departmentId')}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {errors.departmentId && <p className="text-red-400 mt-1">{errors.departmentId.message}</p>}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isHOD"
              {...register('isHOD')}
              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isHOD" className="text-xs text-slate-300 font-medium">
              Designate as Department HOD (Will replace current HOD if any)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingFaculty(null);
              }}
              className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingFaculty ? 'Update Faculty' : 'Save Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingFaculty}
        onClose={() => setDeletingFaculty(null)}
        onConfirm={handleDelete}
        title="Delete Faculty Member"
        message={`Are you sure you want to remove ${deletingFaculty?.user?.name} (${deletingFaculty?.user?.collegeId})?`}
        isDeleting={isSubmitting}
      />
    </div>
  );
}