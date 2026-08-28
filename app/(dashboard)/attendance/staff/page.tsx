'use client';

import { APP_CONFIG, ATTENDANCE_STATUS_LABELS } from '@/lib/constants';
import { format } from 'date-fns';
import {
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
    <div className="space-y-6">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      {/* Main Table / Printable Sheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
        <div className="text-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="YWCA Logo" className="w-12 h-12 object-contain mb-1.5" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            {APP_CONFIG.name}
          </h2>
          <p className="text-xs text-slate-500">{APP_CONFIG.address}</p>
          <div className="mt-2 inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Date: {format(new Date(date), 'dd MMMM yyyy (EEEE)')}</span>
            <span>•</span>
            <span>Staff Attendance Register</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 font-bold border-b border-slate-200 dark:border-slate-800 uppercase">
              <tr>
                <th className="px-3 py-2 border-r">Code</th>
                <th className="px-3 py-2 border-r">Staff Name</th>
                <th className="px-3 py-2 border-r">Designation</th>
                <th className="px-3 py-2 border-r">Type</th>
                <th className="px-3 py-2 border-r">Status</th>
                <th className="px-3 py-2 border-r">In-Time</th>
                <th className="px-3 py-2 border-r">Out-Time</th>
                <th className="px-3 py-2">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                    Loading staff attendance...
                  </td>
                </tr>
              ) : report.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No staff records found.
                  </td>
                </tr>
              ) : (
                report.map((item) => {
                  const statusInfo = ATTENDANCE_STATUS_LABELS[item.status] || {
                    label: item.status,
                    color: 'bg-slate-100 text-slate-600',
                  };
                  return (
                    <tr key={item.employeeId} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-mono text-indigo-600 border-r">
                        {item.employeeCode}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r">
                        {item.name}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 border-r">
                        {item.designation}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 border-r">
                        {item.type}
                      </td>
                      <td className="px-3 py-2.5 border-r">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300 border-r">
                        {item.inTime}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300 border-r">
                        {item.outTime}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
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
    </div>
  );
}

