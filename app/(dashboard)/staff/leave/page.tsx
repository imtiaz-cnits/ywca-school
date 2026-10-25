'use client';

import CustomSelect from '@/components/CustomSelect';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import FlatpickrCalendar from '@/components/FlatpickrCalendar';
import { TablePagination, TableTopControls, useTableControls } from '@/components/TableControls';
import { APP_CONFIG } from '@/lib/constants';
import { differenceInDays, format, parse } from 'date-fns';
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Printer,
  Search,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Tab: My Requests, Calendar, Reports
  const [activeTab, setActiveTab] = useState<'requests' | 'calendar' | 'reports'>('requests');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [quickViewModal, setQuickViewModal] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Create Form State (Image 4 + 5 Combination)
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveDuration, setLeaveDuration] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY');
  const [startDate, setStartDate] = useState(format(new Date(), 'dd-MM-yyyy'));
  const [endDate, setEndDate] = useState(format(new Date(), 'dd-MM-yyyy'));
  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [leaveAddress, setLeaveAddress] = useState('');
  const [substituteName, setSubstituteName] = useState('');
  const [leaveStatus, setLeaveStatus] = useState<'PENDING' | 'APPROVED'>('APPROVED');

  // Custom Searchable Employee Dropdown State (Request 1)
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const empDropdownRef = useRef<HTMLDivElement>(null);

  // Custom Half Day Period Dropdown State (Request 2 - Image 2)
  const [halfPeriod, setHalfPeriod] = useState<'FIRST_HALF' | 'SECOND_HALF'>('FIRST_HALF');
  const [halfPeriodDropdownOpen, setHalfPeriodDropdownOpen] = useState(false);
  const halfPeriodDropdownRef = useRef<HTMLDivElement>(null);

  // Search state for Staff Quota Consumption Register table
  const [quotaSearchTerm, setQuotaSearchTerm] = useState('');

  // Row to print for official leave form
  const [rowToPrint, setRowToPrint] = useState<any | null>(null);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close custom dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (empDropdownRef.current && !empDropdownRef.current.contains(e.target as Node)) {
        setEmpDropdownOpen(false);
      }
      if (halfPeriodDropdownRef.current && !halfPeriodDropdownRef.current.contains(e.target as Node)) {
        setHalfPeriodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leaves');
      const data = await res.json();
      if (data.success) {
        setLeaves(data.leaves || []);
      }
    } catch {
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
        if (data.employees && data.employees.length > 0 && !selectedEmpId) {
          setSelectedEmpId(String(data.employees[0].id));
          setDepartment(data.employees[0].designation || 'Faculty');
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, [fetchLeaves]);

  // Counts for Metric Cards (Image 2)
  const pendingCount = useMemo(() => leaves.filter((l) => l.status === 'PENDING').length, [leaves]);
  const approvedCount = useMemo(() => leaves.filter((l) => l.status === 'APPROVED').length, [leaves]);
  const rejectedCount = useMemo(() => leaves.filter((l) => l.status === 'REJECTED').length, [leaves]);

  // Filtered employees for custom search dropdown
  const filteredEmployees = useMemo(() => {
    if (!empSearchQuery.trim()) return employees;
    const q = empSearchQuery.toLowerCase();
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.employeeCode?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q)
    );
  }, [employees, empSearchQuery]);

  // Selected Employee Details & Quota Calculation (Image 5)
  const selectedEmp = useMemo(
    () => employees.find((e) => String(e.id) === selectedEmpId) || null,
    [employees, selectedEmpId]
  );

  const empLeaveStats = useMemo(() => {
    if (!selectedEmpId) return { casual: 0, sick: 0, annual: 0, other: 0 };
    const empLeaves = leaves.filter(
      (l) => String(l.employeeId) === String(selectedEmpId) && l.status === 'APPROVED'
    );
    let casual = 0;
    let sick = 0;
    let annual = 0;
    let other = 0;

    empLeaves.forEach((l) => {
      const t = (l.leaveType || '').toLowerCase();
      let days = 1;
      if (l.duration === 'HALF_DAY' || l.duration?.includes('HALF')) {
        days = 0.5;
      } else {
        try {
          const start = new Date(l.startDate);
          const end = new Date(l.endDate);
          days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        } catch {
          days = 1;
        }
      }
      if (t.includes('casual') || t.includes('নৈমিত্তিক')) casual += days;
      else if (t.includes('sick') || t.includes('medical') || t.includes('অসুস্থ')) sick += days;
      else if (t.includes('annual') || t.includes('বাৎসরিক') || t.includes('earned')) annual += days;
      else other += days;
    });

    return { casual, sick, annual, other };
  }, [leaves, selectedEmpId]);

  // Dynamic Quota Consumption for Reports Tab (Request 3)
  const facultyQuotaReport = useMemo(() => {
    return employees.map((emp) => {
      const empLeaves = leaves.filter(
        (l) => String(l.employeeId) === String(emp.id) && l.status === 'APPROVED'
      );
      let casual = 0;
      let sick = 0;
      let annual = 0;
      let other = 0;

      empLeaves.forEach((l) => {
        const t = (l.leaveType || '').toLowerCase();
        let days = 1;
        if (l.duration === 'HALF_DAY' || l.duration?.includes('HALF')) {
          days = 0.5;
        } else {
          try {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          } catch {
            days = 1;
          }
        }
        if (t.includes('casual') || t.includes('নৈমিত্তিক')) casual += days;
        else if (t.includes('sick') || t.includes('medical') || t.includes('অসুস্থ')) sick += days;
        else if (t.includes('annual') || t.includes('বাৎসরিক') || t.includes('earned')) annual += days;
        else other += days;
      });

      return {
        ...emp,
        casualUsed: casual,
        casualRemaining: Math.max(0, 10 - casual),
        sickUsed: sick,
        sickRemaining: Math.max(0, 14 - sick),
        annualUsed: annual,
        annualRemaining: Math.max(0, 21 - annual),
        otherUsed: other,
        totalUsed: casual + sick + annual + other,
      };
    });
  }, [employees, leaves]);

  const totalInstitutionalStats = useMemo(() => {
    let casual = 0;
    let sick = 0;
    let annual = 0;
    facultyQuotaReport.forEach((f) => {
      casual += f.casualUsed;
      sick += f.sickUsed;
      annual += f.annualUsed;
    });
    return { casual, sick, annual };
  }, [facultyQuotaReport]);

  // Filtered faculty quota report for the Quota table search bar
  const filteredQuotaReport = useMemo(() => {
    if (!quotaSearchTerm.trim()) return facultyQuotaReport;
    const q = quotaSearchTerm.toLowerCase();
    return facultyQuotaReport.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(q) ||
        emp.employeeCode?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q)
    );
  }, [facultyQuotaReport, quotaSearchTerm]);

  // Table controls
  const {
    searchTerm,
    setSearchTerm,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    paginatedData: paginatedLeaves,
    totalEntries,
    totalPages,
    startIndex,
    endIndex,
  } = useTableControls({
    data: leaves,
    initialPageSize: 10,
    filterFn: (l, q) =>
      Boolean(
        l.employeeName?.toLowerCase().includes(q) ||
        l.employeeCode?.toLowerCase().includes(q) ||
        l.designation?.toLowerCase().includes(q) ||
        l.leaveType?.toLowerCase().includes(q) ||
        l.reason?.toLowerCase().includes(q) ||
        l.status?.toLowerCase().includes(q)
      ),
  });

  // Calculate days for selected From & To
  const calculatedDays = useMemo(() => {
    try {
      const parseD = (s: string) => {
        const m = s.trim().match(/^(\d{2})-(\d{2})-(\d{4})/);
        return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : new Date(s);
      };
      const st = parseD(startDate);
      const en = parseD(endDate);
      const diff = Math.max(1, differenceInDays(en, st) + 1);
      if (leaveDuration === 'HALF_DAY') return '0.5 Day (Half Day)';
      return `${diff} ${diff === 1 ? 'Day' : 'Days'}`;
    } catch {
      return '1 Day';
    }
  }, [startDate, endDate, leaveDuration]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(String(employees[0].id));
      setDepartment(employees[0].designation || 'Faculty');
    }
    setLeaveType('Casual Leave');
    setLeaveDuration('FULL_DAY');
    setStartDate(format(new Date(), 'dd-MM-yyyy'));
    setEndDate(format(new Date(), 'dd-MM-yyyy'));
    setReason('');
    setLeaveAddress('');
    setSubstituteName('');
    setLeaveStatus('APPROVED');
    setCreateModalOpen(true);
  };

  // Submit Leave Request (Image 4 + 5)
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) {
      toast.error('Please select an employee');
      return;
    }
    const finalStartDate = startDate;
    const finalEndDate = leaveDuration === 'HALF_DAY' ? startDate : endDate;

    if (!finalStartDate || !finalEndDate) {
      toast.error('Please select required leave date(s)');
      return;
    }

    const finalDuration =
      leaveDuration === 'HALF_DAY'
        ? halfPeriod === 'FIRST_HALF'
          ? 'HALF_DAY_MORNING'
          : 'HALF_DAY_AFTERNOON'
        : 'FULL_DAY';

    try {
      setSaving(true);
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: Number(selectedEmpId),
          leaveType,
          startDate: finalStartDate,
          endDate: finalEndDate,
          duration: finalDuration,
          department: department.trim() || selectedEmp?.designation || 'Faculty',
          reason: reason.trim() || 'Urgent personal leave application',
          leaveAddress: leaveAddress.trim(),
          substituteName: substituteName.trim(),
          status: leaveStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to submit leave');
        return;
      }

      toast.success('Leave application submitted successfully');
      setCreateModalOpen(false);
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  // Print Official Leave Application Form (From Create Modal)
  const handlePrintOfficialForm = () => {
    setRowToPrint(null);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  // Print Specific Leave Record (From Table Action or Quick View Modal)
  const handlePrintRowLeave = (item: any) => {
    setRowToPrint(item);
    setTimeout(() => {
      window.print();
    }, 80);
  };

  // Active printable record variables (resolves from rowToPrint if set, or active create modal form)
  const activePrintTarget = useMemo(() => {
    if (rowToPrint) {
      const emp = employees.find((e) => String(e.id) === String(rowToPrint.employeeId));
      const stats = facultyQuotaReport.find((f) => String(f.id) === String(rowToPrint.employeeId));
      let daysStr = '1 Day';
      if (rowToPrint.duration?.includes('HALF')) {
        daysStr = '0.5 Day (Half Day)';
      } else {
        try {
          const st = new Date(rowToPrint.startDate);
          const en = new Date(rowToPrint.endDate);
          const diff = Math.max(1, Math.round((en.getTime() - st.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          daysStr = `${diff} ${diff === 1 ? 'Day' : 'Days'}`;
        } catch {
          daysStr = '1 Day';
        }
      }

      const formatDateStr = (d: string) => {
        try {
          return format(new Date(d.includes('T') ? d : d + 'T00:00:00'), 'dd-MM-yyyy');
        } catch {
          return d;
        }
      };

      return {
        empName: rowToPrint.employeeName || emp?.name || '___________________________',
        empDesignation: rowToPrint.department || rowToPrint.designation || emp?.designation || 'Faculty',
        leaveType: rowToPrint.leaveType || 'Casual Leave',
        startDate: formatDateStr(rowToPrint.startDate),
        endDate: formatDateStr(rowToPrint.endDate),
        appliedDate: rowToPrint.appliedAt ? format(new Date(rowToPrint.appliedAt), 'dd-MM-yyyy') : formatDateStr(rowToPrint.startDate),
        durationDays: daysStr,
        reason: rowToPrint.reason || 'ব্যক্তিগত বিশেষ প্রয়োজনে ছুটি প্রার্থনা করিতেছি।',
        leaveAddress: rowToPrint.leaveAddress || 'স্থায়ী আবাসিক ঠিকানা',
        substituteName: rowToPrint.substituteName || '________________________________________',
        annualUsed: stats ? stats.annualUsed : 0,
        annualRemaining: stats ? stats.annualRemaining : 21,
        sickUsed: stats ? stats.sickUsed : 0,
        sickRemaining: stats ? stats.sickRemaining : 14,
        casualUsed: stats ? stats.casualUsed : 0,
        casualRemaining: stats ? stats.casualRemaining : 10,
        otherUsed: stats ? stats.otherUsed : 0,
      };
    }

    return {
      empName: selectedEmp?.name || '___________________________',
      empDesignation: department || selectedEmp?.designation || 'Faculty',
      leaveType: leaveType,
      startDate: startDate,
      endDate: leaveDuration === 'HALF_DAY' ? startDate : endDate,
      appliedDate: startDate || format(new Date(), 'dd-MM-yyyy'),
      durationDays: calculatedDays,
      reason: reason || 'ব্যক্তিগত বিশেষ প্রয়োজনে ছুটি প্রার্থনা করিতেছি।',
      leaveAddress: leaveAddress || 'স্থায়ী আবাসিক ঠিকানা',
      substituteName: substituteName || '________________________________________',
      annualUsed: empLeaveStats.annual,
      annualRemaining: Math.max(0, 21 - empLeaveStats.annual),
      sickUsed: empLeaveStats.sick,
      sickRemaining: Math.max(0, 14 - empLeaveStats.sick),
      casualUsed: empLeaveStats.casual,
      casualRemaining: Math.max(0, 10 - empLeaveStats.casual),
      otherUsed: empLeaveStats.other,
    };
  }, [
    rowToPrint,
    employees,
    facultyQuotaReport,
    selectedEmp,
    department,
    leaveType,
    startDate,
    leaveDuration,
    endDate,
    calculatedDays,
    reason,
    leaveAddress,
    substituteName,
    empLeaveStats,
  ]);

  // Quick Status change from Quick View or Action
  const handleStatusChange = async (id: number, nextStatus: string) => {
    try {
      const res = await fetch('/api/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeaves((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: nextStatus } : l))
        );
        if (quickViewModal && quickViewModal.id === id) {
          setQuickViewModal((prev: any) => ({ ...prev, status: nextStatus }));
        }
        toast.success(`Leave marked as ${nextStatus}`);
      }
    } catch {
      toast.error('Failed to update leave status');
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/leaves?id=${deleteModal.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Delete failed');
        return;
      }
      toast.success('Leave record deleted');
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.message || 'Network error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date safely for table (Oct 8, 2026)
  const formatTableCellDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr + 'T00:00:00'), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Badge styling for Leave Type matching Image 2
  const getLeaveTypeBadge = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('sick') || t.includes('medical') || t.includes('অসুস্থ')) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border border-rose-300 dark:border-rose-700/80 text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30">
          Sick
        </span>
      );
    }
    if (t.includes('annual') || t.includes('বাৎসরিক') || t.includes('earned')) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border border-indigo-300 dark:border-indigo-700/80 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30">
          Annual
        </span>
      );
    }
    if (t.includes('maternity') || t.includes('মাতৃত্ব') || t.includes('other')) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border border-purple-300 dark:border-purple-700/80 text-purple-600 dark:text-purple-400 bg-purple-50/60 dark:bg-purple-950/30">
          Other
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border border-amber-300 dark:border-amber-700/80 text-amber-600 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30">
        Casual
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header (Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Leave Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Approve or reject team leave applications.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/15 transition-all self-start sm:self-auto cursor-pointer"
        >
          New request
        </button>
      </div>

      {/* 3 Metric Summary Cards (Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* PENDING */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            PENDING
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {pendingCount}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
              warning
            </span>
          </div>
        </div>

        {/* APPROVED */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            APPROVED
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {approvedCount}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
              success
            </span>
          </div>
        </div>

        {/* REJECTED */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            REJECTED
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {rejectedCount}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
              destructive
            </span>
          </div>
        </div>
      </div>

      {/* View Tabs Bar (Image 2) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Requests</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Reports</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Staff requests
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {leaves.length} Applications
            </span>
          </div>

          <TableTopControls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalEntries={totalEntries}
            searchPlaceholder="Search employee, leave type, reason..."
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">From</th>
                  <th className="px-5 py-3.5">To</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right whitespace-nowrap min-w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[14px]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-indigo-600" />
                      Loading leave records...
                    </td>
                  </tr>
                ) : paginatedLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  paginatedLeaves.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Employee Column (Avatar + Name + Department/Designation) */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0 overflow-hidden">
                            {item.employeePhoto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.employeePhoto} alt={item.employeeName} className="w-full h-full object-cover" />
                            ) : (
                              item.employeeName?.slice(0, 2) || 'ST'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-[13px]">
                              {item.employeeName}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                              {item.department || item.designation || 'FACULTY'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Column (Styled pill matching Image 2) */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {getLeaveTypeBadge(item.leaveType)}
                      </td>

                      {/* From Date (Oct 8, 2026) */}
                      <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap">
                        {formatTableCellDate(item.startDate)}
                      </td>

                      {/* To Date (Oct 8, 2026) */}
                      <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap">
                        {formatTableCellDate(item.endDate)}
                      </td>

                      {/* Reason Column (Truncated) */}
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs max-w-xs truncate">
                        {item.reason || 'Leave requested for personal reasons.'}
                      </td>

                      {/* Status (Solid Pill matching Image 2) */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {item.status === 'APPROVED' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                            Approved
                          </span>
                        ) : item.status === 'REJECTED' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm shadow-rose-600/20">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm shadow-amber-500/20">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action Column (Quick Eye Icon + Profile Icon + Delete) */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {/* Quick Eye Button (Image 3 Modal) */}
                          <button
                            type="button"
                            onClick={() => setQuickViewModal(item)}
                            title="Quick View Details"
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 inline-flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print Official Leave Form Button */}
                          <button
                            type="button"
                            onClick={() => handlePrintRowLeave(item)}
                            title="Print Official Leave Form"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 inline-flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Profile Button (Links to /staff/[id]) */}
                          <Link
                            href={`/staff/${item.employeeId}`}
                            title="View Employee Profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 inline-flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <User className="w-4 h-4" />
                          </Link>

                          {/* Quick Status Approval buttons if Pending */}
                          {item.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'APPROVED')}
                                title="Approve Leave"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 inline-flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'REJECTED')}
                                title="Reject Leave"
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 inline-flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Delete Record */}
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                id: item.id,
                                name: `${item.employeeName} - ${item.leaveType}`,
                              })
                            }
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 inline-flex items-center justify-center transition-colors cursor-pointer"
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
      )}

      {/* Calendar View Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Staff Leave Calendar View
            </h2>
            <span className="text-xs text-slate-500">Scheduled leaves overview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaves.filter((l) => l.status === 'APPROVED').length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                No approved leaves scheduled in the calendar.
              </div>
            ) : (
              leaves
                .filter((l) => l.status === 'APPROVED')
                .map((l) => (
                  <div
                    key={l.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {l.employeeName}
                      </span>
                      {getLeaveTypeBadge(l.leaveType)}
                    </div>
                    <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      {formatTableCellDate(l.startDate)} → {formatTableCellDate(l.endDate)}
                    </div>
                    <p className="text-xs text-slate-500 italic truncate">&quot;{l.reason}&quot;</p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Reports View Tab (Dynamic Quota Deduction everywhere) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Official Leave Quota Breakdown
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dynamic institutional balance tracking with real-time approved leave deductions
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono self-start sm:self-auto">
                Total Staff: {employees.length} Members
              </span>
            </div>

            {/* 3 Live Quota Cards (Deducting in real time) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Casual Leave */}
              <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-bangla">
                      নৈমিত্তিক ছুটি (Casual)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-mono">
                      ১০ দিন / জন
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-900 dark:text-amber-200 font-mono mt-2">
                    {Math.max(0, 10 - totalInstitutionalStats.casual)} দিন{' '}
                    <span className="text-xs font-normal text-slate-500">
                      ({Math.max(0, 10 - totalInstitutionalStats.casual)} Days remaining)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">২ কার্যদিবস পূর্বে আবেদন প্রযোজ্য</div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>অনুমোদিত মোট ভোগ:</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{totalInstitutionalStats.casual} দিন</span>
                  </div>
                </div>
              </div>

              {/* Sick Leave */}
              <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider font-bangla">
                      অসুস্থতাজনিত ছুটি (Medical/Sick)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-mono">
                      ১৪ দিন / জন
                    </span>
                  </div>
                  <div className="text-2xl font-black text-rose-900 dark:text-rose-200 font-mono mt-2">
                    {Math.max(0, 14 - totalInstitutionalStats.sick)} দিন{' '}
                    <span className="text-xs font-normal text-slate-500">
                      ({Math.max(0, 14 - totalInstitutionalStats.sick)} Days remaining)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">ছুটি ভোগের ৩ দিনের মধ্যে জমা</div>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>অনুমোদিত মোট ভোগ:</span>
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-300">{totalInstitutionalStats.sick} দিন</span>
                  </div>
                </div>
              </div>

              {/* Annual Leave */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider font-bangla">
                      বাৎসরিক ছুটি (Annual/Earned)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-mono">
                      ২১ দিন / জন
                    </span>
                  </div>
                  <div className="text-2xl font-black text-indigo-900 dark:text-indigo-200 font-mono mt-2">
                    {Math.max(0, 21 - totalInstitutionalStats.annual)} দিন{' '}
                    <span className="text-xs font-normal text-slate-500">
                      ({Math.max(0, 21 - totalInstitutionalStats.annual)} Days remaining)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">৭ কার্যদিবস পূর্বে আবেদন প্রযোজ্য</div>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-200/60 dark:border-indigo-900/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>অনুমোদিত মোট ভোগ:</span>
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">{totalInstitutionalStats.annual} দিন</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Faculty Leave Quota & Remaining Balance Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Staff Quota Consumption & Remaining Days Register
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Individual balance tracking for all faculty members and office staff
                </p>
              </div>

              {/* Search Bar for Quota Consumption Table */}
              <div className="relative min-w-[240px] sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={quotaSearchTerm}
                  onChange={(e) => setQuotaSearchTerm(e.target.value)}
                  placeholder="Search staff, code, designation..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
                {quotaSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setQuotaSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Faculty / Staff</th>
                    <th className="px-4 py-3 text-center">Casual (১০ দিন)</th>
                    <th className="px-4 py-3 text-center">Sick (১৪ দিন)</th>
                    <th className="px-4 py-3 text-center">Annual (২১ দিন)</th>
                    <th className="px-4 py-3 text-center">Total Used</th>
                    <th className="px-4 py-3 text-center">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px]">
                  {filteredQuotaReport.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        No staff members matching &quot;{quotaSearchTerm}&quot; found.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotaReport.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {emp.name?.slice(0, 2) || 'ST'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-xs">{emp.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{emp.employeeCode} • {emp.designation}</div>
                            </div>
                          </div>
                        </td>
                        {/* Casual */}
                        <td className="px-4 py-3 text-center font-mono">
                          <span className="font-bold text-amber-700 dark:text-amber-400">{emp.casualUsed}d</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{emp.casualRemaining}d left</span>
                        </td>
                        {/* Sick */}
                        <td className="px-4 py-3 text-center font-mono">
                          <span className="font-bold text-rose-700 dark:text-rose-400">{emp.sickUsed}d</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{emp.sickRemaining}d left</span>
                        </td>
                        {/* Annual */}
                        <td className="px-4 py-3 text-center font-mono">
                          <span className="font-bold text-indigo-700 dark:text-indigo-400">{emp.annualUsed}d</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{emp.annualRemaining}d left</span>
                        </td>
                        {/* Total */}
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {emp.totalUsed} Days
                        </td>
                        {/* Action Profile link */}
                        <td className="px-4 py-3 text-center">
                          <Link
                            href={`/staff/${emp.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL (Exact match to Image 3) */}
      {mounted && quickViewModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-150 space-y-5">
            {/* Header Actions: Print + Close */}
            <div className="absolute top-5 right-5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePrintRowLeave(quickViewModal)}
                title="Print Official Form"
                className="p-1 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setQuickViewModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Heading */}
            <div className="text-center pt-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Leave Application Details
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Submitted on {quickViewModal.appliedAt ? format(new Date(quickViewModal.appliedAt), 'MMM d, yyyy') : formatTableCellDate(quickViewModal.startDate)}
              </p>
            </div>

            {/* Employee Card Banner (Image 3) */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm shrink-0 overflow-hidden">
                  {quickViewModal.employeePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={quickViewModal.employeePhoto} alt={quickViewModal.employeeName} className="w-full h-full object-cover" />
                  ) : (
                    quickViewModal.employeeName?.slice(0, 2) || 'EM'
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {quickViewModal.employeeName}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {quickViewModal.department || quickViewModal.designation || 'FACULTY'}
                  </p>
                </div>
              </div>

              <div>
                {quickViewModal.status === 'APPROVED' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                    Approved
                  </span>
                ) : quickViewModal.status === 'REJECTED' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm shadow-rose-600/20">
                    Rejected
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm shadow-amber-500/20">
                    Pending
                  </span>
                )}
              </div>
            </div>

            {/* Leave Type and Duration 2-Col Grid (Image 3) */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  LEAVE TYPE
                </div>
                <div>{getLeaveTypeBadge(quickViewModal.leaveType)}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  DURATION
                </div>
                <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatTableCellDate(quickViewModal.startDate)} - {formatTableCellDate(quickViewModal.endDate)}
                </div>
              </div>
            </div>

            {/* REASON Box (Image 3) */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                REASON
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &quot;{quickViewModal.reason || 'I kindly request you to grant me a leave of absence for this period. I would be highly obliged for your approval.'}&quot;
              </div>
            </div>

            {/* Extra YWCA Official Details (Image 5) */}
            {(quickViewModal.leaveAddress || quickViewModal.substituteName) && (
              <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {quickViewModal.leaveAddress && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">ছুটিতে থাকাকালীন ঠিকানা:</span>
                    <span className="text-slate-700 dark:text-slate-300">{quickViewModal.leaveAddress}</span>
                  </div>
                )}
                {quickViewModal.substituteName && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">বদলী কর্মী:</span>
                    <span className="text-slate-700 dark:text-slate-300">{quickViewModal.substituteName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Processed Timestamp (Image 3) */}
            <div className="text-center text-[10px] text-slate-400 italic">
              Processed at {quickViewModal.appliedAt ? format(new Date(quickViewModal.appliedAt), 'MMM d, yyyy') : formatTableCellDate(quickViewModal.startDate)}
            </div>

            {/* Actions: Approve / Reject if Pending, or Full-width Close */}
            <div className="space-y-2 pt-1">
              {quickViewModal.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(quickViewModal.id, 'APPROVED')}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Approve Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(quickViewModal.id, 'REJECTED')}
                    className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setQuickViewModal(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* NEW LEAVE REQUEST MODAL (Combined Image 4 + Image 5) */}
      {mounted && createModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header with Print Button & Close (Request 4) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="YWCA Logo" className="w-9 h-9 object-contain" />
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    New leave request <span className="font-normal font-bangla text-slate-500">/ ছুটির আবেদনপত্র</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Young Women&apos;s Christian Association (YWCA), Pabna • Mission House
                  </p>
                </div>
              </div>

              {/* Action buttons on top right: Print button to the left of Close button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintOfficialForm}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  title="Print Official Physical Form (ছবি ৪-এর মতো আবেদনপত্র প্রিন্ট)"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Print Form / প্রিন্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitLeave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* 1. Custom Searchable Employee Dropdown (Request 1) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Employee Name / কর্মীর নাম <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative" ref={empDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setEmpDropdownOpen(!empDropdownOpen)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {selectedEmp?.name?.slice(0, 2) || 'ST'}
                        </div>
                        <span className="truncate">
                          {selectedEmp
                            ? `${selectedEmp.name} (${selectedEmp.employeeCode}) — ${selectedEmp.designation}`
                            : 'Select Employee / কর্মী নির্বাচন করুন...'}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          empDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {empDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search staff name, code or designation..."
                              value={empSearchQuery}
                              onChange={(e) => setEmpSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredEmployees.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">
                              No matching faculty or staff found.
                            </div>
                          ) : (
                            filteredEmployees.map((emp) => (
                              <button
                                key={emp.id}
                                type="button"
                                onClick={() => {
                                  setSelectedEmpId(String(emp.id));
                                  setDepartment(emp.designation || 'Faculty');
                                  setEmpDropdownOpen(false);
                                  setEmpSearchQuery('');
                                }}
                                className={`w-full flex items-center justify-between p-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                                  String(emp.id) === selectedEmpId
                                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {emp.name?.slice(0, 2) || 'ST'}
                                  </div>
                                  <div className="truncate">
                                    <div className="font-semibold truncate">{emp.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      {emp.employeeCode} • {emp.designation}
                                    </div>
                                  </div>
                                </div>
                                {String(emp.id) === selectedEmpId && (
                                  <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Program / Department (প্রোগ্রাম / ডিপার্টমেন্ট)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nursery Faculty, General Administration"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Leave Quota Counter (Image 5: ছুটির হিসাব - Real-time Deduction) */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    ছুটির হিসাব (Institutional Leave Quota Balance):
                  </span>
                  <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-mono font-bold">
                    {selectedEmp?.name}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">নৈমিত্তিক (১০ দিন)</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {Math.max(0, 10 - empLeaveStats.casual)} <span className="text-[10px] text-slate-400 font-normal">বাকি</span>
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">ব্যবহৃত: {empLeaveStats.casual} দিন</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">অসুস্থতাজনিত (১৪ দিন)</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {Math.max(0, 14 - empLeaveStats.sick)} <span className="text-[10px] text-slate-400 font-normal">বাকি</span>
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">ব্যবহৃত: {empLeaveStats.sick} দিন</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">বাৎসরিক (২১ দিন)</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {Math.max(0, 21 - empLeaveStats.annual)} <span className="text-[10px] text-slate-400 font-normal">বাকি</span>
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">ব্যবহৃত: {empLeaveStats.annual} দিন</span>
                  </div>
                </div>
              </div>

              {/* 3. Leave Type (Image 4) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Leave Type (ছুটির ধরন) <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  value={leaveType}
                  onChange={(val) => setLeaveType(val)}
                  options={[
                    { value: 'Casual Leave', label: 'Casual Leave (নৈমিত্তিক ছুটি)' },
                    { value: 'Sick Leave', label: 'Sick Leave / Medical (অসুস্থতাজনিত ছুটি)' },
                    { value: 'Annual Leave', label: 'Annual / Earned Leave (বাৎসরিক ছুটি)' },
                    { value: 'Maternity Leave', label: 'Maternity Leave (মাতৃত্বকালীন ছুটি)' },
                    { value: 'Other Leave', label: 'Other Special Leave (অন্যান্য ছুটি)' },
                  ]}
                  placeholder="Select Leave Type"
                />
              </div>

              {/* 4. Leave Duration Toggle (Image 2: Full Day(s) vs Half Day) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Leave Duration (ছুটির ব্যাপ্তি)
                </label>
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setLeaveDuration('FULL_DAY')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      leaveDuration === 'FULL_DAY'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Full Day(s) (পূর্ণ দিবস)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveDuration('HALF_DAY')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      leaveDuration === 'HALF_DAY'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Half Day (অর্ধ দিবস)
                  </button>
                </div>
              </div>

              {/* 5. Date Range vs Half Day Option (Request 2: Exactly matching Image 2) */}
              {leaveDuration === 'FULL_DAY' ? (
                /* Full Day(s): From and To date fields */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        From (তারিখ হতে) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">dd-mm-yyyy</span>
                    </div>
                    <FlatpickrCalendar
                      value={startDate}
                      onChange={(val) => {
                        setStartDate(val);
                        if (val > endDate) setEndDate(val);
                      }}
                      placeholder="Select start date..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        To (তারিখ পর্যন্ত) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        {calculatedDays}
                      </span>
                    </div>
                    <FlatpickrCalendar
                      value={endDate}
                      onChange={(val) => setEndDate(val)}
                      placeholder="Select end date..."
                    />
                  </div>
                </div>
              ) : (
                /* Half Day: Date + Half Period Custom Dropdown (Image 2) */
                <div className="space-y-4">
                  {/* Single Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Date (তারিখ) <span className="text-rose-500">*</span>
                    </label>
                    <FlatpickrCalendar
                      value={startDate}
                      onChange={(val) => {
                        setStartDate(val);
                        setEndDate(val);
                      }}
                      placeholder="Select date"
                    />
                  </div>

                  {/* Half Period custom dropdown matching Image 2 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Half Period (অর্ধ দিবস শিফট) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative" ref={halfPeriodDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setHalfPeriodDropdownOpen(!halfPeriodDropdownOpen)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                      >
                        <span>
                          {halfPeriod === 'FIRST_HALF'
                            ? 'First Half (Morning) — সকাল'
                            : 'Second Half (Afternoon) — বিকাল'}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            halfPeriodDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {halfPeriodDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setHalfPeriod('FIRST_HALF');
                              setHalfPeriodDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                              halfPeriod === 'FIRST_HALF'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>First Half (Morning) — সকাল</span>
                            {halfPeriod === 'FIRST_HALF' && (
                              <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setHalfPeriod('SECOND_HALF');
                              setHalfPeriodDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                              halfPeriod === 'SECOND_HALF'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>Second Half (Afternoon) — বিকাল</span>
                            {halfPeriod === 'SECOND_HALF' && (
                              <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Reason (বিশেষ প্রয়োজনে ছুটি / কারণ) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason for Leave (বিশেষ প্রয়োজনে ছুটি / কারণ) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your reason for taking leave (যেমন: পারিবারিক জরুরি কাজ / অসুস্থতার কারণে)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* 7. Image 5: Address during leave & Substitute Employee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ছুটিতে থাকাকালীন সময়ে ঠিকানা ও মোবাইল (Contact Address)
                  </label>
                  <input
                    type="text"
                    placeholder="Residential address / phone number"
                    value={leaveAddress}
                    onChange={(e) => setLeaveAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বদলী কর্মীর নাম (Substitute / Reliever Employee)
                  </label>
                  <input
                    type="text"
                    placeholder="Colleague taking responsibility..."
                    value={substituteName}
                    onChange={(e) => setSubstituteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 8. Initial Status Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Approval Status (অনুমোদনের অবস্থা)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      leaveStatus === 'APPROVED'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="leaveStatus"
                      checked={leaveStatus === 'APPROVED'}
                      onChange={() => setLeaveStatus('APPROVED')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs">Direct Approved (স্বয়ংক্রিয় অনুমোদন)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      leaveStatus === 'PENDING'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="leaveStatus"
                      checked={leaveStatus === 'PENDING'}
                      onChange={() => setLeaveStatus('PENDING')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs">Under Review (অনুমোদনের জন্য অপেক্ষমাণ)</span>
                  </label>
                </div>
              </div>

              {/* 9. Official Guidelines Footnotes (Image 5) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  বিদ্যালয় ছুটির নীতিমালা (Official YWCA Rules):
                </div>
                <div>• নৈমিত্তিক ছুটির ক্ষেত্রে ২ (দুই) কার্যদিবসের পূর্বে আবেদন করিতে হইবে। জরুরী প্রয়োজনে, ছুটি ভোগের ৩ দিনের মধ্যে আবেদন পত্র জমা দিতে হইবে।</div>
                <div>• বাৎসরিক ছুটির ক্ষেত্রে ৭ (সাত) কার্যদিবসের পূর্বে আবেদন করিতে হইবে।</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/15 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Application...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Submit Leave Request / আবেদন জমা দিন
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* OFFICIAL LEAVE APPLICATION PRINT LAYOUT (Image 4 exact replica for print) */}
      <div id="official-leave-print-area" className="hidden print:block text-slate-950 bg-white font-bangla text-xs">
        <style jsx global>{`
          @media print {
            @page {
              margin: 10px;
              size: A4 portrait;
            }
            body * {
              visibility: hidden;
            }
            #official-leave-print-area, #official-leave-print-area * {
              visibility: visible;
            }
            #official-leave-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 10px;
              background: white !important;
              color: black !important;
            }
          }
        `}</style>

        <div className="border border-slate-900 p-6 space-y-4">
          {/* Header matching Image 4 & Staff Attendance Register Details */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="YWCA Logo" className="w-14 h-14 object-contain" />
              <div>
                <h1 className="text-xl font-black font-bangla tracking-wide text-slate-950">
                  পাবনা ওয়াই ডাব্লিউ সি এ
                </h1>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  YOUNG WOMEN&apos;S CHRISTIAN ASSOCIATION (YWCA), PABNA
                </h2>
                <p className="text-[10px] text-slate-700">
                  Mission House, Dakshin Raghabpur, Pabna, Bangladesh
                </p>
                <p className="text-[9px] text-slate-600 font-mono">
                  Phone: 01717644822, 02588845479 • Email: ywca.pabna@yahoo.com
                </p>
              </div>
            </div>

            <div className="text-right border border-slate-900 px-3 py-1 font-mono text-[10px] font-bold">
              OFFICIAL LEAVE FORM
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-base font-black underline underline-offset-4 font-bangla tracking-wider">
              ছুটির আবেদনপত্র
            </h2>
          </div>

          {/* Program / Dept & Date */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="font-bold">প্রোগ্রাম / ডিপার্টমেন্ট :</span>
              <span className="border border-slate-800 px-3 py-1 min-w-[200px] inline-block font-semibold">
                {activePrintTarget.empDesignation}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">তারিখ :</span>
              <span className="border-b border-dotted border-slate-800 min-w-[120px] inline-block font-mono text-center">
                {activePrintTarget.appliedDate}
              </span>
            </div>
          </div>

          {/* Section: কর্মী কর্তৃক পূরণ করিতে হইবে */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-xs underline">কর্মী কর্তৃক পূরণ করিতে হইবে :</div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">নাম :</span>
                <span className="border-b border-dotted border-slate-800 flex-1 font-bold">
                  {activePrintTarget.empName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">পদবী :</span>
                <span className="border-b border-dotted border-slate-800 flex-1">
                  {activePrintTarget.empDesignation}
                </span>
              </div>
            </div>

            {/* Leave Type Checkboxes matching Image 4 */}
            <div className="flex items-center gap-3 pt-1">
              <span className="font-semibold">ছুটির ধরন : (টিক চিহ্ন দিন ✓)</span>
              <div className="flex items-center gap-3">
                <div className="border border-slate-900 px-3 py-1 text-center font-bold">
                  বাৎসরিক [ {activePrintTarget.leaveType.toLowerCase().includes('annual') || activePrintTarget.leaveType.includes('বাৎসরিক') ? '✓' : ' '} ]
                </div>
                <div className="border border-slate-900 px-3 py-1 text-center font-bold">
                  অসুস্থতাজনিত [ {activePrintTarget.leaveType.toLowerCase().includes('sick') || activePrintTarget.leaveType.includes('medical') || activePrintTarget.leaveType.includes('অসুস্থ') ? '✓' : ' '} ]
                </div>
                <div className="border border-slate-900 px-3 py-1 text-center font-bold">
                  নৈমিত্তিক [ {activePrintTarget.leaveType.toLowerCase().includes('casual') || activePrintTarget.leaveType.includes('নৈমিত্তিক') ? '✓' : ' '} ]
                </div>
                <div className="border border-slate-900 px-3 py-1 text-center font-bold">
                  অন্যান্য [ {!activePrintTarget.leaveType.toLowerCase().includes('annual') && !activePrintTarget.leaveType.toLowerCase().includes('sick') && !activePrintTarget.leaveType.toLowerCase().includes('casual') && !activePrintTarget.leaveType.includes('বাৎসরিক') && !activePrintTarget.leaveType.includes('অসুস্থ') && !activePrintTarget.leaveType.includes('নৈমিত্তিক') ? '✓' : ' '} ]
                </div>
              </div>
            </div>

            {/* Duration and Dates */}
            <div className="flex items-center gap-2 pt-1">
              <span className="font-semibold">কতদিনের জন্য :</span>
              <span className="border-b border-dotted border-slate-800 min-w-[80px] text-center font-bold font-mono">
                {activePrintTarget.durationDays}
              </span>
              <span className="font-semibold ml-2">থেকে :</span>
              <span className="border-b border-dotted border-slate-800 min-w-[120px] text-center font-mono">
                {activePrintTarget.startDate}
              </span>
              <span className="font-semibold ml-2">পর্যন্ত :</span>
              <span className="border-b border-dotted border-slate-800 min-w-[120px] text-center font-mono">
                {activePrintTarget.endDate}
              </span>
            </div>

            {/* Reason */}
            <div className="pt-1">
              <span className="font-semibold">বিশেষ প্রয়োজনে ছুটি (কারণ) :</span>
              <div className="border-b border-dotted border-slate-800 min-h-[36px] pt-1">
                {activePrintTarget.reason}
              </div>
            </div>

            {/* Address during leave */}
            <div className="pt-1 flex items-center gap-2">
              <span className="font-semibold">ছুটিতে থাকাকালীন সময়ে ঠিকানা ও মোবাইল :</span>
              <span className="border-b border-dotted border-slate-800 flex-1">
                {activePrintTarget.leaveAddress}
              </span>
            </div>

            <div className="text-right pt-4">
              <span className="border-t border-slate-800 pt-1 font-bold inline-block min-w-[160px] text-center">
                কর্মীর স্বাক্ষর
              </span>
            </div>
          </div>

          {/* Section: ছুটির হিসাব (Table matching Image 4) */}
          <div className="pt-2 space-y-2">
            <div className="font-bold text-xs underline">ছুটির হিসাব :</div>
            <div className="flex items-end justify-between gap-4">
              <table className="border-collapse border border-slate-900 text-center text-[11px] flex-1">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 font-bold">
                    <th className="border-r border-slate-900 py-1.5 px-2">বাৎসরিক (২১ দিন)</th>
                    <th className="border-r border-slate-900 py-1.5 px-2">অসুস্থতাজনিত (১৪ দিন)</th>
                    <th className="border-r border-slate-900 py-1.5 px-2">নৈমিত্তিক (১০ দিন)</th>
                    <th className="py-1.5 px-2">অন্যান্য</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-900 font-mono text-[10px]">
                    <td className="border-r border-slate-900 py-2">ভোগকৃত: {activePrintTarget.annualUsed} দিন</td>
                    <td className="border-r border-slate-900 py-2">ভোগকৃত: {activePrintTarget.sickUsed} দিন</td>
                    <td className="border-r border-slate-900 py-2">ভোগকৃত: {activePrintTarget.casualUsed} দিন</td>
                    <td className="py-2">ভোগকৃত: {activePrintTarget.otherUsed} দিন</td>
                  </tr>
                  <tr className="font-mono text-[10px] font-bold">
                    <td className="border-r border-slate-900 py-2">অবশিষ্ট: {activePrintTarget.annualRemaining} দিন</td>
                    <td className="border-r border-slate-900 py-2">অবশিষ্ট: {activePrintTarget.sickRemaining} দিন</td>
                    <td className="border-r border-slate-900 py-2">অবশিষ্ট: {activePrintTarget.casualRemaining} দিন</td>
                    <td className="py-2">—</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-center min-w-[200px] border-t border-slate-800 pt-1 text-[10px] font-semibold">
                স্বাক্ষর ও তারিখ, (এইচ আর-এর দায়িত্ব প্রাপ্ত কর্মীর পদবী)
              </div>
            </div>
          </div>

          {/* Section: প্রোগ্রাম / ডিপার্টমেন্ট-এর দায়িত্বপ্রাপ্ত ব্যক্তি কর্তৃক পূরণ করিতে হইবে */}
          <div className="pt-3 space-y-3">
            <div className="font-bold text-xs underline">
              প্রোগ্রাম / ডিপার্টমেন্ট-এর দায়িত্বপ্রাপ্ত ব্যক্তি কর্তৃক পূরণ করিতে হইবে :
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">বদলী কর্মীর নাম :</span>
              <span className="border-b border-dotted border-slate-800 flex-1">
                {activePrintTarget.substituteName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
              <div>
                <div className="border-t border-slate-800 pt-1 font-bold">সুপারিশকারী</div>
                <div className="text-[10px] text-slate-500 mt-0.5">প্রোগ্রাম / ডিপার্টমেন্ট দায়িত্বপ্রাপ্ত ব্যক্তি</div>
                <div className="text-[10px] text-slate-400 mt-0.5">তারিখ : ________________</div>
              </div>

              <div>
                <div className="border-t border-slate-800 pt-1 font-bold">অনুমোদনকারী</div>
                <div className="text-[10px] text-slate-500 mt-0.5">অধ্যক্ষ / শাখা প্রধান</div>
                <div className="text-[10px] text-slate-400 mt-0.5">তারিখ : ________________</div>
              </div>

              <div>
                <div className="border-t border-slate-800 pt-1 font-bold">সাধারণ সম্পাদিকা</div>
                <div className="text-[10px] text-slate-500 mt-0.5">ওয়াই ডাব্লিউ সি এ, পাবনা</div>
                <div className="text-[10px] text-slate-400 mt-0.5">তারিখ : ________________</div>
              </div>
            </div>

            {/* Note */}
            <div className="pt-1">
              <span className="font-semibold">নোট :</span>
              <div className="border-b border-dotted border-slate-800 min-h-[24px]">&nbsp;</div>
            </div>

            {/* Final approval sentence */}
            <div className="pt-1 text-xs leading-relaxed">
              বাৎসরিক / অসুস্থতাজনিত নৈমিত্তিক / অন্যান্য ছুটি অনুমোদন করা হইল : ________________ দিন, ________________ থেকে ________________ পর্যন্ত।
            </div>

            <div className="flex items-center justify-between pt-4 text-[10px]">
              <div>তারিখ : ________________</div>
              <div className="text-center min-w-[200px] border-t border-slate-800 pt-1">
                (এইচ আর-এর দায়িত্ব প্রাপ্ত কর্মীর পদবী)
              </div>
            </div>

            {/* Institutional Rules bullet points */}
            <div className="border-t border-slate-300 pt-2 text-[9px] text-slate-600 space-y-0.5">
              <div>• নৈমিত্তিক ছুটির ক্ষেত্রে ২ (দুই) কার্যদিবসের পূর্বে আবেদন করিতে হইবে; জরুরী প্রয়োজনে, ছুটি ভোগের ৩ দিনের মধ্যে আবেদন পত্র জমা দিতে হইবে।</div>
              <div>• বাৎসরিক ছুটির ক্ষেত্রে ৭ (সাত) কার্যদিবসের পূর্বে আবেদন করিতে হইবে।</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Leave Application"
        message="Are you sure you want to delete this leave record?"
        itemName={deleteModal.name}
      />
    </div>
  );
}
