'use client';

import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { PageSizeOption, TablePagination, TableTopControls } from '@/components/TableControls';
import {
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function StudentsDirectoryPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);

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

  // Filters
  const [search, setSearch] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [shiftId, setShiftId] = useState('');

  // Academic Dropdown Data
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [sesRes, clsRes, secRes, shfRes] = await Promise.all([
          fetch('/api/academic/sessions'),
          fetch('/api/academic/classes'),
          fetch('/api/academic/sections'),
          fetch('/api/academic/shifts'),
        ]);

        const [ses, cls, sec, shf] = await Promise.all([
          sesRes.json(),
          clsRes.json(),
          secRes.json(),
          shfRes.json(),
        ]);

        if (ses.success) setSessions(ses.sessions);
        if (cls.success) setClasses(cls.classes);
        if (sec.success) setSections(sec.sections);
        if (shf.success) setShifts(shf.shifts);
      } catch {
        // ignore
      }
    }
    loadMeta();
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const limitVal = pageSize === 'all' ? 1000 : Number(pageSize);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limitVal));
      if (search) params.append('search', search);
      if (sessionId) params.append('sessionId', sessionId);
      if (classId) params.append('classId', classId);
      if (sectionId) params.append('sectionId', sectionId);
      if (shiftId) params.append('shiftId', shiftId);

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error('Failed to fetch student directory');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sessionId, classId, sectionId, shiftId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/students/${deleteModal.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Delete failed');
        return;
      }
      toast.success('Student deleted successfully');
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || 'Network error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }

    const rows = students.map((s, index) => {
      const enr = s.enrollments?.[0];
      return {
        SL: index + 1,
        'Student ID': s.studentCode,
        'Admission No': s.admissionNo,
        'Student Name (EN)': s.nameEn,
        'Student Name (BN)': s.nameBn || '',
        Class: enr?.class?.name || '',
        Section: enr?.section?.name || '',
        Shift: enr?.shift?.name || '',
        Roll: enr?.roll || '',
        Gender: s.gender,
        'Guardian Phone': s.guardian?.guardianPhone || s.guardian?.fatherPhone || '',
        'Father Name': s.guardian?.fatherName || '',
        'Biometric ID': s.biometricId || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `YWCA_Students_List_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded successfully');
  };

  const currentLimit = pageSize === 'all' ? (total || 1) : Number(pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Students Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {total} students registered across all sessions and classes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export Excel
          </button>
          <Link
            href="/students/admission"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Admission
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          Filter & Search Students
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name, ID, Phone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.isCurrent ? '(Current)' : ''}
              </option>
            ))}
          </select>

          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Sections</option>
            {sections
              .filter((sec) => !classId || sec.classId === Number(classId))
              .map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.class?.name})
                </option>
              ))}
          </select>

          <select
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Shifts</option>
            {shifts.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
        <TableTopControls
          pageSize={pageSize}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
          searchTerm={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          totalEntries={total}
          searchPlaceholder="Search student name, ID, phone, admission..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">SL</th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Class & Section</th>
                <th className="px-6 py-3.5">Shift</th>
                <th className="px-6 py-3.5">Roll</th>
                <th className="px-6 py-3.5">Guardian Phone</th>
                <th className="px-6 py-3.5">Biometric ID</th>
                <th className="px-6 py-3.5 text-right whitespace-nowrap min-w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[14px]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                    Loading students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    No students matched your search criteria.
                  </td>
                </tr>
              ) : (
                students.map((item, index) => {
                  const enr = item.enrollments?.[0];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 text-slate-400">{(page - 1) * currentLimit + index + 1}</td>
                      <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {item.studentCode}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.nameEn}
                        </div>
                        {item.nameBn && (
                          <div className="text-[10px] text-slate-400">{item.nameBn}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{enr?.class?.name || '-'}</span>
                        <span className="text-slate-400"> ({enr?.section?.name || '-'})</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {enr?.shift?.name || '-'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {enr?.roll || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{item.guardian?.guardianPhone || item.guardian?.fatherPhone || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.biometricId ? (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-mono text-[10px]">
                            {item.biometricId}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px]">Not mapped</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <Link
                            href={`/students/${item.id}`}
                            title="View Profile & Print ID"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, id: item.id, name: `${item.nameEn} (${item.studentCode})` })}
                            title="Delete Student"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 inline-flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          totalEntries={total}
          startIndex={total === 0 ? 0 : (page - 1) * currentLimit + 1}
          endIndex={pageSize === 'all' ? total : Math.min(page * currentLimit, total)}
          onPageChange={setPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Student Record"
        message="Are you sure you want to delete this student record? This cannot be undone."
        itemName={deleteModal.name}
      />
    </div>
  );
}

