'use client';

import CustomSelect from '@/components/CustomSelect';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { TablePagination, TableTopControls, useTableControls } from '@/components/TableControls';
import { Edit2, Fingerprint, Phone, Plus, Trash2, User, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function GeneralStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
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
    paginatedData: paginatedStaff,
    totalEntries,
    totalPages,
    startIndex,
    endIndex,
  } = useTableControls({
    data: staffList,
    initialPageSize: 10,
    filterFn: (s, q) =>
      Boolean(
        s.name?.toLowerCase().includes(q) ||
        s.employeeCode?.toLowerCase().includes(q) ||
        s.designation?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.biometricId?.toString().toLowerCase().includes(q)
      ),
  });

  const [formData, setFormData] = useState({
    name: '',
    designation: 'Office Assistant',
    type: 'STAFF',
    phone: '',
    email: '',
    gender: 'MALE',
    nid: '',
    bloodGroup: '',
    religion: 'Islam',
    presentAddress: '',
    biometricId: '',
    smsEnabled: true,
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees?type=STAFF');
      const data = await res.json();
      if (data.success) {
        setStaffList(data.employees);
      }
    } catch {
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      designation: 'Office Assistant',
      type: 'STAFF',
      phone: '',
      email: '',
      gender: 'MALE',
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
      toast.error('Please enter staff name');
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

      toast.success(editingId ? 'Staff profile updated' : 'Staff member added successfully');
      setModalOpen(false);
      fetchStaff();
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
      toast.success('Staff profile deleted');
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchStaff();
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
            General Staff Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative & general staff (Office Assistant, Security, Caretaker).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Staff
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
        <TableTopControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalEntries={totalEntries}
          searchPlaceholder="Search staff name, code, phone..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">SL</th>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Staff Name</th>
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
                    Loading staff...
                  </td>
                </tr>
              ) : paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    {searchTerm ? 'No matching staff found.' : 'No general staff found.'}
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((item, index) => (
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
                          title="Edit Staff"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: `${item.name} (${item.employeeCode})` })}
                          title="Delete Staff"
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
              {editingId ? 'Edit Staff Profile' : 'Add New Staff'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Staff Full Name <span className="text-rose-500">*</span>
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
                    placeholder="Office Assistant"
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
                      { value: 'MALE', label: 'Male' },
                      { value: 'FEMALE', label: 'Female' },
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
                  Save Staff
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
        title="Delete Staff Profile"
        message="Are you sure you want to delete this staff profile? This action cannot be undone."
        itemName={deleteModal.name}
      />
    </div>
  );
}

