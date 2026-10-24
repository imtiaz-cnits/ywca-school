'use client';

import FlatpickrCalendar from '@/components/FlatpickrCalendar';
import { TablePagination, TableTopControls, useTableControls } from '@/components/TableControls';
import { APP_CONFIG, ATTENDANCE_STATUS_LABELS } from '@/lib/constants';
import { format } from 'date-fns';
import {
    AlertCircle,
    Check,
    Clock,
    Edit2,
    Eye,
    Fingerprint,
    Printer,
    RefreshCw,
    Search,
    UserCheck,
    UserX,
    X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

export default function StaffAttendancePage() {
  const [date, setDate] = useState(format(new Date(), 'dd-MM-yyyy'));
  const [type, setType] = useState<'TEACHER' | 'STAFF' | ''>('');

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    underReview: 0,
    absent: 0,
    excused: 0,
  });

  // Manual Time Adjustment Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [manualInTime, setManualInTime] = useState('08:30 AM');
  const [manualOutTime, setManualOutTime] = useState('02:00 PM');
  const [manualStatus, setManualStatus] = useState<string>('PRESENT');
  const [manualRemark, setManualRemark] = useState('');
  const [savingManual, setSavingManual] = useState(false);

  // Web View Print Preview Modal State
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    searchTerm,
    setSearchTerm,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    paginatedData: paginatedReport,
    totalEntries,
    totalPages,
    startIndex,
    endIndex,
  } = useTableControls({
    data: report,
    initialPageSize: 10,
    filterFn: (item, q) =>
      Boolean(
        item.name?.toLowerCase().includes(q) ||
        item.employeeCode?.toLowerCase().includes(q) ||
        item.designation?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q) ||
        item.leaveType?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q)
      ),
  });

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('date', date);
      if (type) params.append('type', type);

      const res = await fetch(`/api/attendance/employee?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.report || []);
        setSummary(
          data.summary || {
            total: 0,
            present: 0,
            late: 0,
            underReview: 0,
            absent: 0,
            excused: 0,
          }
        );
      }
    } catch {
      toast.error('Failed to load employee attendance');
    } finally {
      setLoading(false);
    }
  }, [date, type]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const displayDateText = useMemo(() => {
    if (!date) return '';
    const parseAny = (s: string) => {
      const match = s.trim().match(/^(\d{2})-(\d{2})-(\d{4})/);
      if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
      return new Date(s);
    };
    if (date.includes(' to ')) {
      const [start, end] = date.split(' to ');
      try {
        return `${format(parseAny(start), 'dd MMM yyyy')} to ${format(parseAny(end), 'dd MMM yyyy')}`;
      } catch {
        return date;
      }
    }
    try {
      return format(parseAny(date), 'dd MMMM yyyy (EEEE)');
    } catch {
      return date;
    }
  }, [date]);

  // Open Manual Entry Modal
  const openManualModal = (item: any) => {
    setSelectedStaff(item);
    setManualInTime(item.inTime && item.inTime !== '-' ? item.inTime : '08:30 AM');
    setManualOutTime(item.outTime && item.outTime !== '-' ? item.outTime : '02:00 PM');
    setManualStatus(item.status === 'UNDER_REVIEW' ? 'PRESENT' : item.status || 'PRESENT');
    setManualRemark(item.remark || '');
    setManualModalOpen(true);
  };

  // Save Manual Attendance
  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    // Determine target single date string
    let targetDate = date;
    if (date.includes(' to ')) {
      targetDate = date.split(' to ')[0].trim();
    }

    try {
      setSavingManual(true);
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: targetDate,
          type: 'EMPLOYEE',
          items: [
            {
              employeeId: selectedStaff.employeeId,
              inTime: manualInTime.trim() === '' || manualInTime === '-' ? null : manualInTime.trim(),
              outTime: manualOutTime.trim() === '' || manualOutTime === '-' ? null : manualOutTime.trim(),
              status: manualStatus,
              remark: manualRemark.trim() || null,
            },
          ],
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        toast.error(resData.message || 'Failed to update attendance');
        return;
      }

      toast.success(`Attendance updated for ${selectedStaff.name}`);
      setManualModalOpen(false);
      fetchAttendance();
    } catch (err: any) {
      toast.error(err.message || 'Network error saving attendance');
    } finally {
      setSavingManual(false);
    }
  };

  const handlePrint = () => {
    setShowPrintPreview(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6 print:space-y-0 print:m-0 print:p-0 print:w-full">
      {/* Top Controls */}
      <div className="no-print space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-indigo-600" />
              Teachers & Staff Attendance Sheet
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily staff biometric check-in & check-out logs with automated shift validation.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowPrintPreview(true)}
              disabled={report.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all disabled:opacity-40 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print Staff Register
            </button>
          </div>
        </div>

        {/* Schedule & Timing Info Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Fixed Staff Schedule:
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span className="text-slate-400 font-medium">In-Time:</span>
              <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">08:30 AM</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span className="text-slate-400 font-medium">Out-Time:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">02:00 PM</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300">
              <span className="text-amber-600 dark:text-amber-400 font-medium">Late Threshold:</span>
              <span className="font-mono font-bold">After 08:35 AM (5 min grace)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            Click on any <span className="font-semibold text-purple-600">Under Review</span> or <span className="font-semibold text-slate-700 dark:text-slate-300">missing punch</span> to adjust manually.
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs max-w-xl">
            <div>
              <FlatpickrCalendar
                mode="range"
                value={date}
                onChange={(val) => setDate(val)}
                placeholder="Select date or range..."
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Employees (Teachers & Staff)</option>
              <option value="TEACHER">Teachers Only</option>
              <option value="STAFF">General Staff Only</option>
            </select>

            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              View Register
            </button>
          </div>
        </div>

        {/* Summary Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-slate-400 block font-medium">Total Employees</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{summary.total}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-emerald-600 block font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Present
            </span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {summary.present}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-amber-600 block font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Late
            </span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-400">
              {summary.late}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-purple-600 block font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Under Review
            </span>
            <span className="text-xl font-bold text-purple-700 dark:text-purple-400">
              {summary.underReview || 0}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-rose-600 block font-medium flex items-center gap-1">
              <UserX className="w-3.5 h-3.5" /> Absent
            </span>
            <span className="text-xl font-bold text-rose-700 dark:text-rose-400">
              {summary.absent}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] text-indigo-600 block font-medium">Attendance Rate</span>
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
              {summary.total > 0
                ? Math.round(((summary.present + summary.late) / summary.total) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Screen View: Modern Clean Data Table */}
      <div className="print:hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Staff Attendance Register
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {report.length} {report.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing logs for {displayDateText}
          </div>
        </div>

        <TableTopControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalEntries={totalEntries}
          searchPlaceholder="Search staff name, code, designation, status, leave type..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Code</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Staff Name</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Designation</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Type</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">In-Time</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Out-Time</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Leave Type</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Phone</th>
                <th className="px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[14px]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-indigo-600" />
                    Loading staff attendance...
                  </td>
                </tr>
              ) : paginatedReport.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400">
                    {searchTerm ? 'No matching staff attendance records found.' : 'No staff records found for selected criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedReport.map((item) => {
                  const statusInfo = ATTENDANCE_STATUS_LABELS[item.status] || {
                    label: item.status,
                    color: 'bg-slate-100 text-slate-600',
                  };
                  const isMissingTime = !item.inTime || item.inTime === '-' || !item.outTime || item.outTime === '-';
                  const isUnderReview = item.status === 'UNDER_REVIEW';

                  return (
                    <tr key={item.employeeId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-medium text-indigo-600 dark:text-indigo-400 border-r border-slate-200 dark:border-slate-800">
                        {item.employeeCode}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800">
                        {item.name}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                        {item.designation}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 border-r border-slate-200 dark:border-slate-800">
                        {item.type}
                      </td>
                      <td className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => openManualModal(item)}
                          title="Click to adjust status/time"
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border cursor-pointer hover:opacity-80 transition-opacity ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 font-mono border-r border-slate-200 dark:border-slate-800">
                        {item.inTime && item.inTime !== '-' ? (
                          <span className="text-slate-800 dark:text-slate-200">{item.inTime}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openManualModal(item)}
                            title="Set In-Time manually"
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600 text-xs cursor-pointer"
                          >
                            <span>-</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-50" />
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono border-r border-slate-200 dark:border-slate-800">
                        {item.outTime && item.outTime !== '-' ? (
                          <span className="text-slate-800 dark:text-slate-200">{item.outTime}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openManualModal(item)}
                            title="Set Out-Time manually"
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600 text-xs cursor-pointer"
                          >
                            <span>-</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-50" />
                          </button>
                        )}
                      </td>
                      {/* Leave Type Column */}
                      <td className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">
                        {item.leaveType && item.leaveType !== '-' ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                            {item.leaveType}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                        {item.phone}
                      </td>
                      {/* Action: Manual Punch / Adjust Time */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openManualModal(item)}
                          title="Adjust punch times / status"
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isUnderReview || isMissingTime
                              ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Manual</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      {/* Manual Attendance Modal */}
      {mounted && manualModalOpen && selectedStaff && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Manual Attendance & Punch
                </h3>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="p-5 space-y-4">
              {/* Staff Details Banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedStaff.name}
                  </span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedStaff.employeeCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 mt-1 text-[11px]">
                  <span>{selectedStaff.designation}</span>
                  <span>Date: {displayDateText}</span>
                </div>
              </div>

              {/* Quick Fill Button */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Quick Preset:</span>
                <button
                  type="button"
                  onClick={() => {
                    setManualInTime('08:30 AM');
                    setManualOutTime('02:00 PM');
                    setManualStatus('PRESENT');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[11px] transition-colors"
                >
                  Standard Full Day (08:30 AM - 02:00 PM)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* In-Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Check-in Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 08:30 AM"
                      value={manualInTime}
                      onChange={(e) => setManualInTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setManualInTime('08:30 AM')}
                      className="text-[10px] text-indigo-600 hover:underline"
                    >
                      08:30 AM
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => setManualInTime('')}
                      className="text-[10px] text-slate-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Out-Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Check-out Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 02:00 PM"
                      value={manualOutTime}
                      onChange={(e) => setManualOutTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setManualOutTime('02:00 PM')}
                      className="text-[10px] text-indigo-600 hover:underline"
                    >
                      02:00 PM
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => setManualOutTime('')}
                      className="text-[10px] text-slate-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attendance Status
                </label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE (After 08:35 AM)</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW (Missing punch)</option>
                  <option value="EXCUSED">EXCUSED (Approved Leave)</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remark / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approved manual adjustment / missed biometric scan"
                  value={manualRemark}
                  onChange={(e) => setManualRemark(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingManual}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingManual ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Punch & Status
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Web View Print Preview Modal */}
      {mounted && showPrintPreview && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Staff Attendance Sheet - Print Preview
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  ({report.length} staff records)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/15 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Now
                </button>
              </div>
            </div>

            {/* Modal Body: A4 Paper Representation */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60">
              <div className="max-w-4xl mx-auto bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 text-xs font-sans">
                {/* Official Letterhead */}
                <div className="border-b-2 border-slate-900 pb-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo.svg" alt="YWCA Logo" className="w-12 h-12 object-contain" />
                      <div>
                        <h1 className="text-lg font-black uppercase tracking-wide text-slate-950 leading-tight">
                          Young Women&apos;s Christian Association (YWCA), Pabna
                        </h1>
                        <p className="text-[11px] text-slate-700 font-medium">
                          Mission House, Dakshin Raghabpur, Pabna, Bangladesh
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          Phone: 01717644822, 02588845479 • Email: ywca.pabna@yahoo.com
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 border border-slate-900 text-slate-950 text-[10px] font-bold uppercase tracking-wider rounded">
                        OFFICIAL REPORT
                      </span>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                        Printed: {format(new Date(), 'dd/MM/yyyy hh:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-300 flex items-center justify-between text-xs">
                    <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-950">
                      DAILY TEACHERS & STAFF ATTENDANCE REGISTER
                    </h2>
                    <div className="text-[11px] text-slate-700">
                      <span>Date: <strong className="text-slate-950">{displayDateText}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Summary Strip */}
                <div className="mb-3">
                  <table className="w-full text-xs border border-slate-900 text-center border-collapse bg-white">
                    <thead>
                      <tr className="text-slate-950 font-bold uppercase text-[9px] tracking-wider border-b border-slate-900 bg-white">
                        <th className="py-1 px-1 border-r border-slate-900">Total Staff</th>
                        <th className="py-1 px-1 border-r border-slate-900 text-emerald-800">Present</th>
                        <th className="py-1 px-1 border-r border-slate-900 text-amber-800">Late</th>
                        <th className="py-1 px-1 border-r border-slate-900 text-purple-800">Under Review</th>
                        <th className="py-1 px-1 border-r border-slate-900 text-rose-800">Absent</th>
                        <th className="py-1 px-1 border-r border-slate-900">Excused</th>
                        <th className="py-1 px-1 text-indigo-950">Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold text-slate-950 text-[11px] bg-white">
                        <td className="py-1 px-1 border-r border-slate-900 font-mono">{summary.total}</td>
                        <td className="py-1 px-1 border-r border-slate-900 font-mono text-emerald-700">{summary.present}</td>
                        <td className="py-1 px-1 border-r border-slate-900 font-mono text-amber-700">{summary.late}</td>
                        <td className="py-1 px-1 border-r border-slate-900 font-mono text-purple-700">{summary.underReview || 0}</td>
                        <td className="py-1 px-1 border-r border-slate-900 font-mono text-rose-700">{summary.absent}</td>
                        <td className="py-1 px-1 border-r border-slate-900 font-mono text-slate-600">{summary.excused}</td>
                        <td className="py-1 px-1 font-mono text-indigo-950 font-extrabold">
                          {summary.total > 0
                            ? Math.round(((summary.present + summary.late) / summary.total) * 100)
                            : 0}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Print Preview Table */}
                <table className="w-full text-left text-xs border border-slate-900 border-collapse bg-white">
                  <thead>
                    <tr className="text-slate-950 font-bold uppercase text-[9px] tracking-wider border-b border-slate-900 bg-white">
                      <th className="py-1.5 px-1 border-r border-slate-900 text-center w-8">SL</th>
                      <th className="py-1.5 px-1.5 border-r border-slate-900 w-18">Code</th>
                      <th className="py-1.5 px-2.5 border-r border-slate-900">Staff Name</th>
                      <th className="py-1.5 px-2 border-r border-slate-900">Designation</th>
                      <th className="py-1.5 px-1.5 border-r border-slate-900 text-center w-14">Type</th>
                      <th className="py-1.5 px-2 border-r border-slate-900 text-center w-20">In-Time</th>
                      <th className="py-1.5 px-2 border-r border-slate-900 text-center w-20">Out-Time</th>
                      <th className="py-1.5 px-2 border-r border-slate-900 text-center w-20">Leave Type</th>
                      <th className="py-1.5 px-2 text-center w-22">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4 text-slate-500 border border-slate-900 bg-white">
                          No staff records found for this date.
                        </td>
                      </tr>
                    ) : (
                      report.map((item, idx) => (
                        <tr key={item.employeeId} className="border-b border-slate-800 text-[10px] leading-tight bg-white">
                          <td className="py-1 px-1 border-r border-slate-800 text-center font-mono text-[10px]">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-1.5 border-r border-slate-800 font-mono font-semibold text-[10px]">
                            {item.employeeCode}
                          </td>
                          <td className="py-1 px-2.5 border-r border-slate-800 font-bold text-slate-950">
                            {item.name}
                          </td>
                          <td className="py-1 px-2 border-r border-slate-800 text-slate-800">
                            {item.designation}
                          </td>
                          <td className="py-1 px-1.5 border-r border-slate-800 text-center text-[9px] font-semibold text-slate-600 uppercase">
                            {item.type}
                          </td>
                          <td className="py-1 px-2 border-r border-slate-800 text-center font-mono font-semibold text-[10px]">
                            {item.inTime || '-'}
                          </td>
                          <td className="py-1 px-2 border-r border-slate-800 text-center font-mono font-semibold text-[10px]">
                            {item.outTime || '-'}
                          </td>
                          {/* Leave Type Dynamic Column */}
                          <td className="py-1 px-2 border-r border-slate-800 text-center font-semibold text-[10px] text-purple-700">
                            {item.leaveType || '-'}
                          </td>
                          {/* Status: Red/colored on preview, printed in crisp black and white */}
                          <td className="py-1 px-2 text-center font-bold text-[10px] uppercase">
                            <span
                              className={`print-status-bw ${
                                item.status === 'PRESENT'
                                  ? 'text-emerald-700'
                                  : item.status === 'LATE'
                                  ? 'text-amber-700'
                                  : item.status === 'UNDER_REVIEW'
                                  ? 'text-purple-700'
                                  : item.status === 'EXCUSED'
                                  ? 'text-sky-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Bottom Signatures: Only Prepared By, Checked By, Approved By */}
                <div className="w-full mt-10 pt-6">
                  <div className="flex items-end justify-between text-center text-xs">
                    <div className="w-48">
                      <div className="border-t border-slate-900 pt-1 font-bold text-slate-950 text-[11px]">
                        Prepared By
                      </div>
                    </div>
                    <div className="w-48">
                      <div className="border-t border-slate-900 pt-1 font-bold text-slate-950 text-[11px]">
                        Checked By
                      </div>
                    </div>
                    <div className="w-48">
                      <div className="border-t border-slate-900 pt-1 font-bold text-slate-950 text-[11px]">
                        Approved By
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Print View: Full-Width Professional Attendance Report for window.print() */}
      <div className="hidden print:flex print-page-layout w-full m-0 p-0 text-slate-950 bg-white">
        {/* Top Section: Header, Summary & Tabular Register */}
        <div className="w-full">
          {/* Official Header & Letterhead */}
          <div className="border-b-2 border-slate-900 pb-2 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="YWCA Logo" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-lg font-black uppercase tracking-wide text-slate-950 leading-tight">
                    Young Women&apos;s Christian Association (YWCA), Pabna
                  </h1>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Mission House, Dakshin Raghabpur, Pabna, Bangladesh
                  </p>
                  <p className="text-[9px] text-slate-600 mt-0.5">
                    Phone: 01717644822, 02588845479 • Email: ywca.pabna@yahoo.com
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 border border-slate-900 text-slate-950 text-[10px] font-bold uppercase tracking-wider rounded">
                  Official Report
                </span>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                  Printed: {format(new Date(), 'dd/MM/yyyy hh:mm a')}
                </p>
              </div>
            </div>

            <div className="mt-1.5 pt-1.5 border-t border-slate-300 flex items-center justify-between text-xs">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-950">
                Daily Teachers & Staff Attendance Register
              </h2>
              <div className="text-[11px] text-slate-700">
                <span>Date: <strong className="text-slate-950">{displayDateText}</strong></span>
              </div>
            </div>
          </div>

          {/* Executive Attendance Summary Strip */}
          <div className="mb-2">
            <table className="w-full text-xs border border-slate-900 text-center border-collapse bg-white">
              <thead>
                <tr className="text-slate-950 font-bold uppercase text-[9px] tracking-wider border-b border-slate-900 bg-white">
                  <th className="py-0.5 px-1 border-r border-slate-900">Total Staff</th>
                  <th className="py-0.5 px-1 border-r border-slate-900">Present</th>
                  <th className="py-0.5 px-1 border-r border-slate-900">Late</th>
                  <th className="py-0.5 px-1 border-r border-slate-900">Under Review</th>
                  <th className="py-0.5 px-1 border-r border-slate-900">Absent</th>
                  <th className="py-0.5 px-1 border-r border-slate-900">Excused</th>
                  <th className="py-0.5 px-1">Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold text-slate-950 text-[11px] bg-white">
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono">{summary.total}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono">{summary.present}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono">{summary.late}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono">{summary.underReview || 0}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono">{summary.absent}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono">{summary.excused}</td>
                  <td className="py-0.5 px-1 font-mono font-extrabold">
                    {summary.total > 0
                      ? Math.round(((summary.present + summary.late) / summary.total) * 100)
                      : 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabular Attendance Register with Leave Type Column */}
          <table className="w-full text-left text-xs border border-slate-900 border-collapse bg-white">
            <thead>
              <tr className="text-slate-950 font-bold uppercase text-[9px] tracking-wider border-b border-slate-900 bg-white">
                <th className="py-1 px-1 border-r border-slate-900 text-center w-8">SL</th>
                <th className="py-1 px-1.5 border-r border-slate-900 w-18">Code</th>
                <th className="py-1 px-2.5 border-r border-slate-900">Staff Name</th>
                <th className="py-1 px-2 border-r border-slate-900">Designation</th>
                <th className="py-1 px-1.5 border-r border-slate-900 text-center w-14">Type</th>
                <th className="py-1 px-2 border-r border-slate-900 text-center w-20">In-Time</th>
                <th className="py-1 px-2 border-r border-slate-900 text-center w-20">Out-Time</th>
                <th className="py-1 px-2 border-r border-slate-900 text-center w-20">Leave Type</th>
                <th className="py-1 px-2 text-center w-22">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-slate-500 border border-slate-900 bg-white">
                    No staff records found for this date.
                  </td>
                </tr>
              ) : (
                report.map((item, idx) => (
                  <tr key={item.employeeId} className="border-b border-slate-800 text-[10px] leading-tight bg-white">
                    <td className="py-0.5 px-1 border-r border-slate-800 text-center font-mono text-[10px]">
                      {idx + 1}
                    </td>
                    <td className="py-0.5 px-1.5 border-r border-slate-800 font-mono font-semibold text-[10px]">
                      {item.employeeCode}
                    </td>
                    <td className="py-0.5 px-2.5 border-r border-slate-800 font-bold text-slate-950">
                      {item.name}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-800 text-slate-800">
                      {item.designation}
                    </td>
                    <td className="py-0.5 px-1.5 border-r border-slate-800 text-center text-[9px] font-semibold text-slate-600 uppercase">
                      {item.type}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-800 text-center font-mono font-semibold text-[10px]">
                      {item.inTime || '-'}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-800 text-center font-mono font-semibold text-[10px]">
                      {item.outTime || '-'}
                    </td>
                    {/* Dynamic Leave Type */}
                    <td className="py-0.5 px-2 border-r border-slate-800 text-center font-semibold text-[10px]">
                      {item.leaveType || '-'}
                    </td>
                    {/* Status: Black and white in printed document */}
                    <td className="py-0.5 px-2 text-center font-bold text-[10px] uppercase print-status-bw text-black">
                      {item.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Always anchored flush at the page bottom */}
        <div className="w-full print-footer-anchor mt-auto pt-4 pb-0 mb-0">
          {/* Signatures: Only Prepared By, Checked By, Approved By */}
          <div className="flex items-end justify-between text-center text-xs pb-0 mb-0">
            <div className="w-48">
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-950 text-[11px]">
                Prepared By
              </div>
            </div>
            <div className="w-48">
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-950 text-[11px]">
                Checked By
              </div>
            </div>
            <div className="w-48">
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-950 text-[11px]">
                Approved By
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


