'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, UserPlus, Lock } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collegeId, setCollegeId] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingAdmin, setDeletingAdmin] = useState<any | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admins');
      const data = await res.json();
      if (data.admins) setAdmins(data.admins);
    } catch {
      toast.error('Failed to load administrator list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId || !name || !dob) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId, name, dob }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to create Secondary Admin');
        setIsSubmitting(false);
        return;
      }

      toast.success('Secondary Admin created successfully!');
      setIsModalOpen(false);
      setCollegeId('');
      setName('');
      setDob('');
      fetchAdmins();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admins/${deletingAdmin.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Failed to delete admin');
        setIsSubmitting(false);
        return;
      }

      toast.success('Secondary Admin account deleted');
      setDeletingAdmin(null);
      fetchAdmins();
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
          <h1 className="text-xl font-black text-white tracking-tight">System Administrators Control</h1>
          <p className="text-xs text-slate-400">Primary Admin privilege panel to manage Secondary Administrators</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Secondary Admin</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Admin Name</th>
                <th className="p-4">College ID</th>
                <th className="p-4">Role Permission</th>
                <th className="p-4">DOB</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading admin credentials...
                  </td>
                </tr>
              ) : (
                admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-100">{adm.name}</td>
                    <td className="p-4 font-mono text-blue-400 font-bold">{adm.collegeId}</td>
                    <td className="p-4">
                      {adm.role === 'PRIMARY_ADMIN' ? (
                        <span className="px-3 py-1 bg-amber-950 border border-amber-800/60 text-amber-400 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          PRIMARY ADMIN (Protected)
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-950 border border-blue-800/60 text-blue-400 rounded-full text-[10px] font-bold">
                          SECONDARY ADMIN
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(adm.dob)}</td>
                    <td className="p-4 text-slate-400">{formatDate(adm.createdAt)}</td>
                    <td className="p-4 text-right">
                      {adm.role !== 'PRIMARY_ADMIN' ? (
                        <button
                          onClick={() => setDeletingAdmin(adm)}
                          className="p-1.5 text-red-400 hover:bg-red-950 rounded-lg transition"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-medium">Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Create Secondary Admin */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Secondary Administrator">
        <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">College ID Card Number</label>
            <input
              type="text"
              placeholder="e.g. ADMIN003"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none uppercase font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Administrator Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Date of Birth (DOB)</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
            />
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
              {isSubmitting ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingAdmin}
        onClose={() => setDeletingAdmin(null)}
        onConfirm={handleDeleteAdmin}
        title="Delete Secondary Admin"
        message={`Are you sure you want to remove ${deletingAdmin?.name} (${deletingAdmin?.collegeId})?`}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
