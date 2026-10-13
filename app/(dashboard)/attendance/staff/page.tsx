'use client';

import { APP_CONFIG, ATTENDANCE_STATUS_LABELS } from '@/lib/constants';
import { format } from 'date-fns';
import {
    AlertCircle,
    Clock,
    Fingerprint,
    Printer,
    RefreshCw,
    Search,
    UserCheck,
    UserX
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StaffAttendancePage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
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

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('date', date);
      if (type) params.append('type', type);

      const res = await fetch(`/api/attendance/employee?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setSummary(data.summary);
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

  const handlePrint = () => {
    window.print();
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
              Daily staff biometric check-in & check-out logs.
            </p>
          </div>

          <button
            onClick={handlePrint}
            disabled={report.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Staff Register
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs max-w-xl">
            <div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
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

      {/* Screen View: Modern Clean Data Table (Branding Removed) */}
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
            Showing logs for {format(new Date(date), 'dd MMMM yyyy (EEEE)')}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Code</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Staff Name</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Designation</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Type</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Status</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">In-Time</th>
                <th className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800">Out-Time</th>
                <th className="px-3 py-2.5">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-indigo-600" />
                    Loading staff attendance...
                  </td>
                </tr>
              ) : report.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No staff records found for selected criteria.
                  </td>
                </tr>
              ) : (
                report.map((item) => {
                  const statusInfo = ATTENDANCE_STATUS_LABELS[item.status] || {
                    label: item.status,
                    color: 'bg-slate-100 text-slate-600',
                  };
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
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                        {item.inTime}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                        {item.outTime}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-400">
                        {item.phone}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print View: Ultra-Clean Full-Width Professional Attendance Report */}
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
                    {APP_CONFIG.name}
                  </h1>
                  <p className="text-[11px] text-slate-700 font-medium">
                    {APP_CONFIG.address}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Phone: {APP_CONFIG.phone} • Email: {APP_CONFIG.email}
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
                <span>Date: <strong className="text-slate-950">{format(new Date(date), 'dd MMMM yyyy (EEEE)')}</strong></span>
              </div>
            </div>
          </div>

          {/* Executive Attendance Summary Strip (No filled backgrounds) */}
          <div className="mb-2">
            <table className="w-full text-xs border border-slate-900 text-center border-collapse bg-white">
              <thead>
                <tr className="text-slate-950 font-bold uppercase text-[9px] tracking-wider border-b border-slate-900 bg-white">
                  <th className="py-0.5 px-1 border-r border-slate-900">Total Staff</th>
                  <th className="py-0.5 px-1 border-r border-slate-900 text-emerald-800">Present</th>
                  <th className="py-0.5 px-1 border-r border-slate-900 text-amber-800">Late</th>
                  <th className="py-0.5 px-1 border-r border-slate-900 text-purple-800">Under Review</th>
                  <th className="py-0.5 px-1 border-r border-slate-900 text-rose-800">Absent</th>
                  <th className="py-0.5 px-1 border-r border-slate-900">Excused</th>
                  <th className="py-0.5 px-1 text-indigo-950">Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold text-slate-950 text-[11px] bg-white">
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono">{summary.total}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono text-emerald-700">{summary.present}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono text-amber-700">{summary.late}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono text-purple-700">{summary.underReview || 0}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono text-rose-700">{summary.absent}</td>
                  <td className="py-0.5 px-1 border-r border-slate-900 font-mono text-slate-600">{summary.excused}</td>
                  <td className="py-0.5 px-1 font-mono text-indigo-950 font-extrabold">
                    {summary.total > 0
                      ? Math.round(((summary.present + summary.late) / summary.total) * 100)
                      : 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabular Attendance Register (Signature column removed, full width, borderless status) */}
          <table className="w-full text-left text-xs border border-slate-900 border-collapse bg-white">
            <thead>
              <tr className="text-slate-950 font-bold uppercase text-[9px] tracking-wider border-b border-slate-900 bg-white">
                <th className="py-1 px-1 border-r border-slate-900 text-center w-10">SL</th>
                <th className="py-1 px-1.5 border-r border-slate-900 w-20">Code</th>
                <th className="py-1 px-2.5 border-r border-slate-900">Staff Name</th>
                <th className="py-1 px-2.5 border-r border-slate-900">Designation</th>
                <th className="py-1 px-1.5 border-r border-slate-900 text-center w-16">Type</th>
                <th className="py-1 px-2 border-r border-slate-900 text-center w-24">In-Time</th>
                <th className="py-1 px-2 border-r border-slate-900 text-center w-24">Out-Time</th>
                <th className="py-1 px-2 text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-slate-500 border border-slate-900 bg-white">
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
                    <td className="py-0.5 px-2.5 border-r border-slate-800 text-slate-800">
                      {item.designation}
                    </td>
                    <td className="py-0.5 px-1.5 border-r border-slate-800 text-center text-[9px] font-semibold text-slate-600 uppercase">
                      {item.type}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-800 text-center font-mono font-semibold text-[10px]">
                      {item.inTime || '-'}
                    </td>
                    <td className="py-0.5 px-2 border-r border-slate-800 text-center font-mono text-[10px]">
                      {item.outTime || '-'}
                    </td>
                    {/* Status: Clean bold text, NO BORDER */}
                    <td className="py-0.5 px-2 text-center font-bold text-[10px] uppercase">
                      <span
                        className={
                          item.status === 'PRESENT'
                            ? 'text-emerald-700'
                            : item.status === 'LATE'
                            ? 'text-amber-700'
                            : item.status === 'UNDER_REVIEW'
                            ? 'text-purple-700'
                            : 'text-rose-700'
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Always anchored flush at the page bottom */}
        <div className="w-full print-footer-anchor mt-auto pt-4 pb-0 mb-0">
          {/* Signature & Authentication Section */}
          <div className="flex items-end justify-between text-center text-xs pb-0 mb-0">
            <div className="w-48">
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-950 text-[11px]">
                Prepared By
              </div>
              <div className="text-[9px] text-slate-600">Office Assistant</div>
            </div>
            <div className="w-48">
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-950 text-[11px]">
                Checked & Verified By
              </div>
              <div className="text-[9px] text-slate-600">Attendance In-Charge</div>
            </div>
            <div className="w-48">
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-950 text-[11px]">
                Headmistress / Principal
              </div>
              <div className="text-[9px] text-slate-600">Seal & Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

