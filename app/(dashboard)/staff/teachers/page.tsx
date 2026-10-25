'use client';

import CustomSelect from '@/components/CustomSelect';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { TablePagination, TableTopControls, useTableControls } from '@/components/TableControls';
import { Edit2, Fingerprint, Phone, Plus, Trash2, User, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    paginatedData: paginatedTeachers,
    totalEntries,
    totalPages,
    startIndex,
    endIndex,
  } = useTableControls({
    data: teachers,
    initialPageSize: 10,
    filterFn: (t, q) =>
      Boolean(
        t.name?.toLowerCase().includes(q) ||
        t.employeeCode?.toLowerCase().includes(q) ||
        t.designation?.toLowerCase().includes(q) ||
        t.phone?.toLowerCase().includes(q) ||
        t.biometricId?.toString().toLowerCase().includes(q)
      ),
  });

  const [formData, setFormData] = useState({
    name: '',
    designation: 'Assistant Teacher',
    type: 'TEACHER',
    phone: '',
    email: '',
    gender: 'FEMALE',
    nid: '',
    bloodGroup: '',
    religion: 'Islam',
    presentAddress: '',
    biometricId: '',
    smsEnabled: true,
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees?type=TEACHER');
      const data = await res.json();
      if (data.success) {
        setTeachers(data.employees);
      }
    } catch {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      designation: 'Assistant Teacher',
      type: 'TEACHER',
      phone: '',
      email: '',
      gender: 'FEMALE',
      nid: '',
      bloodGroup: '',
      religion: 'Islam',
      presentAddress: '',
      biometricId: '',
      smsEnabled: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      designation: item.designation,
      type: item.type,
      phone: item.phone,
      email: item.email || '',
      gender: item.gender,
      nid: item.nid || '',
      bloodGroup: item.bloodGroup || '',
      religion: item.religion || 'Islam',
      presentAddress: item.presentAddress || '',
      biometricId: item.biometricId || '',
      smsEnabled: item.smsEnabled,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter teacher name');
      return;
    }

    try {
      const url = editingId ? `/api/employees/${editingId}` : '/api/employees';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Operation failed');
        return;
      }

      toast.success(editingId ? 'Teacher profile updated' : 'Teacher added successfully');
      setModalOpen(false);
      fetchTeachers();
    } catch (error: any) {
      toast.error(error.message || 'Network error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/employees/${deleteModal.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Delete failed');
        return;
      }
      toast.success('Teacher profile deleted');
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchTeachers();
    } catch (error: any) {
      toast.error(error.message || 'Network error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Teachers Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage teaching staff profiles and ZKTeco biometric attendance mapping.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Teacher
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
        <TableTopControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalEntries={totalEntries}
          searchPlaceholder="Search teacher name, code, phone..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">SL</th>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Teacher Name</th>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">Biometric ID</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap min-w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[14px]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading teachers...
                  </td>
                </tr>
              ) : paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    {searchTerm ? 'No matching teachers found.' : "No teachers found. Click 'Add New Teacher' to register one."}
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 text-slate-400">{startIndex + index}</td>
                    <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {item.employeeCode}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {item.designation}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.biometricId ? (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-mono text-[11px]">
                          {item.biometricId}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">Not mapped</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <Link
                          href={`/staff/${item.id}`}
                          title="View Profile"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Teacher"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: `${item.name} (${item.employeeCode})` })}
                          title="Delete Teacher"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={totalEntries}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
        />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 !m-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Edit Teacher Profile' : 'Add New Teacher'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Teacher Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Assistant Teacher"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
                    ZKTeco Biometric ID
                  </label>
                  <input
                    type="text"
                    value={formData.biometricId}
                    onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
                    placeholder="User ID in K60"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <CustomSelect
                    value={formData.gender}
                    onChange={(val) => setFormData({ ...formData, gender: val })}
                    options={[
                      { value: 'FEMALE', label: 'Female' },
                      { value: 'MALE', label: 'Male' },
                      { value: 'OTHER', label: 'Other' },
                    ]}
                    placeholder="Select Gender"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Teacher Profile"
        message="Are you sure you want to delete this teacher profile? This action cannot be undone."
        itemName={deleteModal.name}
      />
    </div>
  );
}

