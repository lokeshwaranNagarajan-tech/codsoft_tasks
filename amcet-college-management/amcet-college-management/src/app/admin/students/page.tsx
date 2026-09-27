'use client';

import { useState, useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Filter, Trash2, Edit, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { formatDate, formatISOToDateInput } from '@/lib/utils';

const studentSchema = z.object({
  collegeId: z.string().min(1, 'College ID is required'),
  registerNo: z.string().min(1, 'Register Number is required'),
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
  departmentId: z.string().min(1, 'Department is required'),
  year: z.number().int().min(1).max(4),
  semester: z.number().int().min(1).max(8),
  section: z.string().min(1, 'Section is required'),
});

type StudentForm = z.infer<typeof studentSchema>;

export default function StudentsManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema) as Resolver<StudentForm>,
    defaultValues: {
      year: 1,
      semester: 1,
      section: 'A',
    },
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        departmentId: deptFilter,
        year: yearFilter,
        section: sectionFilter,
      });
      const res = await fetch(`/api/students?${params}`);
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch {
      toast.error('Failed to load students list');
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
    fetchStudents();
  }, [page, search, deptFilter, yearFilter, sectionFilter]);

  const handleCreate = async (data: StudentForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to create student');
        setIsSubmitting(false);
        return;
      }

      toast.success('Student registered successfully!');
      setIsAddModalOpen(false);
      reset();
      fetchStudents();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: StudentForm) => {
    if (!editingStudent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to update student');
        setIsSubmitting(false);
        return;
      }

      toast.success('Student details updated!');
      setEditingStudent(null);
      reset();
      fetchStudents();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/students/${deletingStudent.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || 'Failed to delete student');
        setIsSubmitting(false);
        return;
      }
      toast.success('Student record deleted');
      setDeletingStudent(null);
      fetchStudents();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setValue('collegeId', student.user.collegeId);
    setValue('registerNo', student.registerNo);
    setValue('name', student.user.name);
    setValue('dob', formatISOToDateInput(student.user.dob));
    setValue('departmentId', student.departmentId);
    setValue('year', student.year);
    setValue('semester', student.semester);
    setValue('section', student.section);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Student Directory & Enrollment</h1>
          <p className="text-xs text-slate-400">Manage student profiles, registrations, and academic classes</p>
        </div>

        <button
          onClick={() => {
            reset();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, reg no, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="ALL">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="ALL">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">College ID</th>
                <th className="p-4">Register No</th>
                <th className="p-4">Department</th>
                <th className="p-4">Class / Sem</th>
                <th className="p-4">DOB</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading student data...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No student records found matching filters.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-100">{st.user.name}</td>
                    <td className="p-4 font-mono text-blue-400 font-medium">{st.user.collegeId}</td>
                    <td className="p-4 font-mono text-slate-400">{st.registerNo}</td>
                    <td className="p-4 font-semibold text-amber-400">{st.department.code}</td>
                    <td className="p-4">
                      Year {st.year} &bull; Sem {st.semester} &bull; Sec {st.section}
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(st.user.dob)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(st)}
                        className="p-1.5 text-blue-400 hover:bg-blue-950 rounded-lg transition"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingStudent(st)}
                        className="p-1.5 text-red-400 hover:bg-red-950 rounded-lg transition"
                        title="Delete Student"
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 bg-slate-950 rounded-lg border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 bg-slate-950 rounded-lg border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingStudent}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? 'Edit Student Details' : 'Register New Student'}
      >
        <form
          onSubmit={handleSubmit(editingStudent ? handleUpdate as any : handleCreate as any)}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-medium text-slate-300 mb-1">College ID Card Number</label>
            <input
              type="text"
              placeholder="e.g. AMCET23CSE005"
              {...register('collegeId')}
              disabled={!!editingStudent}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            {errors.collegeId && <p className="text-red-400 mt-1">{errors.collegeId.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Register Number</label>
            <input
              type="text"
              placeholder="e.g. 513223104005"
              {...register('registerNo')}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
            {errors.registerNo && <p className="text-red-400 mt-1">{errors.registerNo.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Student full name"
              {...register('name')}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
            {errors.name && <p className="text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Date of Birth</label>
            <input
              type="date"
              {...register('dob')}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
            {errors.dob && <p className="text-red-400 mt-1">{errors.dob.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Department</label>
            <select
              {...register('departmentId')}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Year</label>
              <select
                {...register('year', { valueAsNumber: true })}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Semester</label>
              <select
                {...register('semester', { valueAsNumber: true })}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Section</label>
              <select
                {...register('section')}
                className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingStudent(null);
              }}
              className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDelete}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${deletingStudent?.user?.name} (${deletingStudent?.registerNo})? All associated marks and attendance records will be removed.`}
        isDeleting={isSubmitting}
      />
    </div>
  );
}